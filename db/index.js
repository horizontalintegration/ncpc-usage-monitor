const { Client } = require('pg');

function internaldb(){
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();
}

function proddb(db_url){
  const client = new Client({
    connectionString: process.env + db_url,
    ssl: true
  });

  client.connect();
}

function prod1db(db_url){
  const client = new Client({
    connectionString: process.env.HEROKU_POSTGRESQL_CRIMSON_URL,
    ssl: true
  });

  client.connect();
}

function prod2db(){
  const client = new Client({
    connectionString: process.env.HEROKU_POSTGRESQL_ORANGE_URL,
    ssl: true
  });

  client.connect();
}

module.exports = {
  internaldb,
  proddb
};