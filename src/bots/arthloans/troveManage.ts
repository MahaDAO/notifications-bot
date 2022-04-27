
import nconf from "nconf";
import Web3 from 'web3'

import troveManagerAbi from "../../abi/TroveManager.json";
// import {troveTelegramMsg, troveDiscordMsg} from "../../utils/msgToBeSent";
import {msgToBeSent} from '../../utils/msgToBeSent'

import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const DISCORD_STAKING_CHANNEL = nconf.get("Staking_DiscordChannel") // for production
// const DISCORD_STAKING_CHANNEL = nconf.get("Test_DISCORD_CHANNEL_ID") // for staging

// const TELEGRAM_CHAT_ID = nconf.get("TELEGRAM_CHAT_ID") // For production
const TELEGRAM_CHAT_ID = nconf.get("Test_Tele_Chat_Id") // for staging

// For Redeem and Liquidate

const troveContracts = [
  {
    chainName: 'Polygon Mainnet',
    chainWss: nconf.get('MAINNET_MATIC'),
    contracts: [
      {
        poolName: 'Weth',
        poolAdrs: '0x5344950d34E8959c7fb6645C839A7cA89BE18216'
      },
      {
        poolName: 'Dai',
        poolAdrs: '0x7df27F6B3C8A2b6219352A434872DcDd8f5a50E4'
      },
      {
        poolName: 'Wmatic',
        poolAdrs: '0x8C021C5a2910D1812542D5495E4Fbf6a6c33Cb4f'
      },
      {
        poolName: 'USDCUSDT-QLP-S',
        poolAdrs: '0x2d1F24127AE8670eB9A9a36E81420fb030Ea953D'
      }
    ]
  },
  {
    chainName: 'BSC Mainnet',
    chainWss: nconf.get('MAINNET_BSC'),
    contracts: [
      {
        poolName: 'Busd',
        poolAdrs: '0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB'
      },
      {
        poolName: 'Maha',
        poolAdrs: '0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB'
      },
      {
        poolName: 'Wbnb',
        poolAdrs: '0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE'
      },
      {
        poolName: 'BUSDUSDC-APE-LP-S',
        poolAdrs: '0x21F2c7a2E91842961a66c729b96844a7c608D633'
      },
      {
        poolName: 'BUSDUSDT-APE-LP-S',
        poolAdrs: '0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea'
      },
    ]
  }
]

// For Redeem and Liquidate
const troveManage = () => {

  troveContracts.map((troveContract) => {
    troveContract.contracts.map((adrs) => {
      new (new Web3(troveContract.chainWss)).eth.Contract(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        troveManagerAbi, adrs.poolAdrs).events.allEvents()
        .on('connected', (nr:any) => console.log(`connected ${troveContract.chainName} ${adrs.poolName}`))
        .on('data', async(event:any) => {

          console.log('troveManagerContract', event)
          let telegramMsg = ''
          let discordMsg = ''

          if(event.event == 'TroveLiquidated' || event.event == 'Redemption'){
            telegramMsg = await msgToBeSent(event, troveContract.chainName, adrs.poolName)
            discordMsg = await msgToBeSent(event, troveContract.chainName, adrs.poolName)
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
    })
  })

}

export default troveManage
