import nconf from "nconf";
import Web3 from "web3";
import { ethers } from "ethers";

import StableSwapABI from "../../abi/StableSwap.json";
import { toDisplayNumber } from "../../utils/formatValues";

import * as telegram from "../../output/telegram";
import * as discord from "../../output/discord";

const telegramTemplate = (
  tokenSoldAmt: string,
  tokenSold: string,
  tokenBoughtAmt: string,
  tokenBought: string,
  buyer: string,
  transactionHash: string,
  noOfTotalDots: number,
  dotColor: string
) => {
  let dots = "";
  for (let i = 0; i < noOfTotalDots; i++) {
    if (dotColor == "red") dots = "🔴 " + dots;
    else if (dotColor == "green") dots = "🟢 " + dots;
  }

  return `🚀  *${tokenSoldAmt} ${tokenSold}* has been sold for *${tokenBoughtAmt} ${tokenBought}* by [${buyer}](https://polygonscan.com/address/${buyer})

${dots}

*1 ARTH* = *$${constants.getArthToUSD()}*

[📶 Transaction Hash 📶 ](https://polygonscan.com/tx/${transactionHash})
`;
};

const discordTemplate = (
  tokenSoldAmt: string,
  tokenSold: string,
  tokenBoughtAmt: string,
  tokenBought: string,
  buyer: string,
  transactionHash: string,
  noOfTotalDots: number,
  dotColor: string
) => {
  let dots = "";
  for (let i = 0; i < noOfTotalDots; i++) {
    if (dotColor == "red") dots = "🔴 " + dots;
    else if (dotColor == "green") dots = "🟢 " + dots;
  }

  return `🚀  *${tokenSoldAmt} ${tokenSold}* has been sold for *${tokenBoughtAmt} ${tokenBought}* by [${buyer}](https://polygonscan.com/address/${buyer})

${dots}

*1 ARTH* = *$${constants.getArthToUSD()}*

[📶 Transaction Hash 📶 ](https://polygonscan.com/tx/${transactionHash})
`;
};

const main = () => {
  const web3 = new Web3(nconf.get("POLYGON_PROVIDER"));
  const contract = new web3.eth.Contract(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    StableSwapABI,
    nconf.get("POLYGON_CURVE_CONTRACT")
  );

  contract.events
    .allEvents()
    .on("connected", () => console.log("connected"))
    .on("data", async (data: any) => {
      let dotColor = "";

      if (data.event != "TokenExchangeUnderlying") return;

      let tokenSold = "";
      let tokenSoldAmt = "";
      let tokenBought = "";
      let tokenBoughtAmt = "";
      let noOfTotalDots = 0;

      if (data.returnValues.sold_id == "0") {
        tokenSold = "Arth.usd";
        tokenSoldAmt = toDisplayNumber(data.returnValues.tokens_sold);
        noOfTotalDots = Math.ceil(Number(tokenSoldAmt) / 100);
        dotColor = "red";
      } else if (data.returnValues.sold_id == "1") {
        tokenSold = "DAI";
        tokenSoldAmt = toDisplayNumber(data.returnValues.tokens_sold);
      } else if (data.returnValues.sold_id == "2") {
        tokenSold = "USDC";
        tokenSoldAmt = ethers.utils.formatUnits(
          data.returnValues.tokens_sold,
          6
        );
      } else {
        tokenSold = "USDT";
        tokenSoldAmt = ethers.utils.formatUnits(
          data.returnValues.tokens_sold,
          6
        );
      }

      if (data.returnValues.bought_id == "0") {
        tokenBought = "Arth.usd";
        tokenBoughtAmt = toDisplayNumber(data.returnValues.tokens_bought);
        noOfTotalDots = Math.ceil(Number(tokenBoughtAmt) / 100);
        dotColor = "green";
      } else if (data.returnValues.bought_id == "1") {
        tokenBought = "DAI";
        tokenBoughtAmt = toDisplayNumber(data.returnValues.tokens_bought);
      } else if (data.returnValues.bought_id == "2") {
        tokenBought = "USDC";
        tokenBoughtAmt = ethers.utils.formatUnits(
          data.returnValues.tokens_bought,
          6
        );
      } else {
        tokenBought = "USDT";
        tokenBoughtAmt = ethers.utils.formatUnits(
          data.returnValues.tokens_bought,
          6
        );
      }

      telegram.sendMessage(
        nconf.get("TELEGRAM_EXCHANGE_CHATID"),
        telegramTemplate(
          tokenSoldAmt,
          tokenSold,
          tokenBoughtAmt,
          tokenBought,
          data.returnValues.buyer,
          data.transactionHash,
          noOfTotalDots,
          dotColor
        )
      );

      discord.sendMessage(
        nconf.get("DISCORD_EXCHANGE_CHANNEL"),
        discordTemplate(
          tokenSoldAmt,
          tokenSold,
          tokenBoughtAmt,
          tokenBought,
          data.returnValues.buyer,
          data.transactionHash,
          noOfTotalDots,
          dotColor
        )
      );
    });
};

main();
