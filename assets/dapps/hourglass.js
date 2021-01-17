var hourglassAddress = "TJ9KV8DdVhVbPAMWVHEHYnXBA4vqLwk6Jr"; // DIVS Contract Mainnet
// var hourglassAddress="TQaVpr8iLMHBjnBRvzzRYwPAg8N25rk6W4";  // DIVS Contract Shasta
var rainmakerAddress = "TRrLSZknfHCS8ejYoffGsH5EeRQ4WwT2Mt"; // RainMaker Contract Mainnet
// var rainmakerAddress="TMxteUKhdK81ptzbrAZDBpc7sjo9Kdjr3c"; // RainMaker Contract Shasta
var hourglassContract;
var userTokenBalance;
var _rainmakerTokens;
var account;
var prev_account;

async function loadTronWeb() {
    if (typeof (window.tronWeb) === 'undefined') {
        setTimeout(loadTronWeb, 1000)
        toastAlert("ERROR!", 'Could not connect...');
    } else {
        hourglassContract = await tronWeb.contract().at(hourglassAddress);
        rainmakerContract = await tronWeb.contract().at(rainmakerAddress);
        setTimeout(function () {
            startLoop()
        }, 1000);
    }
}

window.addEventListener("load", function () {
    loadTronWeb();

    // buy input
    $(".buy-input").change(function () {
        var txValue = $(this).val();
        var txValueFloored = Math.floor(txValue);

        if (txValueFloored == "") {
            $(".buy-token-button").hide();
        }
        if (txValueFloored == "0") {
            $(".buy-token-button").hide();
        }
        if (txValueFloored >= "1") {
            $(".buy-token-button").show();
        }

        hourglassContract.calculateTokensReceived(tronWeb.toSun(txValueFloored)).call().then((result) => {
            var buyAmount = parseInt(result) / (Math.pow(10, 18));
            $('.token-input-buy').val(formatTrxValue(buyAmount));
        }).catch((error) => {
            console.log(error)
        });

        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
            success: function (trxRate) {
                $('#usdBuyValue').val(txValue * trxRate.USD.toFixed(4)) // Set USD value in the text box
            }
        });
    });

    // sell input
    var sellAmount;
    $(".sell-input").change(function () {
        var _sellInput = $(this).val();
        var _sellInputFloored = Math.floor(_sellInput);

        if (_sellInputFloored == "") {
            $(".sell-token-button").hide();
        }
        if (_sellInputFloored == "0") {
            $(".sell-token-button").hide();
        }
        if (_sellInputFloored >= "1") {
            $(".sell-token-button").show();
        }

        hourglassContract.calculateTronReceived(tronWeb.toHex(_sellInputFloored * (Math.pow(10, 18)))).call().then((result) => {
            sellAmount = sunToDisplay(parseInt(result));
            $(".token-input-sell").val(sellAmount);
            $.ajax({
                url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
                success: function (tokenRate) {
                    $('#usdSellValue').val(sellAmount * tokenRate.USD.toFixed(4)) // Set USD value in the text box
                }
            });
        }).catch((error) => {
            console.log(error)
        });


    });

    // buy token button
    $(".buy-token-button").click(function () {
        var buyTotal = tronWeb.toSun($(".buy-input").val());
        hourglassContract.buy(getCookie("masternode").split(";")[0]).send({
            callValue: buyTotal
        }).then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Buying D1VS, Please Wait...")
            $(".buy-input").val(0);
            $(".buy-input").trigger("change")
            console.log("Used masternode: " + getCookie("masternode").split(";")[0]);
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Failed to buy D1VS");
            console.log(error);
        })
    });

    // sell-token-btn.click
    $(".sell-token-button").click(function () {
        var sellTotal = $(".sell-input").val();
        sellTotal = tronWeb.toHex((sellTotal * (Math.pow(10, 18))));
        hourglassContract.sell(sellTotal).send().then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Selling D1VS, Please Wait...")
            $(".sell-input").val(0);
            $(".token-input-sell").val("0.00000000")
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Failed to sell D1VS");
            console.log(error)
        })
    });

    // sell-token-btn.click
    $(".transfer-token-button").click(function () {
        var transferTotal = $(".transfer-input").val();
        var recipientAddr = $(".recipient-input").val();
        transferTotal = tronWeb.toHex((transferTotal * (Math.pow(10, 18))));
        hourglassContract.transfer(recipientAddr, transferTotal).send().then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Transferring D1VS, please wait...")
            $(".transfer-input").val(0);
            $(".recipient-input").val("Recipient Address...")
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Transfer of D1VS failed - Try again later!");
            console.log(error)
        })
    });

    $(".btn-reinvest").click(function () {
        hourglassContract.reinvest().send().then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Reinvesting dividends, please wait...")
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Failed to reinvest Dividends");
            console.log(error)
        })
    });

    $(".btn-withdraw").click(function () {
        hourglassContract.withdraw().send().then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Withdrawing TRX, please wait...")
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Failed to Withdraw TRX!");
            console.log(error)
        })
    });
    $("#makeItRainTx").click(function () {
        rainmakerContract.makeItRain().send().then((result) => {
            toastAlert("💪 SUCCESS! ✅", "Raising Pricefloor...")
        }).catch((error) => {
            toastAlert("👎 ERROR! 🚫", "Raising Pricefloor Failed!");
            console.log(error)
        })
    });
});

function startLoop() {
    refreshData();
    setTimeout(startLoop, 3000)
}

function refreshData() {
    updateUserInformation();
    updateNetworkInformation();
}

function updateNetworkInformation() {
    hourglassContract.totalTronBalance().call().then((result) => {
        var TRXBalance = sunToDisplay(parseInt(result));
        $("#contract-trx-balance").html(numberWithCommas(TRXBalance));
        $("#D1VSSupply").html(TRXBalance);

        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD,BTC,ETH,TRX",
            success: function (result) {
                $("#supply-value-usd").html(numberWithCommas(parseFloat(parseFloat(TRXBalance * result.USD)).toFixed(2)))
                $("#supply-value-btc").html(numberWithCommas(parseFloat(parseFloat(TRXBalance * result.BTC)).toFixed(2)))
                $("#supply-value-eth").html(numberWithCommas(parseFloat(parseFloat(TRXBalance * result.ETH)).toFixed(2)))
            }
        })
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.totalSupply().call().then((result) => {
        var CompleteSupply = parseInt(result) / (Math.pow(10, 18));
        $("#contract-token-balance").html(numberWithCommas(formatTrxValue(CompleteSupply)))

        hourglassContract.balanceOf(tronWeb.defaultAddress.base58).call().then((balanceResult) => {
            $("#supplyPercentage").html((((balanceResult / Math.pow(10, 18)) / CompleteSupply) * 100).toFixed(2));
        }).catch((error) => {
            console.log(error)
        });

        hourglassContract.balanceOf(rainmakerAddress).call().then((floorResult) => {
            $("#supplyFloorPercentage").html((((floorResult / Math.pow(10, 18)) / CompleteSupply) * 100).toFixed(3));
        }).catch((error) => {
            console.log(error)
        });
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.calculateTokensReceived(tronWeb.toSun(1)).call().then((result) => {
        var RateToBuy = parseInt(result) / (Math.pow(10, 18));
        RateToBuy = 1 / RateToBuy;
        $("#rate-to-buy").html(formatTrxValue(RateToBuy));

        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
            success: function (result) {
                $("#usdPriceOfOne").html(parseFloat(parseFloat(RateToBuy * result.USD).toFixed(3)))
            }
        })
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.calculateTronReceived("" + (Math.pow(10, 18))).call().then((result) => {
        var RateToSell = sunToDisplay(parseInt(result));
        $("#rate-to-sell").html(RateToSell);
    }).catch((error) => {
        console.log(error)
    });

    rainmakerContract.myTokens().call().then((result) => {
        var _rainmakerTokens = parseInt(result) / (Math.pow(10, 18));
        $("#rainmakerTokens").html(_rainmakerTokens.toFixed(0));

        hourglassContract.calculateTronReceived(result).call().then((trxValue) => {
            var _receivedTron = (trxValue / 1e6);
            $("#floorTRX").html((_receivedTron).toFixed(0));

            $.ajax({
                url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD,BTC,ETH,TRX",
                success: function (result) {
                    $("#floor-value-usd").html(numberWithCommas(parseFloat(parseFloat(_receivedTron * result.USD)).toFixed(2)))
                }
            })
        })
    }).catch((error) => {
        console.log(error)
    });

    rainmakerContract.myDividends().call().then((result) => {
        var _rainmakerDivs = sunToDisplay(parseInt(result));
        $("#rainmakerDividends").html(_rainmakerDivs.toFixed(0));
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.calculateTokensReceived(tronWeb.toSun(1)).call().then((result) => {
        var RateToBuy = parseInt(result) / (Math.pow(10, 18));
        RateToBuy = 1 / RateToBuy;
        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
            success: function (result) {
                $("#usdPriceOfOne").html(parseFloat(parseFloat(RateToBuy * result.USD).toFixed(3)))
            }
        })
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.calculateTronReceived("" + (Math.pow(10, 18))).call().then((result) => {
        var RateToSell = sunToDisplay(parseInt(result));
        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
            success: function (result) {
                $("#usdValueOfOne").html(parseFloat(parseFloat(RateToSell * result.USD).toFixed(3)))
            }
        })
    }).catch((error) => {
        console.log(error)
    });
}

function updateUserInformation() {
    account = tronWeb.defaultAddress !== undefined && tronWeb.defaultAddress.base58 !== undefined ? tronWeb.defaultAddress.base58 : null;

    // User balance
    hourglassContract.balanceOf(tronWeb.defaultAddress.base58).call().then((result) => {
        var balanceVar = parseInt(result) / (Math.pow(10, 18));
        $(".user-token-balance").html(formatTrxValue(balanceVar));

        hourglassContract.calculateTronReceived(result).call().then((result) => {
            var _userBalance = sunToDisplay(parseInt(result));
            $("#user-trx-balance").html(_userBalance);
            $.ajax({
                url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
                success: function (result) {
                    $("#user-usd-balance").html(parseFloat(parseFloat(_userBalance * result.USD).toFixed(2)))
                }
            })
        }).catch((error) => {
            console.log(error)
        })
    }).catch((error) => {
        console.log(error)
    });

    hourglassContract.myDividends(true).call().then((result) => {
        var myDivsWithRefs = sunToDisplay(parseInt(result));
        $(".user-dividends").html(myDivsWithRefs);
        $.ajax({
            url: "https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD",
            success: function (result) {
                $("#user-dividends-usd").html(parseFloat(parseFloat(myDivsWithRefs * result.USD).toFixed(2)))
            }
        })

        hourglassContract.calculateTokensReceived(result).call().then((result) => {
            var _tokensReceived = parseInt(result) / (Math.pow(10, 18));
            $("#user-reinvest").html(formatTrxValue(_tokensReceived))
        }).catch((error) => {
            console.log(error)
        })
    }).catch((error) => {
        console.log(error)
    });

    $("#ref-url").val("https://functionisland.com/divs.html?masternode=" + tronWeb.defaultAddress.base58)
    $("#qrImage").replaceWith('<img src="https://chart.googleapis.com/chart?chs=350x350&amp;cht=qr&amp;chl=' + tronWeb.defaultAddress.base58 + '&amp;choe=UTF-8" class="roundedCorners" />');
    $("#myTronAddr").replaceWith('<small>' + tronWeb.defaultAddress.base58 + '</small>');
}

function copyRefLink() {
    var copyText = $("ref-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alertify.success("Copied Link");
}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sunToDisplay(_0xbc13x20) {
    return formatTrxValue(tronWeb.fromSun(_0xbc13x20))
}

function formatTrxValue(_0xbc13x22) {
    return parseFloat(parseFloat(_0xbc13x22).toFixed(2))
}
