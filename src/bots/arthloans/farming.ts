import nconf from "nconf";
import Web3 from 'web3'

import farmingAbi from "../../abi/BasicStaking.json";
import {msgToBeSent} from '../../utils/msgToBeSent'

import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const basicStaking = [
  {
    contrat: [
      {
        lpTokenName: "ARTH.usd+3pool",
        lpTokenAdrs: '0x245AE0bBc1E31e7279F0835cE8E93127A13a3781',
      },
      {
        lpTokenName: "ARTH/USDC LP",
        lpTokenAdrs: '0xD585bfCF37db3C2507e2D44562F0Dbe2E4ec37Bc',
      },
      {
        lpTokenName: "ARTH/MAHA LP",
        lpTokenAdrs: '0xc82c95666be4e89aed8ae10bab4b714cae6655d5',
      },
    ],
    chainWss: nconf.get('MAINNET_MATIC'),
    chainName: "Polygon Mainnet",
  },
  {
    contrat: [
      {
        lpTokenName: "ARTH.usd+3eps",
        lpTokenAdrs: '0x8fF204D06B39a19Bd8c8367302bfCB329214c14B',
      },
      {
        lpTokenName: "ARTH/BUSD LP",
        lpTokenAdrs: '0xe8b16cab47505708a093085926560a3eb32584b8',
      },
      {
        lpTokenName: "ARTH/MAHA LP",
        lpTokenAdrs: '0x7699d230Ba47796fc2E13fba1D2D52Ecb0318c33',
      },
    ],
    chainWss: nconf.get('MAINNET_BSC'),
    chainName: "BSC Mainnet",
  },
];

export const farming = async () => {

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

