var express = require('express');
var path = require('path');
var compression = require('compression');


/*eslint-disable no-console */

const port = {PORT};
const app = express();

app.use(compression());
//app.use(express.static('dist'));

app.use('/static', express.static(path.join( __dirname, './static')));
app.get('*', function(req, res) {
  console.log("request: ===> "+req._parsedUrl.pathname);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('server start success');
  }
});