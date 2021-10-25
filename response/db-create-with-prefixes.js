// Database create with prefixes
// * Use default parameters except for prefixes

import { sleep } from 'k6'
import * as lib from '../lib.js'
import * as api from '../api.js'

export const options = lib.assignDefaultScenarioThreshold(lib.defaultOptions)

// setup:
// 1. Define a unique database name.
export function setup () {
  return lib.assignDatabaseNamePrefix({})
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

export { handleSummary } from '../lib.js'
