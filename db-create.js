// Database create response time.
//
// Look at { scenario:default } under `http_req_duration`.

import http from 'k6/http';
import { fail, sleep } from 'k6';

export let options = {
  // See <https://community.k6.io/t/ignore-http-calls-made-in-setup-or-teardown-in-results/878/2>
  // This allows us to look at only the HTTP requests in `default` and ignore
  // the longer times in `setup`, which involve creating the database.
  thresholds: {
    'http_req_duration{scenario:default}': ['max>=0'],
  },
};

function databaseNameOfIter(data, iter) {
  return `${data.databaseNamePrefix}-${iter}`;
}

// setup:
// 1. Define a unique database name prefix to avoid name clashes.
export function setup() {
  return {
    databaseNamePrefix: `database-${Math.random().toString(36).substring(2)}`,
  };
}

const params = { headers: { 'Content-Type': 'application/json' } };

// default:
// 1. Create the database for this iteration.
export default function (data) {
  const databaseName = databaseNameOfIter(data, __ITER);
  const url = `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`;
  const body = JSON.stringify({ comment: 'comment', label: databaseName });
  http.post(url, body, params).status === 200 ||
    fail(`could not create: ${databaseName}`);
  sleep(1);
}

// teardown:
// 1. Delete the databases for all iterations.
export function teardown(data) {
  for (let iter = 0; iter < (options.iterations || 1); iter++) {
    const databaseName = databaseNameOfIter(data, iter);
    const url = `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`;
    http.del(url).status === 200 ||
      fail(`could not delete: ${databaseName}`);
  }
}
