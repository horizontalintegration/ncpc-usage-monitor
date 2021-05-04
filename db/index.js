const { Client } = require('pg');

let connString;
if (customerDetails.dbUrl in process.env) {
  connString = process.env[customerDetails.dbUrl];
}

const options = {
  connectionString: connString,
};

if (process.env.DATABASE_SSL === undefined || process.env.DATABASE_SSL.toLowerCase() === 'true') {
  options.ssl = true;
}

const client = new Client(options);

client.connect();

module.exports = client;