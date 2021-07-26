// Ok

import http from 'k6/http'
import { fail, sleep } from 'k6'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

// default:
// 1. Send GET to `/api/ok`.
export default function () {
  const status = http.get('http://127.0.0.1:6363/api/ok').status
  status === 200 ||
    fail(`unexpected status: ${status}`)
  sleep(1)
}

export function handleSummary (data) {
  data.metrics = {
    http_req_duration: data.metrics.http_req_duration,
  }
  return {
    stdout: textSummary(data, { enableColors: true }),
  }
}
