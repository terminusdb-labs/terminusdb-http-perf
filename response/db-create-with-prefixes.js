// Database create with prefixes
// * Use default parameters except for prefixes
//
// Look at { scenario:default } under `http_req_duration`.

import http from 'k6/http'
import { fail, sleep } from 'k6'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'
import { assignDatabaseNamePrefix, databaseNameOfIter } from '../lib.js'

export const options = {
  // See <https://community.k6.io/t/ignore-http-calls-made-in-setup-or-teardown-in-results/878/2>
  // This allows us to look at only the HTTP requests in `default` and ignore
  // the longer times in `setup`, which involve creating the database.
  thresholds: {
    'http_req_duration{scenario:default}': ['max>=0'],
  },
}

// setup:
// 1. Define a unique database name.
export function setup () {
  return assignDatabaseNamePrefix({})
}

const params = { headers: { 'Content-Type': 'application/json' } }

// default:
// 1. Create the database for this iteration.
export default function (cfg) {
  const databaseName = databaseNameOfIter(cfg, __ITER)
  const url = `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`
  const body = JSON.stringify({
    comment: 'comment',
    label: databaseName,
    prefixes: {
      '@base': 'http://i/',
      '@schema': 'http://s/',
    },
  })
  http.post(url, body, params).status === 200 ||
    fail(`could not create: ${databaseName}`)
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

export function handleSummary (data) {
  data.metrics = {
    http_req_duration: data.metrics['http_req_duration{scenario:default}'],
  }
  return {
    stdout: textSummary(data, { enableColors: true }),
  }
}
