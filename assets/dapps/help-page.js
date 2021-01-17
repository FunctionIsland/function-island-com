var addr;

var contractAddress = "TM2C3xvyz8bDbG96RyET82YEAKdcxoVcV2";

var tknAmount = 0;
var trxAmount = 0;
var balance = 0;
var tsupply = 0;

function updateAddressAndBalance() {
    if (isInstalled) {
        if (window.tronWeb.defaultAddress.hex) {
            var _activeAcct = window.tronWeb.defaultAddress.base58;
            window.tronWeb.trx.getBalance(tronWeb.defaultAddress.base58, (err, balance) => {
                if (err) {
                    return console.error(err);
                } else {
                    console.log({balance});
                    $("#qrImage").replaceWith('<img src="https://chart.googleapis.com/chart?chs=350x350&amp;cht=qr&amp;chl=' + _activeAcct + '&amp;choe=UTF-8" class="roundedCorners" />');
                    $("#myTronAddr").replaceWith('<small>' + _activeAcct + '</small>');
                }
            });

            // Current FUNC Balance
            window.tronWeb.contract().at(contractAddress).then(function (contract) {
                contract.balanceOf(window.tronWeb.defaultAddress.base58).call({shouldPollResponse: true}).then(function (res) {
                    var bigBlane = new bigDecimal(res);
                    var balance = (bigBlane.getValue() / 1000000000000000000);
                    var balanceStr= balance.toString();
                    if (balanceStr.indexOf(".") != "-1") {
                        balanceStr = balanceStr.substring(0, balanceStr.indexOf(".") + 2);
                    }
                    $("#myFUNCBalance").text(numberWithCommas(balanceStr));
                });

                // Current FUNC Supply
                contract.totalSupply().call({shouldPollResponse: true}).then(function (res) {
                    var bigBlane = new bigDecimal(res);
                    var tsupply = (bigBlane.getValue() / 1000000000000000000);
                    var tsupplyStr= tsupply.toString();
                    if (tsupplyStr.indexOf(".") != "-1") {
                        tsupplyStr = tsupplyStr.substring(0, tsupplyStr.indexOf(".") + 2);
                    }
                    $("#FUNCSupply").text(numberWithCommas(tsupplyStr));
                });
            });
        }
    }
}

function isInstalled() {if (window.tronWeb) {return true;} else {return false;}}
async function checkInstall() {if (isInstalled()) {}}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

setInterval(updateAddressAndBalance, 3000);
setInterval(getContractTokenBalance, 3000);