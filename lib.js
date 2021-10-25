// Library module with common functionality.

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

// assignDatabaseNamePrefix:
// - Create a property with the key `databaseNamePrefix` that will be used by
//   `databaseNameOfIter` to produce the database name.
// - Use this in `setup`.
export function assignDatabaseNamePrefix (cfg) {
  return Object.assign(cfg, {
    // Use a random string to avoid clashes with existing database names.
    databaseNamePrefix: `database-${Math.random().toString(36).substring(2)}`,
  })
}

// databaseNameOfIter:
// - Generate a database name with the `databaseNamePrefix` and the iteration.
// - Use this in `default` and `teardown`.
export function databaseNameOfIter (cfg, iter) {
  return `${cfg.databaseNamePrefix}-${iter}`
}

// This is the default set of options for all scripts.
export const defaultOptions = {
  // These are criteria specifying expectations of the system under test.
  thresholds: {
    // HTTP requests should never fail. If they do, abort.
    http_req_failed: [{ threshold: 'rate == 0', abortOnFail: true }],
  },
}

// assignDefaultScenarioThreshold:
// - See <https://community.k6.io/t/ignore-http-calls-made-in-setup-or-teardown-in-results/878/2>
//   This allows us to look at only the HTTP requests in `default` and ignore
//   the longer times in `setup`, which involve creating the database.
// - Use this in `options`.
export function assignDefaultScenarioThreshold (options) {
  options = options || {}
  options.thresholds = options.thresholds || {}
  Object.assign(options.thresholds, {
    'http_req_duration{scenario:default}': ['max>=0'],
  })
  return options
}

// handleSummary:
// - This is a common function to extract the `http_req_duration` metric of
//   interest.
// - If `assignDefaultScenarioThreshold` was used, this will get the desired
//   metric and report it as `http_req_duration`.
// - Export this directly.
export function handleSummary (data) {
  data.metrics = {
    http_req_duration: data.metrics['http_req_duration{scenario:default}'] || data.metrics.http_req_duration,
  }
  return {
    stdout: textSummary(data, { enableColors: true }),
  }
}
