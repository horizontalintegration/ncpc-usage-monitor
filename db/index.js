const { Client } = require('pg');

function internaldb(){
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

  return client;
}

function proddb(db_url){
  const client = new Client({
    connectionString: db_url,
    ssl: true
  });

  client.connect();
}

module.exports = {
  internaldb: internaldb,
  proddb: internaldb,
};