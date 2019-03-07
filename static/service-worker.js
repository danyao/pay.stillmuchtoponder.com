console.log("lilacpay service-worker.js");

const origin = "https://pay.stillmuchtoponder.com";
const methodName = `${origin}/pay`;
const checkoutURL = `${origin}/checkout.html`;
let resolver = {};
let payment_request_event;

self.addEventListener("paymentrequest", e => {
  payment_request_event = e;
  console.log("Received PaymentRequestEvent: ", e);

  e.respondWith(new Promise((resolve, reject) => {
    resolver.resolve = resolve;
    resolver.reject = reject;
  }));

  // Save purchase record to the backend.
  var data = {
    articleId: e.methodData[0].data.articleId,
    paymentId: e.paymentRequestId,
    price: e.total.value,
    currency: e.total.currency
  };
  var checkoutRequest = new Request(`${origin}/checkout`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  });
  fetch(checkoutRequest).then(response => {
    if (response.status === 200) {
      console.log("Recorded purchase for ", data);
      // Resolve immediately with response without user interaction.
	  resolver.resolve({
	    methodName: methodName,
	    details: {
	      id: "123456"
	    }
	  });
    } else {
      console.log("Failed on /checkout: ", response);
      resolver.reject("Unable to process request " + e.paymentRequestId);
    }
  });
});