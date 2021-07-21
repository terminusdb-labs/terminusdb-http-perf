import http from 'k6/http';
import { check, sleep } from 'k6';

export function setup() {
  return {
    // A random string hopefully unique to this run.
    rand: Math.random().toString(36).substring(2)
  };
}

export default function (data) {
  // Use a random string in the database name to avoid clashing with
  // pre-existing database names.
  const databaseName = `database-${data.rand}-${__VU + __ITER}`;

  const body = { comment: 'New database', label: databaseName };
  const params = { headers: { 'Content-Type': 'application/json' } };

  const response =
    http.post(
      `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`,
      JSON.stringify(body), params);

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
