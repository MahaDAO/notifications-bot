import nconf from "nconf";
import Web3 from 'web3'

import leverageAbi from '../../abi/ILeverageStrategy.json'
// import {leverageTeleMsg, leverageDiscordMsg} from '../../utils/msgToBeSent'
import {msgToBeSent} from '../../utils/msgToBeSent'
import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const DISCORD_STAKING_CHANNEL = nconf.get("Staking_DiscordChannel") // for production
// const DISCORD_STAKING_CHANNEL = nconf.get("Test_DISCORD_CHANNEL_ID") // for staging

// const TELEGRAM_CHAT_ID = nconf.get("TELEGRAM_CHAT_ID") // For production
const TELEGRAM_CHAT_ID = nconf.get("Test_Tele_Chat_Id") // for staging

const leverageObj = [
  // {
  //   contract: '0x7b8b7f1a6e555f9c1e357b5ffe4879fe6e563e55',
  //   chainWss: nconf.get('MAINNET_MATIC'),
  //   chainName: 'Polygon Mainnet'
  // },
  {
    contract: [
      {
        lpName: "BUSD/USDC ApeSwap",
        lpAdrs: "0x3F893bc356eC4932A1032588846F4c5e3BC670Dc",
      },
      {
        lpName: "BUSD/USDT ApeSwap",
        lpAdrs: "0x78DE5b23734EEbF408CEe5c06E51827e03bCD98d",
      },
    ],
    chainWss: nconf.get('MAINNET_BSC'),
    chainName: "BSC Mainnet",
  },
];

const leverage = async () => {
  leverageObj.map((lev) => {
    lev.contract.map((cont) => {
      new new Web3(lev.chainWss).eth.Contract(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        leverageAbi, cont.lpAdrs).events
        .allEvents()
        .on("connected", (nr:any) =>
          console.log("connected", lev.chainName, cont.lpName)
        )
        .on("data", async (data:any) => {
          console.log("data", data);
          let telegramMsg = "";
          let discordMsg = "";

          if (
            data.event == "PositionOpened" ||
            data.event == "PositionClosed"
          ) {
            telegramMsg = await msgToBeSent(
              data,
              lev.chainName,
              cont.lpName
            );
            discordMsg = await msgToBeSent(
              data,
              lev.chainName,
              cont.lpName
            );
          }

          telegram.sendMessage(
            TELEGRAM_CHAT_ID,
            telegramMsg
          )
          discord.sendMessage(
            DISCORD_STAKING_CHANNEL,
            discordMsg
          )
        });
    });
  });
};

export default leverage;
