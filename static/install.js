function install() {
  if ('serviceWorker' in navigator) {
    const reg = navigator.serviceWorker.register(
      "service-worker.js"
    );

    reg.then(function(registration) {
      console.log("Registration resolved: ", navigator.serviceWorker.controller);
      if (!registration.paymentManager) {
        console.log("Payment Handler not supported.");
        return;
      }

      registration.paymentManager.userHint = "Lilac is a nice color";
      registration.paymentManager.instruments.set(
        "https://pay.stillmuchtoponder.com", {
          name: "Payment Handler Example",
          method: "https://pay.stillmuchtoponder.com/pay"
        }
      );
      refreshInstallStatus(true);
    });
  }
}

function uninstall() {
  console.log("uninstall() not yet implemented.");
}

function onLoad() {
  refreshInstallStatus();
  refreshPurchaseRecords();
}

function refreshInstallStatus(installed) {
  if (!installed) {
  	installed = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
  }
  document.getElementById("install_status").innerText = installed ?
    "Payment handler is installed." :
    "You don't currently have a payment handler installed.";
  document.getElementById("install").disabled = installed;
}

function refreshPurchaseRecordsWithData(records) {
  let container = document.getElementById("records");
  while (container.lastChild) {
    container.removeChild(container.lastChild);
  }
  
  pushHeader(container, "URL");
  pushHeader(container, "PaymentRequest ID");
  pushHeader(container, "Price");
  pushHeader(container, "Refunded");

  for (let i = 0; i < records.length; i++) {
    let item = document.createElement("div");
    let link = document.createElement("a");
    link.href = records[i].articleId;
    link.innerText = records[i].articleId;
    item.appendChild(link);
    container.appendChild(item);
    
    let itemId = document.createElement("div");
    itemId.innerText = records[i].paymentId;
    container.appendChild(itemId);

    let itemPrice = document.createElement("div");
    itemPrice.innerText = [records[i].price, records[i].currency].join(" ");
    container.appendChild(itemPrice);

   let itemRefund = document.createElement("div");
   itemRefund.innerText = records[i].refunded ? "Yes" : "No";
   container.appendChild(itemRefund);
  }
}

function pushHeader(container, title) {
	var header = document.createElement("div");
	header.innerText = title;
	container.appendChild(header);
}

function refreshPurchaseRecords() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "/records", true /* async */ );
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log("Received response type ", xhr.responseType);
        let records = JSON.parse(xhr.responseText);
        refreshPurchaseRecordsWithData(records);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function(e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}