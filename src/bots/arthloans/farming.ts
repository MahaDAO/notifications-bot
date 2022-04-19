import nconf from "nconf";
nconf.argv().env().file({ file: '../../../config.json' });

import Web3 from 'web3'

import farmingAbi from "../../abi/BasicStaking.json";
// import {farmingTelgramMsg, farmingDiscordMsg} from "../../utils/msgToBeSent";
import {msgToBeSent} from '../../utils/msgToBeSent'

import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const basicStaking = [
  {
    contrat: [
      {
        lpTokenName: "ARTH.usd+3pool",
        lpTokenAdrs: nconf.get('MaticMain_BSArthUsd3Pool'),
      },
      {
        lpTokenName: "ARTH/USDC LP",
        lpTokenAdrs: nconf.get('MaticMain_BSArthUsdc'),
      },
      {
        lpTokenName: "ARTH/MAHA LP",
        lpTokenAdrs: nconf.get('MaticMain_BSArthMaha'),
      },
    ],
    chainWss: nconf.get('MAINNET_MATIC'),
    chainName: "Polygon Mainnet",
  },
  {
    contrat: [
      {
        lpTokenName: "ARTH.usd+3eps",
        lpTokenAdrs: nconf.get('BscMain_BSArthUsd3eps'),
      },
      {
        lpTokenName: "ARTH/BUSD LP",
        lpTokenAdrs: nconf.get('BscMain_BSArthBusdc'),
      },
      {
        lpTokenName: "ARTH/MAHA LP",
        lpTokenAdrs: nconf.get('BscMain_BSArthMaha'),
      },
    ],
    chainWss: nconf.get('MAINNET_BSC'),
    chainName: "BSC Mainnet",
  },
];

export const farming = async () => {

  console.log('test', nconf.get("MAHA_DiscordChannel"))
  basicStaking.map((farm) => {
    farm.contrat.map((cont) => {
      new new Web3(farm.chainWss).eth.Contract(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        farmingAbi,
        cont.lpTokenAdrs
      ).events
        .allEvents()
        .on("connected", (nr:any) =>
          console.log(`connected ${farm.chainName} ${cont.lpTokenName}`)
        )
        .on("data", async (data:any) => {
          console.log("data", data);
          let telegramMsg = "";
          let discordMsg = "";

          if (data.event == "Staked") {
            telegramMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
            discordMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
          }

          if (data.event == "Withdrawn") {
            telegramMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
            discordMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
          }

          if (data.event == "RewardPaid") {
            telegramMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
            discordMsg = await msgToBeSent(
              data,
              farm.chainName,
              cont.lpTokenName,
            );
          }
          telegram.sendMessage(
            nconf.get("TELEGRAM_CHAT_ID"),
            telegramMsg
          )
          discord.sendMessage(
            nconf.get("MAHA_DiscordChannel"),
            discordMsg
          )
        })
        .on("changed", (changed:any) => console.log("changed", changed))
        .on("error", (err:any) => console.log("error farming", err));
    });
  });
};

farming();
