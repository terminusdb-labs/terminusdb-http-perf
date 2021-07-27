// Synchronize each of the `.json` and `.ndjson` files in the `json` directory.

const fs = require('fs')
const oboe = require('oboe')
const readdir = require('recursive-readdir')

// Walk the directory recursively.
readdir('./json', (err, files) => {
  if (err) {
    throw err
  }

  // For each JSON file...
  files.forEach(json => {
    if (json.endsWith('.json')) {
      // File names for the outputs
      const baseDot = json.slice(0, -4)
      const ndjson = baseDot + 'ndjson'
      const pretty = baseDot + 'pretty'

      // Streams for the input and outputs
      const jsonStream = fs.createReadStream(json)
      const ndjsonStream = fs.createWriteStream(ndjson)
      const prettyStream = fs.createWriteStream(pretty)

      // Parse the input JSON stream and write one object at a time to each of
      // the outputs.
      oboe(jsonStream)
        .done(obj => {
          ndjsonStream.write(JSON.stringify(obj) + '\n') // compact, one object per line
          prettyStream.write(JSON.stringify(obj, null, 2) + '\n') // pretty, 2 space indent
        })
        .fail(err => {
          throw err
        })

      // After the input JSON stream is finished, close the output streams, and
      // replace the input JSON file with the pretty JSON file.
      jsonStream.on('end', () => {
        ndjsonStream.end()
        prettyStream.end()
        prettyStream.on('finish', () => {
          fs.rename(pretty, json, err => {
            if (err) {
              throw err
            }
          })
        })
      })
    }
  })
})
