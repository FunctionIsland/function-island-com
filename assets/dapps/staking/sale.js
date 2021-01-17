var addr;

var contractAddress = "TJGA1KTf59TUq8zF18tCHTJzXeEgrNmRHa";

var tknAmount = 0;
var trxAmount = 0;
var balance = 0;

$("#amount").on("input", function () {
    trxAmount = $("#amount").val();
    var price = 16;
    tknAmount = parseInt(trxAmount) / parseInt(price);
    $("#tknAmount").text(tknAmount + " FUNC");
});

$("#buy-btn").click(function () {
    if (isInstalled) {
        var amount = document.getElementById("amount").value;

        if (amount == "" || amount <= 0) {
            toastAlert("ERROR!", "Please enter an Amount");
            return false;
        }
        if (window.tronWeb.defaultAddress.hex) {
            var amount = document.getElementById("amount").value;
            if (amount === "" || amount <= 0) {
                toastAlert("ERROR!", "Please enter an Amount");
                return false;
            } else {
                window.tronWeb.contract().at(contractAddress).then(function (contract) {
                    contract.buy().send({feeLimit: 1000000, callValue: trxAmount * 1000000, shouldPollResponse: true}).then(function (res) {
                        console.log(res);
                    });
                });
            }
        } else {
            toastAlert("WARNING!", "Please login tronlink ");
        }
    }
});

function copy_address(value) {
    var tempInput = document.createElement("input");
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

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
            });
        }
    }
}

function getContractTokenBalance() {
    var res = 0;
    if (isInstalled) {
        if (window.tronWeb.defaultAddress.hex) {
            window.tronWeb.contract().at(contractAddress).then(function (contract) {
                contract.balanceOf(contractAddress).call({shouldPollResponse: true}).then(function (res) {
                    var bigBlane = new bigDecimal(res);
                    var balance = (bigBlane.getValue() / 1000000000000000000);
                    var balanceStr= balance.toString();
                    if (balanceStr.indexOf(".") != "-1") {
                        balanceStr = balanceStr.substring(0, balanceStr.indexOf(".") + 2);
                    }
                    $("#scBalance").text(balanceStr);
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