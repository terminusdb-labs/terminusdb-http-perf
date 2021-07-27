import { Httpx } from 'https://jslib.k6.io/httpx/0.0.5/index.js'
import { databaseNameOfIter } from './lib.js'

const successStatus = 200

class Http extends Httpx {
  constructor () {
    super({
      baseURL: 'http://admin:root@127.0.0.1:6363/api',
      headers: {
        'User-Agent': 'terminusdb-k6',
      },
    })
  }

  get (url, body, options) {
    options = options || {}
    const status = options.status || successStatus
    const response = super.get(url, body)
    if (response.status !== status) {
      throw new Error(`unexpected status: ${this.baseURL}${url}: ${response.status}`)
    }
    return response
  }

  post (url, body, options) {
    options = options || {}
    const status = options.status || successStatus
    super.addHeader('Content-Type', 'application/json')
    const response = super.post(url, body)
    if (response.status !== status) {
      throw new Error(`unexpected status: ${this.baseURL}${url}: ${response.status}`)
    }
    super.clearHeader('Content-Type')
    return response
  }

  delete (url, options) {
    options = options || {}
    const status = options.status || successStatus
    const response = super.delete(url)
    if (response.status !== status) {
      throw new Error(`unexpected status: ${this.baseURL}${url}: ${response.status}`)
    }
    return response
  }
}

const http = new Http()

export function ok () {
  http.get('/ok')
}

export function info () {
  http.get('/info')
}

const dbCreateDefaultBody = {
  comment: 'comment',
  label: 'label',
}

const dbCreateDefaultPrefixes = {
  prefixes: {
    '@base': 'http://i/',
    '@schema': 'http://s/',
  },
}

export function dbCreate (cfg, iter, data) {
  data = data || {}
  const body = Object.assign({}, dbCreateDefaultBody, data)
  http.post(`/db/admin/${databaseNameOfIter(cfg, iter)}`, JSON.stringify(body))
}

export function dbCreateAllIterations (cfg, iterations, data) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbCreate(cfg, iter, data)
  }
}

export function dbCreateWithPrefixes (cfg, iter, data) {
  dbCreate(cfg, iter, Object.assign(dbCreateDefaultPrefixes, data))
}

export function dbCreateWithPrefixesAllIterations (cfg, iterations, data) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbCreateWithPrefixes(cfg, iter, data)
  }
}

export function dbDelete (cfg, iter) {
  http.delete(`/db/admin/${databaseNameOfIter(cfg, iter)}`)
}

export function dbDeleteAllIterations (cfg, iterations) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbDelete(cfg, iter)
  }
}

export function prefixes (cfg, iter) {
  http.get(`/prefixes/admin/${databaseNameOfIter(cfg, iter)}`)
}

export function documentStream (cfg, iter) {
  http.get(`/document/admin/${databaseNameOfIter(cfg, iter)}`)
}

export function documentCreateSchema (cfg, iter, schema) {
  http.post(`/document/admin/${databaseNameOfIter(cfg, iter)}?graph_type=schema&author=test&message=test`, schema)
}
