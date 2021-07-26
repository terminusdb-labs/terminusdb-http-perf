
// Document - create schema
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

const params = { headers: { 'Content-Type': 'application/json' } }

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
      prefixes: {
        '@base': 'http://i/',
        '@schema': 'http://s/',
      },
    })
    http.post(url, body, params).status === 200 ||
      fail(`could not create: ${databaseName}`)
  }

  return cfg
}

function toJSONStream (arr) {
  const result = []
  for (const obj of arr) {
    result.push(JSON.stringify(obj))
  }
  return result.join('\n')
}

const bodyDefault = toJSONStream([{
  '@id': 'Person',
  '@type': 'Class',
  name: 'xsd:string',
  birthdate: 'xsd:date',
  friends: {
    '@type': 'Set',
    '@class': 'Person',
  },
}, {
  '@id': 'Employee',
  '@type': 'Class',
  '@inherits': 'Person',
  staff_number: 'xsd:string',
  boss: {
    '@type': 'Optional',
    '@class': 'Employee',
  },
  tasks: {
    '@type': 'List',
    '@class': 'Task',
  },
}, {
  '@id': 'Task',
  '@type': 'Class',
  name: 'xsd:string',
}, {
  '@id': 'Criminal',
  '@type': 'Class',
  '@inherits': 'Person',
  aliases: {
    '@type': 'List',
  },
}])

// default:
// 1. Create the schema.
export default function (cfg) {
  const databaseName = databaseNameOfIter(cfg, __ITER)
  const url = `http://admin:root@127.0.0.1:6363/api/document/admin/${databaseName}?graph_type=schema&author=test&message=test`
  http.post(url, bodyDefault, params).status === 200 ||
    fail(`could not create schema: ${databaseName}`)
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
