var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 8000;


app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', function (req, res, next) {
  res.status(200).send("Hello world!!\n");
});





app.listen(port, function() {
  console.log("== Server is running on port", port);
});
