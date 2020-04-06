require('dotenv').config();

const express = require('express');
// const path = require('path');
// const dateFormat = require('dateformat');
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
      const asset = await db.query("SELECT sfid,schema_name__c FROM horizontal.asset WHERE status = 'Installed' AND active__c = 'True'");
      console.log("Asset "+JSON.stringify(asset.rows));


      if (asset.rows.length > 0) {
          for(var i=0; i<asset.rows.length; i++){
            pullCustomerUsage(asset.rows[i]);
          }
      }

      res.status(200).send(asset.rows);

  } catch (err) {
    res.status(err.status || 500).send(err);
  }
})

const pullCustomerUsage = async function (asset) {
  try{
    console.log("Assets in pullCustomerUsage  "+JSON.stringify(asset));
    console.log("Contact Schema  "+JSON.stringify(asset.schema_name__c));
    const contacts = await db.query("SELECT sfid FROM daltile.contact");
    //const leads = db.query("SELECT sfid FROM "+asset.schema_name__c+".lead");
    //const subscriptions = db.query("SELECT * FROM "+asset.schema_name__c+".ncpc__pc_subscription__c");
    //const interests = db.query("SELECT sfid FROM "+asset.schema_name__c+".ncpc__pc_interest__c");
    //const campaignMembers = db.query("SELECT sfid FROM "+asset.schema_name__c+".campaignmembers");

    console.log("Contacts  "+JSON.stringify(contacts));

    /*const totalUsage = Math.sum(contacts.rows.rowcount, leads.rows.rowcount, subscriptions.rows.rowcount, interests.rows.rowcount, campaignMembers.rows.rowcount);

    console.log("Total Usage "+JSON.stringify(totalUsage));

    const record = db.query("SELECT * FROM ncpc-usage.customer_usage WHERE sfid = '"+asset.sfid+"'");
    if(record.rows.length > 0){
        const result = db.query(
            "UPDATE ncpc-usage.customer_usage SET contact_table=$1, lead_table=$2, subscription_table=$3, interests_table=$4, campaignMember_table=$5 WHERE sfid=$6 RETURNING *",
            [contacts.rows.rowcount, leads.rows.rowcount, subscriptions.rows.rowcount, interests.rows.rowcount, campaignMembers.rows.rowcount, asset.sfid]
        );
        //if(result.rows){updateAssetUsage(asset, totalUsage);}
    }else{
        const result = db.query(
            "INSERT INTO ncpc-usage.customer_usage (contact_table,lead_table,subscription_table,interests_table,campaignMember_table) VALUES ($1,$2,$3,$4,$5) RETURNING *",
            [contacts.rows.rowcount, leads.rows.rowcount, subscriptions.rows.rowcount, interests.rows.rowcount, campaignMembers.rows.rowcount]
          );
        //if(result.rows){updateAssetUsage(asset, totalUsage);}
    }*/
  }catch(err){
    console.log("Error  "+JSON.stringify(err));
  }
}

app.listen(process.env.PORT || 5000);
