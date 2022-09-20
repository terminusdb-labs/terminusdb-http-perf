import { Httpx } from 'https://jslib.k6.io/httpx/0.0.5/index.js'
import { databaseNameOfIter } from './lib.js'

// Connection parameters with environment variables and defaults.
const proto = __ENV.TERMINUSDB_SERVER_PROTO || 'http'
const host = __ENV.TERMINUSDB_SERVER_HOST || '127.0.0.1'
const port = __ENV.TERMINUSDB_SERVER_PORT || '6363'
const user = __ENV.TERMINUSDB_SERVER_USER || 'admin'
const pass = __ENV.TERMINUSDB_SERVER_PASS || 'root'

const successStatus = 200

// Get the value for a key, if the property exists, and delete the property.
function extractProperty (obj, key) {
  const val = obj[key]
  delete obj[key]
  return val
}

// Get the URL path part that uniquely identifies the API operation.
function uniquePath (path) {
  return path.match(/(\/\w+\/\w+).*/)[1]
}

class Http extends Httpx {
  constructor () {
    super({
      baseURL: `${proto}://${user}:${pass}@${host}:${port}`,
      headers: {
        'User-Agent': 'terminusdb-k6',
      },
    })
  }

  checkStatus (url, status, response) {
    if (response.status !== status) {
      const msg = "expected status '" + status + "', got '" +
        response.status + "'\n<" + this.baseURL + url + '>\n' +
        JSON.stringify(JSON.parse(response.body), null, 2)
      throw new Error(msg)
    }
  }

  get (url, body, options) {
    options = options || {}
    const status = extractProperty(options, 'status') || successStatus
    const api = extractProperty(options, 'api') || ''
    options = Object.assign({ tags: { api: `${uniquePath(url)}:${api}` } }, options)

    const response = super.get(url, body, options)
    this.checkStatus(url, status, response)
    return response
  }

  post (url, body, options) {
    options = options || {}
    const status = extractProperty(options, 'status') || successStatus
    const api = extractProperty(options, 'api') || ''
    options = Object.assign({ tags: { api: `${uniquePath(url)}:${api}` } }, options)

    super.addHeader('Content-Type', 'application/json')
    const response = super.post(url, body, options)
    this.checkStatus(url, status, response)
    super.clearHeader('Content-Type')
    return response
  }

  delete (url, options) {
    options = options || {}
    const status = extractProperty(options, 'status') || successStatus
    const api = extractProperty(options, 'api') || ''
    options = Object.assign({ tags: { api: `${uniquePath(url)}:${api}` } }, options)

    const response = super.delete(url, null, options)
    this.checkStatus(url, status, response)
    return response
  }
}

const http = new Http()

export function ok () {
  http.get('/api/ok')
}

export function info () {
  http.get('/api/info')
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

export function dbCreate (cfg, iter, data, options) {
  data = data || {}
  const body = JSON.stringify(Object.assign({}, dbCreateDefaultBody, data))
  http.post(`/api/db/${user}/${databaseNameOfIter(cfg, iter)}`, body, options)
}

export function dbCreateAllIterations (cfg, iterations, data, options) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbCreate(cfg, iter, data, options)
  }
}

export function dbCreateWithPrefixes (cfg, iter, data, options) {
  const body = Object.assign(dbCreateDefaultPrefixes, data)
  options = Object.assign({ api: 'prefixes' }, options)
  dbCreate(cfg, iter, body, options)
}

export function dbCreateWithPrefixesAllIterations (cfg, iterations, data, options) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbCreateWithPrefixes(cfg, iter, data, options)
  }
}

export function dbDelete (cfg, iter, options) {
  http.delete(`/api/db/${user}/${databaseNameOfIter(cfg, iter)}`, options)
}

export function dbDeleteAllIterations (cfg, iterations, options) {
  for (let iter = 0; iter < (iterations || 1); iter++) {
    dbDelete(cfg, iter, options)
  }
}

export function prefixes (cfg, iter, options) {
  http.get(`/api/prefixes/${user}/${databaseNameOfIter(cfg, iter)}`, null, options)
}

export function documentStream (cfg, iter, options) {
  http.get(`/api/document/${user}/${databaseNameOfIter(cfg, iter)}`, null, options)
}

export function documentPostSchema (cfg, iter, schema, options) {
  http.post(
    `/api/document/${user}/${databaseNameOfIter(cfg, iter)}?graph_type=schema&author=test&message=test`,
    schema,
    options,
  )
}
