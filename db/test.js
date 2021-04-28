const { Client } = require("pg");

const options = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_SSL === undefined || process.env.DATABASE_SSL.toLowerCase() === 'true') {
  options.ssl = true;
}

const client = new Client(options);

client.connect();

module.exports = client;