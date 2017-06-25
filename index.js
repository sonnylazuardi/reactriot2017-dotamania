var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.json());

app.use('/', express.static("build"));

app.post('/graphql', function (req, res) {
  axios({
    method: 'post',
    url: 'http://gdom.graphene-python.org/graphql',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    data: {
      query: req.body.query,
    },
  }).then(({data}) => {
    res.json(data);
  });
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
