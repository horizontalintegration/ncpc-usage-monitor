const { Pool, Client } = require('pg')
const pool = new Pool({
  connectionString,
})

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

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