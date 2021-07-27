// Prefix stream
// * Use default parameters
// * Prefix stream will have default

import { sleep } from 'k6'
import { assignDatabaseNamePrefix, assignDefaultScenarioThreshold, handleSummary } from '../lib.js'
import * as api from '../api.js'

export const options = assignDefaultScenarioThreshold({})

// setup:
// 1. Define a unique database name.
// 2. Create the databases for all iterations.
export function setup () {
  const cfg = assignDatabaseNamePrefix({})
  api.dbCreateWithPrefixesAllIterations(cfg, options.iterations)
  return cfg
}

// default:
// 1. Get the prefixes with the default parameters.
export default function (cfg) {
  api.prefixes(cfg, __ITER)
  sleep(1)
}

// teardown:
// 1. Delete the databases for all iterations.
export function teardown (cfg) {
  api.dbDeleteAllIterations(cfg, options.iterations)
}

export {
  handleSummary,
}
