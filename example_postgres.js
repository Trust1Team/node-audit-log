var PostgresTransport = require('./lib/transport/postgres');

var options = {};
options.connectionString = "postgres://postgres:postgres@localhost:5433/digi_vault_ui_api";
options.debug=true;
var client = new PostgresTransport(options);
console.log(client);