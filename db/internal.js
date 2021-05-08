const { Client } = require("pg");

const client = new Client({
    //connectionString: 'postgres://tfbyjlcnynawyh:7f961d7691be42ab2f7187ab3f03b770c55a1626466190929da6d7fb99d73596@ec2-23-21-229-200.compute-1.amazonaws.com:5432/dd8q3btk67ctro',
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
  });

client.connect();

module.exports = client;