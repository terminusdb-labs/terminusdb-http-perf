// Info

import { sleep } from 'k6'
import * as api from '../api.js'

// default:
// 1. Send GET to `/api/info`.
export default function () {
  api.info()
  sleep(1)
}

export { handleSummary } from '../lib.js'
