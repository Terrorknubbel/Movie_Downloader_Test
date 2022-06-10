const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router.js');
var cors = require('cors');

const app = express()
const port = 3000

app.use(cors());
app.use( bodyParser.json() );

app.use('/', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})