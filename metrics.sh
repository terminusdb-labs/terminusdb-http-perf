#!/usr/bin/env bash

# Exit with error if the number of arguments is not equal to 1
if [ $# -ne 1 ]; then
  echo "$0: expected single argument: a JSON file name"
  exit 1
fi

# Save the file name
file="$1"

# shellcheck disable=SC2162
read -d '' filter_metrics << EOF
. |
select(.type == "Point" and .metric == "http_req_duration") |
{
  id: (.data.tags.api + ":" + .data.tags.method),
  http_req_duration: .data.value
}
EOF

# Definitions:
#
# percentile: Calculate percentile according to NIST:
#   - `p`th percent of `n` input values are <= the calculated result
#   - See <https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm>
#
# round3: round to 3 decimal places

# shellcheck disable=SC2162
read -d '' group_by_id_and_calculate_stats << EOF
def percentile(\$p; \$n):
  if \$p <= 0 then
    .[0]
  else
    # Percentile as position on a ranking from 1 to n+1
    ((\$n + 1) * \$p / 100) as \$pos |
    # Separate position into fractional and decimal parts
    (\$pos | modf) as [\$rank_frac, \$rank_dec] |
    if \$rank_dec == 0 then
      # Minimum
      .[0]
    elif \$rank_dec >= \$n then
      # Maximum
      .[-1]
    else
      # Somewhere in between
      .[\$rank_dec] as \$lo |
      .[\$rank_dec - 1] as \$hi |
      \$lo + \$rank_frac * (\$hi - \$lo)
    end
  end ;
def round3: . * 1000 | round | . / 1000 ;
. |
# Group the common id's in arrays
group_by(.id) |
# Replace each group with an object with an aggregate metric
map(
  # Use the first id in the (non-empty) group for the metric name
  (.[0].id + ":http_req_duration") as \$name_prefix |
  map(.http_req_duration) |
  length as \$len |
  sort |
  {
    name: (\$name_prefix + ":p(90)"),
    value: (. | percentile(90; \$len) | round3),
    unit: "ms"
    # TODO: range and extra properties
  }
)
EOF

# Exit on error
set -e

jq --exit-status --compact-output "$filter_metrics" "$file" |  \
jq --exit-status --slurp "$group_by_id_and_calculate_stats"
