const db = require("./db");

function getAssetRecords(){
    const asset = db.query("SELECT * FROM horizontal.asset WHERE status = 'Installed' AND active__c = 'True'");

    console.log("Asset "+JSON.stringify(asset.rows));
    for(var i=0; i<asset.rows.length; i++){
        pullCustomerUsage(asset.rows[i]);
    }
}

// update local table
function pullCustomerUsage(asset){
    const contacts = db.query("SELECT sfid FROM '"+asset.schema+"'.contact WHERE status = 'Installed' AND active__c = 'True'");
    const leads = db.query("SELECT sfid FROM '"+asset.schema+"'.lead WHERE status = 'Installed' AND active__c = 'True'");
    const subscriptions = db.query("SELECT * FROM '"+asset.schema+"'.ncpc__pc_subscription__c WHERE status = 'Installed' AND active__c = 'True'");
    const interests = db.query("SELECT sfid FROM '"+asset.schema+"'.ncpc__pc_interest__c WHERE status = 'Installed' AND active__c = 'True'");
    const campaignMembers = db.query("SELECT sfid FROM '"+asset.schema+"'.campaignmembers WHERE status = 'Installed' AND active__c = 'True'");

    console.log("Contacts  "+JSON.stringify(contacts.rows));

    const totalUsage = Math.sum(contacts.rows.rowcount, leads.rows.rowcount, subscriptions.rows.rowcount, interests.rows.rowcount, campaignMembers.rows.rowcount);

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
    }
}

// update heroku connect table
function updateAssetUsage(asset, totalUsage){
    var today = dateFormat(new Date(), "yyyy-mm-dd");
    //var externalKey = asset.ncpc__external_id__c === '' ? uuidv1() : asset.ncpc__external_id__c;
    const result = db.query(
        "UPDATE "+asset.schema__c+".asset SET current_volume__c=$1, usage_updated_date__c=$2, ncpc__External_Id__c=$3 WHERE sfid=$4 RETURNING *",
        [totalUsage, today, externalKey, asset.sfid]
      );

    res.json({"success":true,"status":200,"message":"Update Successful","body":result.rows});  
}

getAssetRecords()