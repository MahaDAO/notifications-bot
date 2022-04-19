import Numeral = require("numeral");
// import MessageEmbed = require("discord.js");
// import hyperlink = require("@discordjs/builders");
// import hideLinkEmbed = require("@discordjs/builders");

import {getMahaPrice, getArthToUSD, tvlAprFn, poolTokenVal} from "./api";
import format = require("./formatValues");

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

// export const troveTelegramMsg = async (data, chain, poolName, operation) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";

//     // if(poolName == 'Weth')
//     //   poolLPVal = lpPoolValObj.arthUsdc3Polygon
//     // if(poolName === 'Wdai')
//     //   poolLPVal = lpPoolValObj.arthUsdcPolygon
//     // if(poolName === 'Wmatic')
//     //   poolLPVal = lpPoolValObj.arthMahaPolygon
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";

//     // if(poolName == 'Maha')
//     //   poolLPVal = lpPoolValObj.arthUsdc3Bsc
//     // if(poolName === 'Wbnb')
//     //   poolLPVal = lpPoolValObj.arthBusdBsc
//     // if(poolName === 'Wbusd')
//     //   poolLPVal = lpPoolValObj.arthMahaBsc
//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (data.event == "TroveLiquidated") {
//     farmVal = format.toDisplayNumber(data.returnValues._coll);
//     msg = `${farmVal} MAHA has been liquidated with the debt of ${format.toDisplayNumber(
//       data.returnValues._debt
//     )} Arth.`;
//   }
//   if (data.event == "Redemption") {
//     farmVal = format.toDisplayNumber(data.returnValues._actualLUSDAmount);
//     msg = `${farmVal} ARTH has been redeemed for ${format.toDisplayNumber(
//       data.returnValues._ETHSent
//     )} MAHA`;
//   }

//   const noOfTotalDots = Math.ceil(farmVal / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (operation == "TroveLiquidated" || operation == "Redemption")
//       dots = "🟢 " + dots;
//     else dots = "" + dots;
//   }

//   const msgToReturn = `
// 🚀  Arth Loan is in swing...

// ${msg}

// ${dots.length ? dots : ""}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   return msgToReturn;
// };

// export const troveDiscordMsg = async (data, chain, poolName, operation) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   const poolLPName = poolName;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";

//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (data.event == "TroveLiquidated") {
//     msg = `${format.toDisplayNumber(
//       data.returnValues._coll
//     )} MAHA has been liquidated with the debt of ${format.toDisplayNumber(
//       data.returnValues._debt
//     )} Arth.`;
//   }
//   if (data.event == "Redemption") {
//     msg = `${format.toDisplayNumber(
//       data.returnValues._actualLUSDAmount
//     )} ARTH has been redeemed for ${format.toDisplayNumber(
//       data.returnValues._ETHSent
//     )} MAHA`;
//   }

//   const noOfTotalDots = Math.ceil(farmVal / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (operation == "TroveLiquidated" || operation == "Redemption")
//       dots = "🟢 " + dots;
//     else dots = "" + dots;
//   }

//   const msgToReturn = `
// ${msg}

// ${dots.length ? dots : ""}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   const exampleEmbed = new MessageEmbed()
//     .setColor("#F07D55")
//     .setTitle("🚀  Arth Loan is in swing...")
//     .setDescription(msgToReturn);

//   return exampleEmbed;
// };

// export const borrowOpTelegramMsg = async (data, chain, collName) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";

//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (data.returnValues.operation == "0") {
//     msg = `Loan of *${format.toDisplayNumber(
//       data.returnValues._debt
//     )}* Arth is taken by [${
//       data.returnValues._borrower
//     }](https://polygonscan.com/address/${
//       data.returnValues._borrower
//     }) with collateral of ${format.toDisplayNumber(
//       data.returnValues._coll
//     )} ${collName}.`;
//   }
//   if (data.returnValues.operation == "1") {
//     msg = `A Loan has been closed by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
//   }
//   if (data.returnValues.operation == "2") {
//     msg = `A Loan has been modified by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
//   }

//   // let noOfTotalDots = Math.ceil(farmVal / 100)
//   // let dots = ''
//   // for(let i = 0; i < noOfTotalDots; i++){
//   //   if(operation == 'TroveLiquidated' || operation == 'Redemption')
//   //     dots = '🟢 '  + dots;
//   //   else dots = ''  + dots;
//   // }

//   const msgToReturn = `
// 🚀  Arth Loan is in swing...

// ${msg}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   return msgToReturn;
// };

// export const borrowOpDiscordMsg = async (data, chain, collName) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";
//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (data.returnValues.operation == "0") {
//     msg = `Loan of *${format.toDisplayNumber(
//       data.returnValues._debt
//     )}* Arth is taken by [${
//       data.returnValues._borrower
//     }](https://polygonscan.com/address/${
//       data.returnValues._borrower
//     }) with collateral of ${format.toDisplayNumber(
//       data.returnValues._coll
//     )} ${collName}.`;
//   }
//   if (data.returnValues.operation == "1") {
//     msg = `A Loan has been closed by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
//   }
//   if (data.returnValues.operation == "2") {
//     msg = `A Loan has been modified by [${data.returnValues._borrower}](https://polygonscan.com/address/${data.returnValues._borrower})`;
//   }

//   // let noOfTotalDots = Math.ceil(farmVal / 100)
//   // let dots = ''
//   // for(let i = 0; i < noOfTotalDots; i++){
//   //   if(operation == 'TroveLiquidated' || operation == 'Redemption')
//   //     dots = '🟢 '  + dots;
//   //   else dots = ''  + dots;
//   // }

//   const msgToReturn = `
// 🚀  Arth Loan is in swing...

// ${msg}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   const exampleEmbed = new MessageEmbed()
//     .setColor("#F07D55")
//     .setTitle("🚀  Arth Loan is in swing...")
//     .setDescription(msgToReturn);

//   return exampleEmbed;
// };

// export const farmingTelgramMsg = async (data, chain, lpTokenName, operation) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   let poolLPVal = 0;
//   const poolLPName = lpTokenName;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";

//     if (lpTokenName == "ARTH.usd+3pool")
//       poolLPVal = lpPoolValObj.arthUsdc3Polygon;
//     if (lpTokenName === "ARTH/USDC LP")
//       poolLPVal = lpPoolValObj.arthUsdcPolygon;
//     if (lpTokenName === "ARTH/MAHA LP")
//       poolLPVal = lpPoolValObj.arthMahaPolygon;
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";

//     if (lpTokenName == "ARTH.usd+3eps") poolLPVal = lpPoolValObj.arthUsdc3Bsc;
//     if (lpTokenName === "ARTH/BUSD LP") poolLPVal = lpPoolValObj.arthBusdBsc;
//     if (lpTokenName === "ARTH/MAHA LP") poolLPVal = lpPoolValObj.arthMahaBsc;
//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (operation == "Staked") {
//     if (lpTokenName === "ARTH/USDC LP")
//       farmVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
//     else farmVal = format.toDisplayNumber(data.returnValues.amount);
//     msg = `*${farmVal} ${poolLPName} ($${Numeral(farmVal * poolLPVal).format(
//       "0.000"
//     )})* tokens has been staked on **${swapName} ${poolLPName} Staking Program** by [${farmingUser}](${url})}`;
//   }
//   if (operation === "Withdrawn") {
//     if (lpTokenName === "ARTH/USDC LP")
//       farmVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
//     else farmVal = format.toDisplayNumber(data.returnValues.amount);
//     msg = `*${farmVal} ${poolLPName} ($${Numeral(farmVal * poolLPVal).format(
//       "0.000"
//     )})* tokens has been withdrawn from **${swapName} ${poolLPName} Staking Program** by [${farmingUser}](${url})`;
//   }
//   if (operation == "RewardPaid") {
//     farmVal = format.toDisplayNumber(data.returnValues.reward);
//     console.log("RewardPaid", farmVal, data.returnValues.reward);
//     msg = `*${farmVal} MAHA* tokens has been claimed as reward from **${swapName} ${poolLPName} Staking Program** by [${farmingUser}](${url})`;
//   }

//   const noOfTotalDots = Math.ceil((farmVal * poolLPVal) / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (operation == "Staked" || operation == "RewardPaid") dots = "🟢 " + dots;
//     else if (operation === "Withdrawn") dots = "🔴 " + dots;
//     else dots = "" + dots;
//   }

//   const msgToReturn = `
// 🚀  Farming is in swing...

// ${msg}

// ${dots.length ? dots : ""}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*
// *1 ${poolLPName} Token = $${Numeral(poolLPVal).format("0.000")}*

// TVL in this pool: *$${tvl}*
// New APR: *${apr}%*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   return msgToReturn;
// };

// export const farmingDiscordMsg = async (data, chain, lpTokenName, operation) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   let poolLPVal = 0;
//   const poolLPName = lpTokenName;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";

//     if (lpTokenName == "ARTH.usd+3pool")
//       poolLPVal = lpPoolValObj.arthUsdc3Polygon;
//     if (lpTokenName === "ARTH/USDC LP")
//       poolLPVal = lpPoolValObj.arthUsdcPolygon;
//     if (lpTokenName === "ARTH/MAHA LP")
//       poolLPVal = lpPoolValObj.arthMahaPolygon;
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";

//     if (lpTokenName == "ARTH.usd+3eps") poolLPVal = lpPoolValObj.arthUsdc3Bsc;
//     if (lpTokenName === "ARTH/BUSD LP") poolLPVal = lpPoolValObj.arthBusdBsc;
//     if (lpTokenName === "ARTH/MAHA LP") poolLPVal = lpPoolValObj.arthMahaBsc;
//   }

//   let farmVal;
//   const farmingUser = data.returnValues.user;
//   const url = `${chainLink}/address/${farmingUser}`;

//   if (operation == "Staked") {
//     if (lpTokenName === "ARTH/USDC LP")
//       farmVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
//     else farmVal = format.toDisplayNumber(data.returnValues.amount);
//     msg = `**${farmVal} ${poolLPName} ($${Numeral(farmVal * poolLPVal).format(
//       "0.000"
//     )})** tokens has been staked on **${swapName} ${poolLPName} Staking Program** by ${hyperlink(
//       `${farmingUser}`,
//       url
//     )}`;
//   }
//   if (operation == "Withdrawn") {
//     if (lpTokenName === "ARTH/USDC LP")
//       farmVal = format.toDisplayNumber(data.returnValues.amount * 1000000);
//     else farmVal = format.toDisplayNumber(data.returnValues.amount);
//     msg = `**${farmVal} ${poolLPName} ($${Numeral(farmVal * poolLPVal).format(
//       "0.000"
//     )})** tokens has been withdrawn from **${swapName} ${poolLPName} Staking Program** by ${hyperlink(
//       `${farmingUser}`,
//       url
//     )}`;
//   }
//   if (operation == "RewardPaid") {
//     farmVal = format.toDisplayNumber(data.returnValues.reward);
//     msg = `**${farmVal} MAHA** tokens has been claimed as reward from **${swapName} ${poolLPName} Staking Program** by ${hyperlink(
//       `${farmingUser}`,
//       url
//     )}`;
//   }

//   const noOfTotalDots = Math.ceil((farmVal * poolLPVal) / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (operation == "Staked" || operation == "RewardPaid") dots = "🟢 " + dots;
//     else if (operation === "Withdrawn") dots = "🔴 " + dots;
//     else dots = "" + dots;
//   }

//   console.log("farmVal", farmVal, poolLPName);
//   console.log("poolLPVal", poolLPVal);
//   console.log("dots", noOfTotalDots, dots);

//   const msgToReturn = `
// ${msg}

// ${dots.length ? dots : ""}

// **1 MAHA** = **$${await getMahaPrice()}**
// **1 ARTH** = **$${await getArthToUSD()}**
// **1 ${poolLPName} Token = $${Numeral(poolLPVal).format("0.000")}**

// TVL in this pool: **$${tvl}**
// New APR: **${apr}%**

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//     `;

//   const exampleEmbed = new MessageEmbed()
//     .setColor("#F07D55")
//     .setTitle("🚀  Farming is in swing...")
//     .setDescription(msgToReturn);

//   return exampleEmbed;
// };

// export const leverageTeleMsg = async (data, chain, lpName) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";
//   }

//   let levVal = 1;
//   const levUser = data.returnValues.who;
//   const url = `${chainLink}/address/${levUser}`;

//   if (data.event == "PositionOpened") {
//     levVal = format.toDisplayNumber(data.returnValues.principalCollateral[0]);
//     msg = `A position has been opened with the collateral of ${levVal} ${lpName} token by [${levUser}](${url})`;
//   }
//   if (data.event == "PositionClosed") {
//     // levVal = format.toDisplayNumber(data.returnValues.principalCollateral[0])
//     msg = `A position has been closed by [${levUser}](${url})`;
//   }

//   const noOfTotalDots = Math.ceil(levVal / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (data.event == "PositionOpened") dots = "🟢 " + dots;
//     if (data.event == "PositionClosed") dots = "🔴 " + dots;
//   }

//   const msgToReturn = `
// 🚀  Leverage is in swing...

// ${msg}

// ${dots}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;

//   return msgToReturn;
// };

// export const leverageDiscordMsg = async (data, chain, lpName) => {
//   let chainLink = "";
//   let tvl = "";
//   let apr = "";
//   let msg = "";
//   const poolLPVal = 0;
//   let swapName;

//   const tvlApr = await tvlAprFn();
//   const lpPoolValObj = await poolTokenVal();

//   if (chain == "Polygon Mainnet") {
//     chainLink = "https://polygonscan.com";
//     mahaToken = "0xedd6ca8a4202d4a36611e2fff109648c4863ae19";
//     tvl = tvlApr.polygon.tvl;
//     apr = tvlApr.polygon.apr;
//     swapName = "QuickSwap";
//   }
//   if (chain == "BSC Mainnet") {
//     chainLink = "https://bscscan.com";
//     mahaToken = "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b";
//     tvl = tvlApr.bsc.tvl;
//     apr = tvlApr.bsc.apr;
//     swapName = "PanCakeSwap";
//   }

//   let levVal = 1;
//   const levUser = data.returnValues.who;
//   const url = `${chainLink}/address/${levUser}`;

//   if (data.event == "PositionOpened") {
//     levVal = format.toDisplayNumber(data.returnValues.principalCollateral[0]);
//     msg = `A position has been opened with the collateral of ${levVal} ${lpName} token by [${levUser}](${url})`;
//   }
//   if (data.event == "PositionClosed") {
//     // levVal = format.toDisplayNumber(data.returnValues.principalCollateral[0])
//     msg = `A position has been closed by [${levUser}](${url})`;
//   }

//   const noOfTotalDots = Math.ceil(levVal / 100);
//   let dots = "";
//   for (let i = 0; i < noOfTotalDots; i++) {
//     if (data.event == "PositionOpened") dots = "🟢 " + dots;
//     if (data.event == "PositionClosed") dots = "🔴 " + dots;
//   }

//   const msgToReturn = `
// ${msg}

// ${dots}

// *1 MAHA* = *$${await getMahaPrice()}*
// *1 ARTH* = *$${await getArthToUSD()}*

// [📶 Transaction Hash 📶 ](${chainLink}/tx/${data.transactionHash})
//   `;
//   const exampleEmbed = new MessageEmbed()
//     .setColor("#F07D55")
//     .setTitle("🚀  Leverage is in swing...")
//     .setDescription(msgToReturn);

//   return exampleEmbed;
// };

