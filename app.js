'use strict';

const express = require('express');
var bodyParser = require('body-parser');

const app = express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var logs = [];

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.status(200).send('Hello, world! This is Lilac Pay, a toy payment app.');
});

app.get('/pay', (req, res) => {
  res.status(200)
    .links({
      "payment-method-manifest": "https://pay.stillmuchtoponder.com/payment-manifest.json"
    })
    .send('This is /pay.');
});

app.get('/records', (req, res) => {
  let records = logs;
  res.status(200)
    .type('application/json')
    .send(JSON.stringify(records));
});

app.post('/checkout', jsonParser, (req, res) => {
  console.log("Got /checkout: ", req.body);
  logs.push({
    articleId: req.body.articleId,
    price: req.body.price,
    currency: req.body.currency,
    paymentId: req.body.paymentId,
    refunded: false
  });
  res.status(200).send("Checkout successful for " + req.body.articleId + "\n");
});

app.post('/refund', urlencodedParser, (req, res) => {
  console.log("Got /refund: ", req.body);
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].paymentId == req.body.paymentId) {
      logs[i].refunded = true;
      res.status(200).send("Refunded " + req.body.paymentId);
      return;
    }
  }
  res.status(404).send("Payment ID not found: " + req.body.paymentId);
});

app.use(express.static('static'));

// AlphaPay code
app.use('/alphapay', (req, res, next) => {
  res.status(200).links({
    'payment-method-manifest': 'https://pay.stillmuchtoponder.com/alphapay/payment-manifest.json'
  });
  return next();
});
app.use('/alphapay', express.static('alphapay'));

// Main method
if (module === require.main) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
