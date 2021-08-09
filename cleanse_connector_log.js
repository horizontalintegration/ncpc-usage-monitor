require('dotenv').config();
//const db = require("./db");
const { Client } = require('pg');
const internaldb = require("./db/internal");
const dateFormat = require('dateformat');
let DEBUG = process.env.DEBUG;

const cleanseLogRecords = async function (){
    var date = new Date();
    var twoDaysAgo = dateFormat((date.getDate() - 2), "mm-dd-yyyy");
    console.log("twoDaysAgo",twoDaysAgo);

    // will delete all records from the database that are of status 200 
    // successfull that happened more then 2 days ago
    const deleteLogs = `
        DELETE
        FROM public.connector_logs
        WHERE 
            connector_logs."status" = '200' AND
            connector_logs."dateadded" < '${twoDaysAgo}'
    `;
    const results_deleteLogs = await internaldb.query(deleteLogs);

    console.log("results",results_deleteLogs);
}

cleanseLogRecords()