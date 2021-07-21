import http from 'k6/http';
import { check, fail, sleep } from 'k6';

export const options = {
  iterations: 20,
  vus: 1,
};

// `setup` creates a database. `teardown` will delete the database.
export function setup() {
  // Use a random string in the database name prefix to avoid clashing with
  // pre-existing database names.
  const databaseName = `database-${Math.random().toString(36).substring(2)}`;

  // Create the database
  const body = { comment: 'New database', label: databaseName };
  const params = { headers: { 'Content-Type': 'application/json' } };

  const response =
    http.post(
      `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`,
      JSON.stringify(body), params);
  if (response.status !== 200) {
    fail('could not create database');
  }

  return {
    databaseName: databaseName,
  };
}

// `default` gets the document list with the default parameters.
export default function (data) {
  const response =
    http.get(`http://admin:root@127.0.0.1:6363/api/document/admin/${data.databaseName}`);
  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

// `teardown` deletes the database created by `setup`.
export function teardown(data) {
  // Delete the database
  const response =
    http.del(`http://admin:root@127.0.0.1:6363/api/db/admin/${data.databaseName}`);
  if (response.status !== 200) {
    fail('could not delete database');
  }
}
