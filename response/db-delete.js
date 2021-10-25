// Database delete

import { sleep } from 'k6'
import * as lib from '../lib.js'
import * as api from '../api.js'

export const options = lib.assignDefaultScenarioThreshold(lib.defaultOptions)

// setup:
// 1. Define a unique database name.
// 2. Create the databases for all iterations.
export function setup () {
  const cfg = lib.assignDatabaseNamePrefix({})
  api.dbCreateAllIterations(cfg, options.iterations)
  return cfg
}

// default:
// 1. Delete the database for this iteration.
export default function (cfg) {
  api.dbDelete(cfg, __ITER)
  sleep(1)
}

export { handleSummary } from '../lib.js'
