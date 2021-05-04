//const db = require("./db");
const { Client } = require('pg');
const internaldb = require("./db/internal");
const dateFormat = require('dateformat');


const getAssetRecords = async function (){
  try{
    const asset = await internaldb.query("SELECT * FROM horizontal.asset WHERE active__c = 'True' AND sfid = '02i1H00000y7utGQAQ'");

      if (asset.rows.length > 0) {
          for(var i=0; i<asset.rows.length; i++){
            let customerId;
            const customerRecord = `
              SELECT *
              FROM public.customer
              WHERE customer."assetId" = '${asset.rows[i].sfid}'
            `;
            const results_customerRecord = await internaldb.query(customerRecord);

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
              const results_insertCustomer = await internaldb.query(query_insertCustomer);

              customerId = results_insertCustomer.rows[0].id;
            }

            if(customerId){
              pullCustomerUsage(asset.rows[i], results_customerRecord.dbUrl, customerId);

              if(pullCustomerUsage){return true};
            }
          }
          console.log("All updates made.");
          setTimeout((function() {
              return process.exit(22);
          }), 15000);
      }
  } catch (err){
    console.log("Error in getAssetRecords: "+JSON.stringify(err));
  }
}

const pullCustomerUsage = async function (asset, dbUrl, customerId) {
    try{
      let connString;
      if (dbUrl in process.env) {
        connString = process.env[dbUrl];
      }else{
        connString = 'postgres://u8abtc187h14lj:pdd45f5983896cccea970dbea9b7c2be60a12bfbdabf6cb4ac61d9071b76da1f1@ec2-52-21-77-248.compute-1.amazonaws.com:5432/d4dpqs4699s6cg';
      }

      const options = {
        connectionString: connString,
      };

      if (process.env.DATABASE_SSL === undefined || process.env.DATABASE_SSL.toLowerCase() === 'true') {
        options.ssl = true;
      }

      const db = new Client(options);

      db.connect();

      // query db and schema for usage information
      const contacts = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".contact");
      const leads = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".lead");
      const campaignmembers = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".campaignmember");
      const subscriptions = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_subscription__c");
      const interests = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_interest__c");
      const summary = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_summary__c");
      const result = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_result__c");

      const totalUsage = Number(subscriptions.rows[0].count) + Number(interests.rows[0].count) + Number(contacts.rows[0].count) + Number(leads.rows[0].count) + Number(campaignmembers.rows[0].count) + Number(summary.rows[0].count) + Number(result.rows[0].count);
      console.log("Total Usage "+JSON.stringify(totalUsage));

      const tableValues = {
        contacts: Number(contacts.rows[0].count), 
        leads: Number(leads.rows[0].count),
        campaignmembers: Number(campaignmembers.rows[0].count),
        subscriptions: Number(subscriptions.rows[0].count),
        interests: Number(interests.rows[0].count),
        summary: Number(summary.rows[0].count),
        result: Number(result.rows[0].count),
        total: totalUsage
      };

      console.log("TableValues: ", tableValues);
      
      const updateCustomer = updateCustomerUsage(asset, tableValues);
      const insertCustomerSnapshot = insertCustomerUsageSnapshot(asset, tableValues);

      if(updateCustomer && insertCustomerSnapshot){return true};
      
    }catch(err){
      console.log("Error in pullCustomerUsage: ",err);
    }
  }
  
  const updateCustomerUsage = async function (asset, tableValues){
    try{
      const query_customerUsage = `
          UPDATE public.customer_usage SET 
            "contact_table"=$1, 
            "lead_table"=$2, 
            "subscription_table"=$3, 
            "interest_table"=$4, 
            "campaignmember_table"=$5, 
            "summary_table"=$6, 
            "result_table"=$7, 
            "total_usage"=$8 
          WHERE "sfid"=$9
      `;
      
      const queryparams = [tableValues.contacts, tableValues.leads, tableValues.subscriptions, tableValues.interests, tableValues.campaignmembers, tableValues.summary, tableValues.result, tableValues.total, asset.sfid];    
      const results_customerUsage = await internaldb.query(query_customerUsage,queryparams);

      console.log("Update successful for customer_usage record for ",asset.sfid);

      if(results_customerUsage.rows){
        const updateAsset = updateAssetUsage(asset, tableValues);
        if(updateAsset){return true};
      }

    }catch(err){
      console.log("Error in updateCustomerUsage: "+JSON.stringify(err));
    }
  }

  const insertCustomerUsageSnapshot = async function (asset, tableValues){
    try{
      var today = dateFormat(new Date(), "yyyy-mm-dd");
      const query_snapshot = `
              SELECT *
              FROM public.customer_usage_snapshot
              WHERE customer_usage_snapshot."sfid" = '${asset.sfid}' AND "createddate" = '${today}'
            `;
      const results_snapshot = await internaldb.query(query_snapshot);

      if(results_snapshot < 1){
        const query_insertSnapshot = `
            INSERT INTO 
            public.customer_usage_snapshot (
              "sfid",
              "name",
              "subscription_table",
              "interest_table",
              "contact_table",
              "lead_table",
              "campaignmember_table",
              "summary_table",
              "result_table",
              "total_usage")
            VALUES 
              (
              '${asset.sfid}', 
              '${asset.schema_name__c}', 
              '${tableValues.subscriptions}', 
              '${tableValues.interests}', 
              '${tableValues.contacts}', 
              '${tableValues.leads}', 
              '${tableValues.campaignmembers}', 
              '${tableValues.summary}', 
              '${tableValues.result}', 
              '${tableValues.total}'
              )
          `;
        const results_insertSnapshot = await internaldb.query(query_insertSnapshot);

        console.log("Update successful for snapshot record for ",asset.sfid);

        if(results_insertSnapshot){return true};
      }else{
        console.log("Snapshot record not created, record already existing for customer and date.")
      }
    }catch(err){
      console.log("Error in insertCustomerUsageSnapshot: "+JSON.stringify(err));
    }
  }

  const updateAssetUsage = async function (asset, tableValues){
    try{
      var today = dateFormat(new Date(), "yyyy-mm-dd");

      const update_asset = internaldb.query(
        "UPDATE horizontal.asset SET current_volume__c=$1, usage_updated_date__c=$2 WHERE sfid=$3 RETURNING *",
        [tableValues.total, today, asset.sfid]
      );
      const results_asset = await internaldb.query(update_asset);  

      console.log("Update successful for asset record for ",asset.sfid);

      if(results_asset){return true};
    }catch(err){
      console.log("Error in updateAssetUsage: "+JSON.stringify(err));
    } 
  }

getAssetRecords()