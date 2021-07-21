import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  let response = http.get('http://127.0.0.1:6363/api/ok');
  sleep(1);

  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
