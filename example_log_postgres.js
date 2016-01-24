var alog = require('./lib/auditlog');

alog.addTransport("postgres", {tableName:"vault_audit",connectionString:"postgres://postgres:postgres@localhost:5433/digi_vault_ui_api", debug:false});
alog.addTransport("console");
setTimeout(function(){
    alog.logEvent( '100', 'origin', 'someaction', 'somelabel', '{obj:value}', 'desc');
},2000);
