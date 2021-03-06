// Consecutive tests of different operations

import * as k6 from 'k6'
import * as lib from '../lib.js'
import * as api from '../api.js'

export const options = lib.defaultOptions

// setup:
// 1. Define a unique database name.
export function setup () {
  return lib.assignDatabaseNamePrefix({ throw: true })
}

const schemaOne = open('../json/one/schema.json')
const schemaPerson = open('../json/person/schema.json')
const schemaWoql = open('../json/woql/schema.json')

// default:
export default function (cfg) {
  api.ok()
  k6.sleep(1)
  api.info()
  k6.sleep(1)
  api.dbCreate(cfg, __ITER)
  k6.sleep(1)
  api.dbDelete(cfg, __ITER)
  k6.sleep(1)
  api.dbCreateWithPrefixes(cfg, __ITER)
  k6.sleep(1)
  api.documentPostSchema(cfg, __ITER, schemaOne, { api: 'one' })
  k6.sleep(1)
  api.dbDelete(cfg, __ITER)
  k6.sleep(1)
  api.dbCreateWithPrefixes(cfg, __ITER)
  k6.sleep(1)
  api.documentPostSchema(cfg, __ITER, schemaPerson, { api: 'person' })
  k6.sleep(1)
  api.dbDelete(cfg, __ITER)
  k6.sleep(1)
  api.dbCreateWithPrefixes(cfg, __ITER)
  k6.sleep(1)
  api.documentPostSchema(cfg, __ITER, schemaWoql, { api: 'woql' })
  k6.sleep(1)
  api.dbDelete(cfg, __ITER)
  k6.sleep(1)
}
