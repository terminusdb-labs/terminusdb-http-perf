// Library module with common functionality.

// assignDatabaseNamePrefix:
// - Create a property with the key `databaseNamePrefix` that will be used by
//   `databaseNameOfIter` to produce the database name.
// - Use this in `setup`.
export function assignDatabaseNamePrefix(cfg) {
  return Object.assign(cfg, {
    // Use a random string to avoid clashes with existing database names.
    databaseNamePrefix: `database-${Math.random().toString(36).substring(2)}`,
  })
}

// databaseNameOfIter:
// - Generate a database name with the `databaseNamePrefix` and the iteration.
// - Use this in `default` and `teardown`.
export function databaseNameOfIter (cfg, iter) {
  return `${cfg.databaseNamePrefix}-${iter}`
}
