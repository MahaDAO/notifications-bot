import nconf from "nconf";
import Web3 from 'web3'
import ethers from 'ethers'
import vyperContractAbi from '../abi/vyperContractAbi.json'
import * as telegram from '../output/telegram'
import * as discord from '../output/discord'
import {toDisplayNumber} from '../utils/formatValues'
import {getArthToUSD} from '../utils/api'

const DISCORD_STAKING_CHANNEL = nconf.get("Staking_DiscordChannel") // for production
// const DISCORD_STAKING_CHANNEL = nconf.get("Test_DISCORD_CHANNEL_ID") // for staging

// const TELEGRAM_CHAT_ID = nconf.get("TELEGRAM_CHAT_ID") // For production
const TELEGRAM_CHAT_ID = nconf.get("Test_Tele_Chat_Id") // for staging

const quickSwap = () => {

  const web3Vyper = new Web3(nconf.get('MAINNET_MATIC'));
  const vyperContract = new web3Vyper.eth.Contract(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vyperContractAbi,
    '0xDdE5FdB48B2ec6bc26bb4487f8E3a4EB99b3d633'
  );

  vyperContract.events
    .allEvents()
    .on("connected", (nr:any) => console.log("connected"))
    .on("data", async (data:any) => {
      console.log("data", data);
      let dotColor = "";
      let telegramMsg = ''
      let discordMsg = ''

      if (data.event == "TokenExchangeUnderlying") {
        let tokenSold: string;
        let tokenSoldAmt: string;
        let tokenBought: string;
        let tokenBoughtAmt: string;
        let noOfTotalDots: number;
        let dots = '';

        if (data.returnValues.sold_id == "0") {
          tokenSold = "Arth.usd";
          tokenSoldAmt = toDisplayNumber(data.returnValues.tokens_sold);
          noOfTotalDots = Math.ceil(parseInt(tokenSoldAmt) / 100);
          dotColor = "red";
          for (let i = 0; i < noOfTotalDots; i++) {
            if (dotColor == "red") dots = "🔴 " + dots;
            else if (dotColor == "green") dots = "🟢 " + dots;
            else dots = "";
          }
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
          tokenBoughtAmt = toDisplayNumber(
            data.returnValues.tokens_bought
          );
          noOfTotalDots = Math.ceil(parseInt(tokenBoughtAmt) / 100);
          dotColor = "green";
          for (let i = 0; i < noOfTotalDots; i++) {
            if (dotColor == "red") dots = "🔴 " + dots;
            else if (dotColor == "green") dots = "🟢 " + dots;
            else dots = "";
          }
        } else if (data.returnValues.bought_id == "1") {
          tokenBought = "DAI";
          tokenBoughtAmt = toDisplayNumber(
            data.returnValues.tokens_bought
          );
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

        telegramMsg = `🚀  *${tokenSoldAmt} ${tokenSold}* has been sold for *${tokenBoughtAmt} ${tokenBought}* by [${
          data.returnValues.buyer
        }](https://polygonscan.com/address/${data.returnValues.buyer})

${dots}

*1 ARTH* = *$${await getArthToUSD()}*

[📶 Transaction Hash 📶 ](https://polygonscan.com/tx/${data.transactionHash})
        `;

        discordMsg = `🚀  **${tokenSoldAmt} ${tokenSold}** has been sold for **${tokenBoughtAmt} ${tokenBought}** by [${
          data.returnValues.buyer
        }](https://polygonscan.com/address/${data.returnValues.buyer})

${dots}

**1 ARTH** = **$${await getArthToUSD()}**

[📶 Transaction Hash 📶 ](https://polygonscan.com/tx/${data.transactionHash})
        `;
      }

      telegram.sendMessage(
        TELEGRAM_CHAT_ID,
        telegramMsg
      )
      discord.sendMessage(
        DISCORD_STAKING_CHANNEL,
        discordMsg
      )
    })
    .on("changed", (changed:any) => console.log("changed", changed))
    .on("error", (err:any) => console.log("error", err));
};

export default quickSwap;
