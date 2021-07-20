import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const rand = Math.random().toString(36);
  const databaseName = `database-${__VU}-${__ITER}-${rand}`;
  const body = { comment: 'New database', label: databaseName };
  const params = { headers: { 'Content-Type': 'application/json' } };
  let response =
    http.post(
      `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`,
      JSON.stringify(body), params);
  sleep(1);

  // Verify response
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
