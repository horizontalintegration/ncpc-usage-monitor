require('dotenv').config();


const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

/*
 * CONFIGURE EXPRESS SERVER
 */
var app = express();

app.enable('trust proxy');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Catch landing page so it isn't served as a static file.
app.get('/', (req, res) => {
  try{
    console.log("test");
    res.status(200);
  } catch (err){
    res.status(err.status || 500).send(err);
  }
});


/*
 * INSTANTIATE EXPRESS SERVER
 */
const server = app.listen(process.env.PORT || 5000);

module.exports = server;