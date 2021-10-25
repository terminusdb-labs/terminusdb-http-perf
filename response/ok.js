// Ok

import { sleep } from 'k6'
import * as api from '../api.js'

// default:
// 1. Send GET to `/api/ok`.
export default function () {
  api.ok()
  sleep(1)
}

export { handleSummary } from '../lib.js'
