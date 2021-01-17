var poolAddress; // Staking Pool contract
var funcAddress; // FUNC Token contract
var stknAddress; // Token to stake

var userBalance;  // User Staking Token Balance
var userAllowance; // User Allowance to Stake
var userApproved;

var userAddress;
var tokenAmount;

$("#Pool1Button").hide();
$("#Pool2Button").hide();
$("#getRewards").hide();
document.documentElement.classList.toggle("custom-theme");

var countDownDate1 = new Date("Feb 14, 2020 16:20:00").getTime(); // Set the date we're counting down to
var countDownDate2 = new Date("Feb 14, 2020 16:20:00").getTime(); // Set the date we're counting down to

// Update the count down every 1 second
var x = setInterval(function() {
    var now = new Date().getTime(); // Get today's date and time
    var distance1 = countDownDate1 - now; // Find the distance between now and the count down date
    var distance2 = countDownDate2 - now; // Find the distance between now and the count down date

    // Time calculations for days, hours, minutes and seconds
    var days1 = Math.floor(distance1 / (1000 * 60 * 60 * 24));
    var hours1 = Math.floor((distance1 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes1 = Math.floor((distance1 % (1000 * 60 * 60)) / (1000 * 60));
    var seconds1 = Math.floor((distance1 % (1000 * 60)) / 1000);

    // Time calculations for days, hours, minutes and seconds
    var days2 = Math.floor(distance2 / (1000 * 60 * 60 * 24));
    var hours2 = Math.floor((distance2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes2 = Math.floor((distance2 % (1000 * 60 * 60)) / (1000 * 60));
    var seconds2 = Math.floor((distance2 % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("pool1LaunchCounter").innerHTML = days1 + "d " + hours1 + "h " + minutes1 + "m " + seconds1 + "s ";
    document.getElementById("pool2LaunchCounter").innerHTML = days1 + "d " + hours1 + "h " + minutes1 + "m " + seconds1 + "s ";

    // If the count down is finished, write some text
    if (distance1 < 0) {
        clearInterval(x);
        document.getElementById("pool1LaunchCounter").innerHTML = "ACTIVE";
        document.getElementById("pool2LaunchCounter").innerHTML = "ACTIVE";
        $("#Pool1Button").show();
        $("#Pool2Button").show();
        $("#getRewards").show();
    }

    var _activeAcct = window.tronWeb.defaultAddress.base58;
    window.tronWeb.trx.getBalance(tronWeb.defaultAddress.base58, (err, balance) => {
        if (err) {
            return console.error(err);
        } else {
            console.log({balance});
            $("#qrImage").replaceWith('<img src="https://chart.googleapis.com/chart?chs=350x350&amp;cht=qr&amp;chl=' + _activeAcct + '&amp;choe=UTF-8" class="roundedCorners" />');
            $("#myTronAddr").replaceWith('<small>' + _activeAcct + '</small>');
            $("#viewWalletBtn").replaceWith('<a id="viewWalletBtn" class="btn btn-block btn-dark text-primary" href="https://tronscan.org/#/address/' + _activeAcct + '" target="_blank"><span class="text-func">View my Wallet</span></a>');
        }
    });
}, 1000);

function checkTronWeb() {
    if (window.tronWeb) {
        console.log('TronWeb is active and ready');
        return true;
    }
    return false;
}

async function run() {
    pool1Address = 'TSWAdMfydzDaLB8SfLMDhWh42CGUcFsdiv'; // Function Island staking pool 1
    pool2Address = 'TSWAdMfydzDaLB8SfLMDhWh42CGUcFsdiv'; // Function Island staking pool 2

    funcAddress = 'TM2C3xvyz8bDbG96RyET82YEAKdcxoVcV2'; // FUNC Token - what you'll receive for staking.
    stknAddress = 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT'; // LPTOKEN Token - what you'll stake to get FUNC...
    var REWARDS1 = await tronWeb.contract().at(funcAddress);
    var REWARDS2 = await tronWeb.contract().at(funcAddress);

    var TKNPOOL1 = await tronWeb.contract().at(pool1Address);
    var TKNPOOL2 = await tronWeb.contract().at(pool2Address);

    function init() {
        setInterval(() => {
            update()
        }, 3000);

        $('#getRewards').click(function () {
            TKNPOOL1.getReward().send(function (error, hash) {
                if (!error) {
                    console.log(hash);
                    toastAlert("💪 SUCCESS! ✅", "Collecting Earnings from Pool 1, please wait...")
                } else {
                    console.log(error);
                    toastAlert("👎 ERROR! 🚫", "Could not collect Earnings - Try again or check Tronscan!")
                }
            });

            TKNPOOL2.getReward().send(function (error, hash) {
                if (!error) {
                    console.log(hash);
                    toastAlert("💪 SUCCESS! ✅", "Collecting Earnings from Pool 2, please wait...")
                } else {
                    console.log(error);
                    toastAlert("👎 ERROR! 🚫", "Could not collect Earnings - Try again or check Tronscan!")
                }
            });
        });

        setTimeout(update, 500);
    }

    function update() {
        var account = tronWeb.defaultAddress !== undefined && tronWeb.defaultAddress.base58 !== undefined ? tronWeb.defaultAddress.base58 : null;

        // TOKEN POOL 1 DATA
        TKNPOOL1.earned(account).call(function (error, result) {
            if (!error) {
                $('#harvest1').text(parseFloat(result / 1e18).toFixed(2));
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL1.balanceOf(account).call(function (error, result) {
            if (!error) {
                $('#staked1').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
            } else {
                console.log("ERROR: " + error);
            }
        });

        // TOKEN POOL 2 DATA
        TKNPOOL2.earned(account).call(function (error, result) {
            if (!error) {
                $('#harvest2').text(parseFloat(result / 1e18).toFixed(2));
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL2.balanceOf(account).call(function (error, result) {
            if (!error) {
                $('#staked2').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
            } else {
                console.log("ERROR: " + error);
            }
        });

        // REWARDS LEFT IN EACH POOL
        REWARDS1.balanceOf(pool1Address).call(function (error, result) {
            if (!error) {
                $('#FUNCRemaining1').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
            } else {
                console.log("ERROR: " + error);
            }
        });

        REWARDS2.balanceOf(pool2Address).call(function (error, result) {
            if (!error) {
                $('#FUNCRemaining2').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
            } else {
                console.log("ERROR: " + error);
            }
        });
        console.log("*** *** *** *** *** *** *** ***");
    }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    $(document).ready(init);
}

let waitForTronWeb = function () {
    if (window.tronWeb === undefined) {
        setTimeout(waitForTronWeb, 500);
    } else {
        run();
    }
}
waitForTronWeb();
