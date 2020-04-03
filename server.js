const express = require('express');
const path = require('path');
const dateFormat = require('dateformat');
const bodyParser = require('body-parser');
const db = require("./db");
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', async function(req, res, next) {
    try{
        const asset = await db.query("SELECT * FROM horizontal.asset");

        console.log("Asset "+JSON.stringify(asset));
        if(asset.rows.length > 0){
            for(var i=0; i<asset.rows.length; i++){
                pullCustomerUsage(asset.rows[i]);
            }
        }
        res.render('test', {
            test: {"test":"test"}
        });
    } catch (err) {
      return next(err);
    }
})

app.listen(process.env.PORT || 5000);