(function () {
  var initialPrice = 1480; // Initial Ethereum price in USD
  var currentPriceElement = document.getElementById("current-price");
  var profitLossUsdElement = document.getElementById("profit-loss-usd");
  var profitLossInrElement = document.getElementById("profit-loss-inr");

  // Function to fetch data using XMLHttpRequest
  function fetchData(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            callback(null, response);
          } catch (e) {
            callback("Error parsing JSON: " + e.message);
          }
        } else {
          callback("Request failed with status: " + xhr.status);
        }
      }
    };
    xhr.send();
  }

  // Fetch Ethereum Price from Coinbase API
  function fetchEthereumPrice() {
    fetchData(
      "https://api.coinbase.com/v2/prices/ETH-USD/spot",
      function (err, ethData) {
        if (err) {
          handleError(err);
          return;
        }

        var currentPrice = parseFloat(ethData.data.amount);
        currentPriceElement.textContent = "$" + currentPrice.toFixed(2);

        // Fetch USD to INR Exchange Rate
        fetchData(
          "https://open.er-api.com/v6/latest/USD",
          function (err, fxData) {
            if (err) {
              handleError(err);
              return;
            }

            var usdToInrRate = fxData.rates.INR;
            calculateProfitLoss(currentPrice, usdToInrRate);
          }
        );
      }
    );
  }

  // Calculate Profit or Loss
  function calculateProfitLoss(currentPrice, usdToInrRate) {
    var profitOrLossUsd = currentPrice - initialPrice;
    var profitOrLossInr = profitOrLossUsd * usdToInrRate;

    // Update USD Profit/Loss
    profitLossUsdElement.textContent =
      (profitOrLossUsd >= 0 ? "+" : "-") +
      "$" +
      Math.abs(profitOrLossUsd).toFixed(2);
    profitLossUsdElement.className = profitOrLossUsd >= 0 ? "profit" : "loss";

    // Update INR Profit/Loss
    profitLossInrElement.textContent =
      (profitOrLossInr >= 0 ? "₹" : "-₹") +
      Math.abs(profitOrLossInr).toFixed(2);
    profitLossInrElement.className = profitOrLossInr >= 0 ? "profit" : "loss";
  }

  // Handle Errors
  function handleError(message) {
    console.error(message);
    currentPriceElement.textContent = "Error fetching price";
    profitLossUsdElement.textContent = "Error";
    profitLossInrElement.textContent = "Error";
  }

  // Fetch Ethereum price periodically
  function startAutoRefresh() {
    fetchEthereumPrice(); // Fetch initially
    setInterval(fetchEthereumPrice, 30000); // Refresh every 30 seconds
  }

  // Start the process
  startAutoRefresh();
})();