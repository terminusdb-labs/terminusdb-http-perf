// Document - create schema
// * Use default parameters except for prefixes

import { sleep } from 'k6'
import * as lib from '../lib.js'
import * as api from '../api.js'

export const options = lib.assignDefaultScenarioThreshold(lib.defaultOptions)

// setup:
// 1. Define a unique database name.
// 2. Create the databases for all iterations.
export function setup () {
  const cfg = lib.assignDatabaseNamePrefix({})
  api.dbCreateWithPrefixesAllIterations(cfg, options.iterations)
  return cfg
}

const schema = open('../json/schema/one.json')

// default:
// 1. Create the schema.
export default function (cfg) {
  api.documentPostSchema(cfg, __ITER, schema)
  sleep(1)
}

// teardown:
// 1. Delete the databases for all iterations.
export function teardown (cfg) {
  api.dbDeleteAllIterations(cfg, options.iterations)
}

export { handleSummary } from '../lib.js'
