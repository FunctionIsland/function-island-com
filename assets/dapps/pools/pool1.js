var poolAddress; // Staking Pool contract
var funcAddress; // FUNC Token contract
var stknAddress; // Token to stake

var userBalance;  // User Staking Token Balance
var userAllowance; // User Allowance to Stake
var userApproved;

var userAddress;
var tokenAmount;

function checkTronWeb() {
    if (window.tronWeb) {
        console.log('TronWeb is active and ready');
        return true;
    }
    return false;
}

async function run() {
    poolAddress = 'TSWAdMfydzDaLB8SfLMDhWh42CGUcFsdiv'; // Function Island staking pool
    funcAddress = 'TM2C3xvyz8bDbG96RyET82YEAKdcxoVcV2'; // FUNC Token - what you'll receive for staking.
    stknAddress = 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT'; // LPTOKEN Token - what you'll stake to get FUNC...
    var REWARDS = await tronWeb.contract().at(funcAddress);
    var TKNPOOL = await tronWeb.contract().at(poolAddress);
    var LPTOKEN = await tronWeb.contract().at(stknAddress);

    function init() {
        setInterval(() => {
            update()
        }, 3000);

        $('#stake').click(async function (event) {
            event.preventDefault();
            var amount = parseInt($('#amountToStake').val());
            var value = amount.toString() + "000000000000000000";

            if (amount > 0) {
                try {
                    await TKNPOOL.stake(value).send();
                    toastAlert("💪 SUCCESS! ✅", "Staking " + numberWithCommas(amount) + " Tokens, please wait...");
                } catch (err) {
                    console.error(err)
                    toastAlert("👎 ERROR! 🚫", "Could not Stake Tokens - Try again later!")
                }
            }
        });

        $('#unstake').click(async function (event) {
            event.preventDefault();
            var amount = parseInt($('#amountToStake').val());
            let value = amount.toString() + "000000000000000000";
            console.log(value)
            if (amount > 0) {
                try {
                    await TKNPOOL.withdraw(value).send();
                    toastAlert("💪 SUCCESS! ✅", "Unstaking " + numberWithCommas(amount) + " Tokens, please wait...")
                } catch (err) {
                    console.error(err)
                    toastAlert("👎 ERROR! 🚫", "Could not Unstake Tokens - Try again or check Tronscan!")
                }
            }
        });

        $('#getReward').click(function () {
            TKNPOOL.getReward().send(function (error, hash) {
                if (!error) {
                    console.log(hash);
                    toastAlert("💪 SUCCESS! ✅", "Collecting Earnings, please wait...")
                } else {
                    console.log(error);
                    toastAlert("👎 ERROR! 🚫", "Could not collect Earnings - Try again or check Tronscan!")
                }
            });
        });

        $('#approveButton').click(function () {
            LPTOKEN.approve(poolAddress, "1000000000000000000000000").send(function (error, hash) {
                if (!error) {
                    toastAlert("💪 SUCCESS! ✅", "Staking Pool Approved")
                } else {
                    console.log(error);
                    toastAlert("👎 ERROR! 🚫", "Could not approve pool - Try again or check Tronscan!")
                }
            });
        });

        setTimeout(update, 500);
    }

    function update() {
        var account = tronWeb.defaultAddress !== undefined && tronWeb.defaultAddress.base58 !== undefined ? tronWeb.defaultAddress.base58 : null;

        // LPTOKEN CALLS - These are calls about the token being staked to earn FUNC.
        var _userLPTokenBalance;
        var _userLPTokenStake;

        var _lpTokenTotalSupply;

        // REWARD TOKEN CALLS - These are calls about the token being rewarded to users.
        var _userRewardTokenBalance;

        var _rewardsTokenRemaining;
        var _rewardsTokenTotalSupply;

        // POOL CALLS - These are calls about the staking pool, contextual to user.
        var _userRewardTokenEarnings;

        var _rewardRate;
        var _rawRewardRate;
        var _rewardPerToken;

        // var _poolRuntime;

        var _rewardsInADay;
        // var _rewardsInAWeek;
        // var _rewardsInAMonth;
        // var _rewardsInAYear;

        var _totalStaked;

        LPTOKEN.balanceOf(account).call(function (error, result) {
            if (!error) {
                $('#myLPTokens').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _userLPTokenBalance = result;
                console.log("You have " + numberWithCommas((_userLPTokenBalance / 1e18).toFixed(0)) + " LP Tokens in your wallet.");
            } else {
                console.log("ERROR: " + error);
            }
        });

        LPTOKEN.allowance(account, poolAddress).call(function (error, result) {
            if (!error) {
                
                if (result < "9999999000000000000000000") {
                    // Interface hide
                    $('#stakeBox').hide();
                    $('#approveButton').show();
                }

                console.log("Approved: " + numberWithCommas(result / 1e18));

                $('#stakeBox').show();
                $('#approveButton').show();
            } else {
                console.log("ERROR: " + error);
            }
        });

        LPTOKEN.totalSupply().call(function (error, result) {
            if (!error) {
                _lpTokenTotalSupply = result;
                console.log("LP TOKEN: SUPPLY: " + numberWithCommas((_lpTokenTotalSupply / 1e18).toFixed(0)));
            } else {
                console.log("ERROR: " + error);
            }
        });

        REWARDS.balanceOf(account).call(function (error, result) {
            if (!error) {
                $('#myFUNCTokens').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _userRewardTokenBalance = result;
                console.log("REWARD: BALANCE: " + numberWithCommas((_userRewardTokenBalance / 1e18).toFixed(0)) + " FUNC");
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.balanceOf(account).call(function (error, result) {
            if (!error) {
                $('#myStake').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                $('#myStake2').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _userLPTokenStake = result;
                console.log("You have " + numberWithCommas((_userLPTokenStake / 1e18).toFixed(0)) + " LP Tokens currently staked.");
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.earned(account).call(function (error, result) {
            if (!error) {
                $('#myEarned').text(parseFloat(result / 1e18).toFixed(2));
                _userRewardTokenEarnings = result;
                console.log("You have " + numberWithCommas((_userRewardTokenEarnings / 1e18).toFixed(0)) + " FUNC Tokens in your current earnings.");
            } else {
                console.log("ERROR: " + error);
            }
        });

        // NEW READINGS FOR POOL
        TKNPOOL.DURATION().call(function (error, result) {
            if (!error) {
                _poolRuntime = result;
                $('#duration').text((result / 86400) + " Days");
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.starttime().call(function (error, result) {
            if (!error) {
                $('#starttime').text(result);
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.rewardPerToken().call(function (error, result) {
            if (!error) {
                _rewardPerToken = numberWithCommas((result / 1e18).toFixed(3));
                $('#rewardPerToken').text(_rewardPerToken);
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.rewardRate().call(function (error, result) {
            if (!error) {
                _rawRewardRate = result;
                _rewardRate = numberWithCommas((result / 1e18).toFixed(3));
                _rewardsInAnHour = (3600 * _rewardRate).toFixed(0);
                _rewardsInADay = (86400 * _rewardRate).toFixed(0);
                _rewardsInAWeek = (_rewardsInADay * 7).toFixed(0);
                _rewardsInAMonth = (_rewardsInADay * 30).toFixed(0);
                _rewardsInAYear = (_rewardsInADay * 365).toFixed(0);

                $('#hourEarnRate').text(_rewardsInAnHour);
                $('#dayEarnRate').text(numberWithCommas(_rewardsInADay));
                // $('#weekEarnRate').text(numberWithCommas(_rewardsInAWeek));
                // $('#monthEarnRate').text(numberWithCommas(_rewardsInAMonth));
                // $('#yearEarnRate').text(numberWithCommas(_rewardsInAYear));
            } else {
                console.log("ERROR: " + error);
            }
        });

        TKNPOOL.periodFinish().call(function (error, result) {
            if (!error) {
                var _utcSeconds = result;
                var _finishDate = new Date(0);
                _finishDate.setUTCSeconds(_utcSeconds);
                $('#finishDate').text(_finishDate.toDateString());
                $('#finishTime').text(_finishDate.toLocaleTimeString());
            } else {
                console.log("ERROR: " + error);
            }
        });

        // NEW READINGS FOR POOL, ABOVE...

        TKNPOOL.totalSupply().call(function (error, result) {
            if (!error) {
                $('#totalStaked').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _totalStaked = result;
                console.log("There is " + numberWithCommas((_totalStaked / 1e18).toFixed(0)) + " LP Tokens total currently staked.");
            } else {
                console.log("ERROR: " + error);
            }
        });

        REWARDS.balanceOf(poolAddress).call(function (error, result) {
            if (!error) {
                $('#FUNCRemaining').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _rewardsTokenRemaining = result;
                console.log("There is " + numberWithCommas((_rewardsTokenRemaining / 1e18).toFixed(0)) + " FUNC Tokens rewards remaining.");
            } else {
                console.log("ERROR: " + error);
            }
        });

        REWARDS.totalSupply().call(function (error, result) {
            if (!error) {
                $('#totalSupply').text(numberWithCommas(parseFloat(result / 1e18).toFixed(0)));
                _rewardsTokenTotalSupply = result;
                console.log("There is " + numberWithCommas((_rewardsTokenTotalSupply / 1e18).toFixed(0)) + " FUNC Tokens total supply.");
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
