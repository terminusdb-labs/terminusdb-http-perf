import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const rand = Math.random().toString(36);
  const databaseName = `database-${__VU}-${__ITER}-${rand}`;
  const body = { comment: 'New database', label: databaseName };
  const params = { headers: { 'Content-Type': 'application/json' } };

  let response1 =
    http.post(
      `http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`,
      JSON.stringify(body), params);

  check(response1, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);

  let response2 =
    http.del(`http://admin:root@127.0.0.1:6363/api/db/admin/${databaseName}`);

  check(response2, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
