const { Client } = require('pg');


const options = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_SSL === undefined || process.env.DATABASE_SSL.toLowerCase() === 'true') {
  options.ssl = true;
}

const client = new Client(options);

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