var pg = require('pg');
var util = require('util');
var async = require('async');

/* PostgresTransport
 *
 * A Postgres storage handler for Audit-Log for Node.js
 *
 */
PostgresTransport = function(options) {
    this.name = 'postgres';
    this._options = { tableName:'audit_log', connectionString:'', debug: false };
    this._connection;
    var self = this;
    var connString;
    var tableName;

    // override default options with the provided values
    if(typeof options !== 'undefined') {
        for(var attr in options) {
            this._options[attr] = options[attr];
        }
    }

    //set connection string
    connString = this._options.connectionString;
    tableName = this._options.tableName;

    // verify if tables exists
    checkDbExistance(this._options.tableName,function(err,result){
        if(err)return cb(err);
        if(!result)init(function(err,creationResult){
            if(err)return console.log(err);
            console.log(creationResult);
        });
    });

    this.emit = function( dataObject ) {
        this.debugMessage('emit: '+util.inspect(dataObject));
        pg.connect(connString, function (err, client, done) {
            if (err) {return console.error(err.message);}
            client.query('INSERT INTO '+tableName+' (actor,ts,origin,action,label,object,description) VALUES ($1,$2,$3,$4,$5,$6,$7);',
                [dataObject.actor,new Date(),dataObject.origin
                    ,dataObject.action,dataObject.label,dataObject.object,dataObject.description],function(err,result){
                    if(err) console.log('error saving event to database: '+err.message);
                });
        });
    }



    this.debugMessage = function(msg) { if(this._options.debug) console.log('Audit-Log(postgres): '+msg); }

    function initCreate(cb){
        execQuery('CREATE TABLE IF NOT EXISTS '+tableName+' (actor VARCHAR(255) NOT NULL, ts TIMESTAMP WITHOUT TIME ZONE NOT NULL, origin VARCHAR(255) NULL, action VARCHAR(255) NULL, label VARCHAR(255) NULL, object TEXT NULL, description VARCHAR(255) NULL);');
        cb(null,'tables created');
    }

    function initIndexation(cb){
        execQuery('CREATE INDEX IDX_audit_log_1 ON '+tableName+'(actor,ts);');
        cb(null,'index created');
    }

    function checkDbExistance (tableName,cb){
        pg.connect(connString,function(err,client,done){
            if(err)return console.error(err.message);
            client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ($1))",[tableName],function(err,result){
                done();return cb(null,result.rows[0].exists);//verify if db returs true/false for the table lookup
                if(err)return cb(err);
            });
        });
    }

    function initPrimaryKeys(cb){
        execQuery('ALTER TABLE '+tableName+' ADD PRIMARY KEY (actor,ts)');
        cb(null,'primary keys created');
    }

    function execQuery(query) {
        pg.connect(connString, function (err, client, done) {
            if (err) {return console.error(err.message);}
            client.query(query, function (err, result) {
                done();
                if (err) {return console.error(err.message);}
            });
        });
    }

    function init (cb){
        async.series([
            initCreate,
            initPrimaryKeys,
            initIndexation
        ], function(err, results) {
            if (err) {
                console.log(err);
                cb(err);
            }
            else {
                cb(null, results);
            }
        });
    }

    return this;
}


exports = module.exports = PostgresTransport;