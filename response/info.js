// Info

import http from 'k6/http'
import { fail, sleep } from 'k6'
import { handleSummary } from '../lib.js'

// default:
// 1. Send GET to `/api/info`.
export default function () {
  const status = http.get('http://127.0.0.1:6363/api/info').status
  status === 200 ||
    fail(`unexpected status: ${status}`)
  sleep(1)
}

export {
  handleSummary,
}
