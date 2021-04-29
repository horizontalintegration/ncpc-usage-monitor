require('dotenv').config();

const express = require('express');
// const path = require('path');
const dateFormat = require('dateformat');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + '/public'));

app.get('/', async function(req, res, next) {
  try {
    //var dbConn = db.internaldb;
    //console.log("dbConn " + JSON.stringify(dbConn));

    const asset = await db.query("SELECT * FROM horizontal.asset WHERE active__c = 'True'");
    console.log("Asset "+JSON.stringify(asset.rows));

    console.log("db var ",db);

      /*if (asset.rows.length > 0) {
          for(var i=0; i<asset.rows.length; i++){
            var customerId;
            const customerRecord = `
              SELECT *
              FROM public.customer
              WHERE assetsfid = '${asset.rows[i].sfid}'
            `;
            const results_customerRecord = await db.query(customerRecord);

            customerId = results_customerRecord.rows[0].id;

            if(results_customerRecord.rows.length == 0){
              // insert new customer record with details from the asset record
              const query_insertCustomer = `
                INSERT INTO 
                public.customer (
                  clientId,
                  clientName,
                  dbURL,
                  clientSchema,
                  sfAccountName,
                  assetId)
                VALUES 
                [${asset.rows[i].sfid}, ${asset.rows[i].schema_name__c}, '', ${asset.rows[i].schema_name__c}, ${asset.rows[i].accountid}, ${asset.rows[i].sfid}]
              `;
              const results_insertCustomer = await db.internaldb.query(query_insertCustomer);

              customerId = results_insertCustomer.rows[0].id;
            }

            if(customerId){
              pullCustomerUsage(asset.rows[i], customerId);
            }
          }
          console.log("All updates made.");
          setTimeout((function() {
              return process.exit(22);
          }), 15000);
      }*/

  } catch (err) {
    console.log(err);
    res.status(err.status || 500).send(err);
  }
})

const pullCustomerUsage = async function (asset, customerId) {
  try{
      // connect to the right db for asset
      const proddb = proddb(asset.dbURL);

      // query db and schema for usage information
      const contacts = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".contact");
      const leads = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".lead");
      const campaignmembers = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".campaignmember");
      const subscriptions = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_subscription__c");
      const interests = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_interest__c");
      const summary = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_summary__c");
      const result = await proddb.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_result__c");

      const totalUsage = Number(subscriptions.rows[0].count) + Number(interests.rows[0].count) + Number(contacts.rows[0].count) + Number(leads.rows[0].count) + Number(campaignmembers.rows[0].count) + Number(summary.rows[0].count) + Number(result.rows[0].count);
      console.log("Total Usage "+JSON.stringify(totalUsage));

      const tableValues = {
        "contacts": Number(contacts.rows[0].count), 
        "leads": Number(contacts.rows[0].count),
        "campaignmembers": Number(campaignmembers.rows[0].count),
        "subscriptions": Number(subscriptions.rows[0].count),
        "summary": Number(summary.rows[0].count),
        "result": Number(results.rows[0].count),
        "total": totalUsage
      };
    
    //console.log("Subscriptions Count - "+asset.schema_name__c+" - "+JSON.stringify(subscriptions.rows[0].count));

    const updateCustomer = updateCustomerUsage(asset, tableValues);
    const insertCustomerSnapshot = insertCustomerUsageSnapshot(asset, tableValues);
    
  }catch(err){
    console.log("Error  "+JSON.stringify(err));
  }
}

const updateCustomerUsage = async function (asset, tableValues){
  try{
    const update_customerUsage = await db.internaldb.query(
        "UPDATE ncpc_usage.customer_usage SET contact_table=$1, lead_table=$2, subscription_table=$3, interest_table=$4, campaignmember_table=$5, summary_table=$6, result_table=$7 total_usage=$8 WHERE sfid=$9 RETURNING *",
        [tableValues.contacts, tableValues.leads, tableValues.subscriptions, tableValues.interests, tableValues.campaignmembers, tableValues.summary, tableValues.result, tableValues.total, asset.sfid]
    );
    const results_customerUsage = await db.internaldb.query(update_customerUsage);

    if(results_customerUsage.rows){updateAssetUsage(asset, tableValues);}
    console.log("DEBUG updateCustomerUsage ",results_customerUsage);
  }catch(err){
    console.log("Error  "+JSON.stringify(err));
  }
}

const insertCustomerUsageSnapshot = async function (asset, tableValues){
  try{
    const query_insertSnapshot = `
        INSERT INTO 
        public.customer_usage_snapshot (
          sfid,
          name,
          subscription_table,
          interest_table,
          contact_table,
          lead_table,
          campaignmember_table,
          summary_table,
          result_table,
          total_usage)
        VALUES 
        (${asset.sfid}, ${asset.schema_name__c}, ${tableValues.subscriptions}, ${tableValues.interests}, ${tableValues.contacts}, ${tableValues.leads}, ${tableValues.campaignmembers}, ${tableValues.summary}, ${tableValues.result}, ${tableValues.total})
      `;
    const results_insertSnapshot = await db.internaldb.query(query_insertSnapshot);
    console.log("DEBUG insertCustomerUsageSnapshot ",results_insertSnapshot);
  }catch(err){
    console.log("Error  "+JSON.stringify(err));
  }
}

const updateAssetUsage = async function (asset, tableValues){
  try{
    var today = dateFormat(new Date(), "yyyy-mm-dd");

    const update_asset = db.internaldb.query(
      "UPDATE horizontal.asset SET current_volume__c=$1, usage_updated_date__c=$2 WHERE sfid=$3 RETURNING *",
      [tableValues.total, today, asset.sfid]
    );
    const results_asset = await db.internaldb.query(update_asset);  

    console.log("DEBUG updateCustomerUsage ",results_asset);
  }catch(err){
    console.log("Error  "+JSON.stringify(err));
  } 
}

app.listen(process.env.PORT || 5000);
