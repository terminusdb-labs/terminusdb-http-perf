// Database create with prefixes
// * Use default parameters except for prefixes

import { sleep } from 'k6'
import { assignDatabaseNamePrefix, assignDefaultScenarioThreshold, handleSummary } from '../lib.js'
import * as api from '../api.js'

export const options = assignDefaultScenarioThreshold({})

// setup:
// 1. Define a unique database name.
export function setup () {
  return assignDatabaseNamePrefix({})
}

// default:
// 1. Create the database with prefixes for this iteration.
export default function (cfg) {
  api.dbCreateWithPrefixes(cfg, __ITER)
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
