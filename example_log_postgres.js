var alog = require('./lib/auditlog');

alog.addTransport("postgres", {connectionString:"postgres://postgres:postgres@localhost:5433/digi_vault_ui_api", debug:false});
alog.addTransport("console");
alog.logEvent( '100', 'origin', 'someaction', 'somelabel', '{obj:value}', 'desc');