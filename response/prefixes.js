// Prefix stream
// * Use default parameters
// * Prefix stream will have default

import http from 'k6/http'
import { fail, sleep } from 'k6'
import { assignDatabaseNamePrefix, assignDefaultScenarioThreshold, databaseNameOfIter, handleSummary } from '../lib.js'

export const options = assignDefaultScenarioThreshold({})

// setup:
// 1. Define a unique database name.
// 2. Create the databases for all iterations.
export function setup () {
  const cfg = assignDatabaseNamePrefix({})

  for (let iter = 0; iter < (options.iterations || 1); iter++) {
    const databaseName = databaseNameOfIter(cfg, iter)
    const url = `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`
    const body = JSON.stringify({
      comment: 'comment',
      label: databaseName,
    })
    const params = { headers: { 'Content-Type': 'application/json' } }
    http.post(url, body, params).status === 200 ||
      fail(`could not create: ${databaseName}`)
  }

  return cfg
}

// default:
// 1. Get the prefixes stream with the default parameters.
export default function (cfg) {
  const databaseName = databaseNameOfIter(cfg, __ITER)
  const url = `http://admin:root@127.0.0.1:6363/api/prefixes/admin/${databaseName}`
  http.get(url).status === 200 ||
    fail(`could not get prefixes stream: ${databaseName}`)
  sleep(1)
}

// teardown:
// 1. Delete the databases for all iterations.
export function teardown (cfg) {
  for (let iter = 0; iter < (options.iterations || 1); iter++) {
    const databaseName = databaseNameOfIter(cfg, iter)
    const url = `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`
    http.del(url).status === 200 ||
      fail(`could not delete: ${databaseName}`)
  }
}

export {
  handleSummary,
}
