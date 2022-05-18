import Web3 from 'web3'
import nconf from 'nconf'

import MAHAX from '../../abi/MAHAX.json'
import * as discord from '../../output/discord'
import * as telegram from '../../output/telegram'
import { msgToBeSent } from '../../utils/msgToBeSent';
import { config } from '../../utils/config';

export default function mahaxNFT(mode: string) {

  const web3 = new Web3(nconf.get('TESTNET_MATIC'))
  const contract = new web3.eth.Contract(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    MAHAX, '0x59bbf85776dB53429653559F4dF8078c045a8266')

  console.log('mahaxNFT', contract.events)

  contract.events.allEvents()
    .on("connected", (nr: any) => console.log('MahaXNFT connected'))
    .on("data", async(data: any) => {
      console.log('data', data)
      let telegramMsg = "";
      let discordMsg = "";

      if (data.event == "Deposit"){

        telegramMsg = await msgToBeSent(data, '', '', 'mahaxnft')
        discordMsg =  await msgToBeSent(data, '', '', 'mahaxnft')

        telegram.sendMessage(
          mode === 'production' ? config().production.TELEGRAM_CHAT_ID : config().staging.TELEGRAM_CHAT_ID,
          telegramMsg
        )
        discord.sendMessage(
          mode === 'production' ? config().production.DISCORD.mahax : config().staging.DISCORD,
          discordMsg
        )
      }
    })
    .on("error", (err:any) => console.log("error", err));

}
