function pay() {
  const methodData = {
    supportedMethods: 'https://pay.stillmuchtoponder.com/alphapay',
    data: {
      ui: 'material',
    }
  };
  const details = {
    total: {
      label: "Buy your favourite story",
      amount: {
        currency: "USD",
        value: "1.0",
      },
    },
  };
  const request = new PaymentRequest([methodData], details);
  request.show().then(response => {
    onResponse(response);
    response.complete('success');
  }).catch(error => {
    showError(error.message);
  })
}

function onResponse(response) {
  console.log(`Got response: ${JSON.stringify(response.toJSON(), undefined, 2)}`);
}

function showError(message) {
  console.log(`Got error: ${message}`);
}