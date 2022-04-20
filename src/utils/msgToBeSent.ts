import Numeral = require("numeral");
import {getCollateralPrices} from './getCollateralPrices'

import {getMahaPrice, getArthToUSD, tvlAprFn, poolTokenVal} from "./api";
import format = require("./formatValues");

const priceFn = async() => {
  const allCollateralPrices = await getCollateralPrices()
  console.log('allCollateralPrices', allCollateralPrices)
}

priceFn()

export const msgToBeSent = async(data: any, chain: string, poolName: string) => {
  let chainLink = "";
  let tvl = "";
  let apr = "";
  let msg = "";
  let poolLPVal = 0;
  let swapName;
  let mahaToken = ''
  const tvlApr = await tvlAprFn();
  const lpPoolValObj = await poolTokenVal();

  if (chain == "Polygon Mainnet") {
    chainLink = "https://polygonscan.com";
    mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
    tvl = tvlApr.polygon.tvl;
    apr = tvlApr.polygon.apr;
    swapName = "QuickSwap";

    if (poolName == "ARTH.usd+3pool") poolLPVal = lpPoolValObj.arthUsdc3Polygon;
    if (poolName === "ARTH/USDC LP") poolLPVal = lpPoolValObj.arthUsdcPolygon;
    if (poolName === "ARTH/MAHA LP") poolLPVal = lpPoolValObj.arthMahaPolygon;

  }
  if (chain == "BSC Mainnet") {
    chainLink = "https://bscscan.com";
    mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
    tvl = tvlApr.bsc.tvl;
    apr = tvlApr.bsc.apr;
    swapName = "PanCakeSwap";

    if (poolName == "ARTH.usd+3eps") poolLPVal = lpPoolValObj.arthUsdc3Bsc;
    if (poolName === "ARTH/BUSD LP") poolLPVal = lpPoolValObj.arthBusdBsc;
    if (poolName === "ARTH/MAHA LP") poolLPVal = lpPoolValObj.arthMahaBsc;
  }

  let eventVal = '';
  const eventUser = data.returnValues.user;
  const url = `${chainLink}/address/${eventUser}`;
  let noOfTotalDots = 0
  let inSwingMsg = ''

  //TroveManager
  if (data.event == "TroveLiquidated") {
    eventVal = format.toDisplayNumber(data.returnValues._coll);
    msg = `${eventVal} MAHA has been liquidated with the debt of ${format.toDisplayNumber(
      data.returnValues._debt
    )} Arth.`;
    noOfTotalDots = Math.ceil(parseFloat(eventVal) / 100);
    inSwingMsg = '🚀  Arth Loan is in swing...'
  }
  if (data.event == "Redemption") {
    eventVal = format.toDisplayNumber(data.returnValues._actualLUSDAmount);
    msg = `${eventVal} ARTH has been redeemed for ${format.toDisplayNumber(
      data.returnValues._ETHSent
    )} MAHA`;
    noOfTotalDots = Math.ceil(parseFloat(eventVal) / 100);
    inSwingMsg = '🚀  Arth Loan is in swing...'
  }

  // BorrowOperation
  if (data.returnValues.operation == "0") {
    eventVal = format.toDisplayNumber(data.returnValues._debt)
    noOfTotalDots = Math.ceil(parseFloat(eventVal) / 100);
    msg = `Loan of *${eventVal}* Arth is taken by [${
      data.returnValues._borrower
    }](https://polygonscan.com/address/${
      data.returnValues._borrower
    }) with collateral of ${format.toDisplayNumber(
      data.returnValues._coll
    )} ${poolName}.`;
    inSwingMsg = '🚀  Arth Loan is in swing...'
  }
  if (data.returnValues.operation == "1") {
    // not getting any values in this event
    msg = `A Loan has been closed by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
    inSwingMsg = '🚀  Arth Loan is in swing...'
  }
  if (data.returnValues.operation == "2") {
    // not getting any values in this event
    msg = `A Loan has been modified by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
    inSwingMsg = '🚀  Arth Loan is in swing...'
  }

  // Farming
  if (data.event == "Staked") {
    if (poolName === "ARTH/USDC LP")
    eventVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
    else eventVal = format.toDisplayNumber(data.returnValues.amount);
    msg = `*${eventVal} ${poolName} ($${Numeral(parseFloat(eventVal) * poolLPVal).format(
      "0.000"
    )})* tokens has been staked on **${swapName} ${poolName} Staking Program** by [${eventUser}](${url})}`;
    noOfTotalDots = Math.ceil((parseFloat(eventVal) * poolLPVal) / 100);
    inSwingMsg = '🚀  Farming is in swing...'
  }
  if (data.event === "Withdrawn") {
    if (poolName === "ARTH/USDC LP")
    eventVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
    else eventVal = format.toDisplayNumber(data.returnValues.amount);
    msg = `*${eventVal} ${poolName} ($${Numeral(parseFloat(eventVal) * poolLPVal).format(
      "0.000"
    )})* tokens has been withdrawn from **${swapName} ${poolName} Staking Program** by [${eventUser}](${url})`;
    noOfTotalDots = Math.ceil((parseFloat(eventVal) * poolLPVal) / 100);
    inSwingMsg = '🚀  Farming is in swing...'
  }
  if (data.event == "RewardPaid") {
    eventVal = format.toDisplayNumber(data.returnValues.reward);
    console.log("RewardPaid", eventVal, data.returnValues.reward);
    msg = `*${eventVal} MAHA* tokens has been claimed as reward from **${swapName} ${poolName} Staking Program** by [${eventUser}](${url})`;
    noOfTotalDots = Math.ceil((parseFloat(eventVal) * poolLPVal) / 100);
    inSwingMsg = '🚀  Farming is in swing...'
  }


  // Leverage
  if (data.event == "PositionOpened") {
    eventVal = format.toDisplayNumber(data.returnValues.principalCollateral[0]);
    noOfTotalDots = Math.ceil(parseFloat(eventVal) / 100);
    msg = `A position has been opened with the collateral of ${eventVal} ${poolName} token by [${data.returnValues.who}](${url})`;
    inSwingMsg = '🚀  Leverage is in swing...'
  }
  if (data.event == "PositionClosed") {
    eventVal = format.toDisplayNumber(data.returnValues.principalCollateral[0])
    noOfTotalDots = Math.ceil(parseFloat(eventVal) / 100);
    msg = `A position has been closed by [${data.returnValues.who}](${url})`;
    inSwingMsg = '🚀  Leverage is in swing...'
  }

  let dots = "";
  for (let i = 0; i < noOfTotalDots; i++) {
    if (data.event == "TroveLiquidated" || data.event == "Redemption" ||
      data.returnValues.operation == "0" || data.event == "Staked" ||
      data.event == "RewardPaid" || data.event == "PositionOpened")
      dots = "🟢 " + dots;
    else if (data.event === "Withdrawn" || data.event == "PositionClosed") dots = "🔴 " + dots;
    else dots = "" + dots;
  }

  const msgToReturn = `
${inSwingMsg}

${msg}

${dots.length ? dots : ""}

*1 MAHA* = *$${await getMahaPrice()}*
*1 ARTH* = *$${await getArthToUSD()}*

TVL in this pool: *$${tvl}*
New APR: *${apr}%*

[MahaDAO](${chainLink}/token/${mahaToken}) | [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
  `;

  return msgToReturn;

}
