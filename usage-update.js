const db = require("./db");
const dateFormat = require('dateformat');

const getAssetRecords = async function (){
    const asset = await db.query("SELECT sfid,schema_name__c FROM horizontal.asset WHERE status = 'Installed' AND active__c = 'True'");
      console.log("Asset "+JSON.stringify(asset.rows));


      if (asset.rows.length > 0) {
          for(var i=0; i<asset.rows.length; i++){
            pullCustomerUsage(asset.rows[i]);
          }
          response.send('Updates Made.');
      }
}

const pullCustomerUsage = async function (asset) {
    try{
      console.log("Assets in pullCustomerUsage  "+JSON.stringify(asset));
      console.log("Contact Schema  "+JSON.stringify(asset.schema_name__c));
      /*const contacts = {"rows": [{"count":"0"}]};
      const leads = {"rows": [{"count":"0"}]};
      const campaignmembers = {"rows": [{"count":"0"}]};
      const subscriptions = {"rows": [{"count":"0"}]};
      const interests = {"rows": [{"count":"0"}]};
      const contactCheck = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = '"+asset.schema_name__c+"' AND table_name = 'contact')");
      const leadCheck = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = '"+asset.schema_name__c+"' AND table_name = 'lead')");
      const campaignCheck = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = '"+asset.schema_name__c+"' AND table_name = 'campaignmember')");
      const subsCheck = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = '"+asset.schema_name__c+"' AND table_name = 'ncpc__pc_subscription__c')");
      const intsCheck = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE  table_schema = '"+asset.schema_name__c+"' AND table_name = 'ncpc__pc_interest__c')");
      */
        const contacts = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".contact");
      
        const leads = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".lead");
      
        const campaignmembers = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".campaignmember");
      
        const subscriptions = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_subscription__c");
      
        const interests = await db.query("SELECT count(*) FROM "+asset.schema_name__c+".ncpc__pc_interest__c");
      
      console.log("Subscriptions Count - "+asset.schema_name__c+" - "+JSON.stringify(subscriptions.rows[0].count));
  
      const totalUsage = Number(subscriptions.rows[0].count) + Number(interests.rows[0].count) + Number(contacts.rows[0].count) + Number(leads.rows[0].count) + Number(campaignmembers.rows[0].count);
      console.log("Total Usage "+JSON.stringify(totalUsage));
  
      const record = await db.query("SELECT * FROM ncpc_usage.customer_usage WHERE sfid = '"+asset.sfid+"'");
      if(record.rows.length > 0){
          console.log("Inside update");
          const result = await db.query(
              "UPDATE ncpc_usage.customer_usage SET total_usage=$7, contact_table=$1, lead_table=$2, subscription_table=$3, interest_table=$4, campaignmember_table=$5 WHERE sfid=$6 RETURNING *",
              [contacts.rows[0].count, leads.rows[0].count, subscriptions.rows[0].count, interests.rows[0].count, campaignmembers.rows[0].count, asset.sfid, totalUsage]
          );
          if(result.rows){updateAssetUsage(asset, totalUsage);}
      }else{
          const result = await db.query(
            "INSERT INTO ncpc_usage.customer_usage (sfid,name,subscription_table,interest_table,contact_table,lead_table,campaignmember_table,total_usage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
            [asset.sfid, asset.schema_name__c, Number(subscriptions.rows[0].count), Number(interests.rows[0].count), Number(contacts.rows[0].count), Number(leads.rows[0].count), Number(campaignmembers.rows[0].count), totalUsage]
        );
          if(result.rows){updateAssetUsage(asset, totalUsage);}
      }
    }catch(err){
      console.log("Error  "+JSON.stringify(err));
    }
  }
  
  const updateAssetUsage = async function (asset, totalUsage){
    console.log("Will update "+JSON.stringify(asset.schema_name__c)+" to "+JSON.stringify(totalUsage));
    var today = dateFormat(new Date(), "yyyy-mm-dd");
    try{
      const result = db.query(
        "UPDATE horizontal.asset SET current_volume__c=$1, usage_updated_date__c=$2 WHERE sfid=$3 RETURNING *",
        [totalUsage, today, asset.sfid]
      );
      console.log("Update Asset: "+JSON.stringify(result.rows[0]));
    }catch(err){
      console.log("Error  "+JSON.stringify(err));
    } 
  }

getAssetRecords()