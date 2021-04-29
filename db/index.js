const { Client } = require('pg');


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client
.connect()
.then(() => console.log('PostgreSQL Connected'))
.catch((err) => console.error('PostgreSQL Connection Error', err.stack));

/*
function proddb(db_url){
  const client = new Client({
    connectionString: db_url,
    ssl: true
  });

  client.connect();

  return client;
}

module.exports = {
  internaldb
};*/

module.exports = client;