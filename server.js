const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');
const router = require('./router.js');
var cors = require('cors');

const app = express()
const port = 3000

app.use(cors());
app.use( bodyParser.json() );

app.use('/', router);

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

https.createServer(httpsOptions, app).listen(port, function(){
    console.log(`Server listening on port ${port}`)
})