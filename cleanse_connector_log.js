require('dotenv').config();
//const db = require("./db");
const { Client } = require('pg');
const internaldb = require("./db/internal");
const dateFormat = require('dateformat');
let DEBUG = process.env.DEBUG;

async function cleanseLogRecords(){
    var date = new Date();
    var twoDaysAgo = dateFormat(date.setDate(date.getDate() - 2), "mm/dd/yyyy");
    
    console.log("twoDaysAgo",twoDaysAgo);

    const deleteLogs = `
        DELETE
        FROM public.connector_logs
        WHERE 
            connector_logs."status" = '200' AND
            connector_logs."dateadded" < '$1'
    `;
    const parameters = [twoDaysAgo];
    const results_deleteLogs = await internaldb.query(deleteLogs,parameters);

    console.log("results",results_deleteLogs);
}

cleanseLogRecords()