var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var swig  = require('swig');
var gql = require('graphql-tag');
var ApolloClient = require('apollo-client').default;
var createNetworkInterface = require('apollo-client').createNetworkInterface;
var networkInterface = createNetworkInterface({ uri: 'https://api.graph.cool/simple/v1/cj4i1ifeamv640130f4nkogb0' });
var client = new ApolloClient({ networkInterface: networkInterface });
require('es6-promise').polyfill();
require('isomorphic-fetch');

app.set('port', (process.env.PORT || 5000))

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/build');

app.use(bodyParser.json());

app.get(['/', '/scrape/:key'], function(req, res) {
  const key = req.params.key;
  console.log('KEY', key);

  let initialData = {
    INITIAL_DATA: () => '""',
    KEY: () => '""',
  };

  if (!key) return res.render('index', initialData);

  client.query({
    query: gql`
      query Data($key: String!) {
        allDatas(filter: {
          key: $key
        }) {
          key
          content
        }
      }
    `,
    variables: {
      key,
    }
  })
  .then(data => {
    if (!data.data.allDatas[0]) return res.render('index', initialData);
    initialData = {
      INITIAL_DATA: () => JSON.stringify(data.data.allDatas[0].content),
      KEY: () => key,
    };
    return res.render('index', initialData);
  })
  .catch(error => console.error(error));
});

app.use('/', express.static("build"));

function alphanumeric_unique() {
    return Math.random().toString(36).split('').filter( function(value, index, self) {
        return self.indexOf(value) === index;
    }).join('').substr(2,8);
}

app.post('/scrape', function(req, res) {
  const uniqueKey = alphanumeric_unique();
  client.mutate({
    mutation: gql`
      mutation ($key: String!, $content: String!) {
        createData(key: $key, content: $content) {
          id,
          key,
        }
      }
    `,
    variables: {
      key: uniqueKey,
      content: req.body.content,
    },
  })
  .then((data) => {
    res.json(data);
  })
  .catch((error) => {
    console.log(error)
  });
})

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
