#!/usr/bin/env bash

if [ $# -ne 1 ]; then
  echo "$0: expected single argument: a JSON file name"
  exit 1
fi

file="$1"

# shellcheck disable=SC2162
read -d '' filter_metrics << EOF
. |
select(.type == "Point" and .metric == "http_req_duration") |
{
  id: (.data.tags.method + ":" + .data.tags.api),
  http_req_duration: .data.value
}
EOF

# Definitions:
#
# percentile: Calculate percentile according to NIST:
#   - `p`th percent of `n` values in an array are less than the result
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
# Replace each group with one object for that id and one set of metrics
map({
  # Use the first id in the (non-empty) group
  id: .[0].id,
  # Aggregate the metrics of the group in one object
  http_req_duration: (
    map(.http_req_duration) |
    length as \$len |
    sort |
    {
      med: (. | percentile(50; \$len) | round3),
      "p(90)": (. | percentile(90; \$len) | round3),
      min: (.[0] | round3),
      max: (.[-1 | round3])
    }
  )
})
EOF

jq --compact-output "$filter_metrics" "$file" |  \
jq --slurp "$group_by_id_and_calculate_stats"
