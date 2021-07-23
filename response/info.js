// Info

import http from 'k6/http';
import { sleep } from 'k6';

// default:
// 1. Send GET to `/api/info`.
export default function () {
  const status = http.get('http://127.0.0.1:6363/api/info').status;
  status === 200 ||
    fail(`unexpected status: ${status}`);
  sleep(1);
}
