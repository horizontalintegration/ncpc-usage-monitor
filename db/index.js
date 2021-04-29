const { Client } = require('pg');


  const internaldb = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  internaldb
  .connect()
  .then(() => console.log('PostgreSQL Connected'))
  .catch((err) => console.error('PostgreSQL Connection Error', err.stack));


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
};