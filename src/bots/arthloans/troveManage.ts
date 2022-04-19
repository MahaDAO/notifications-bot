
import nconf from "nconf";
import Web3 from 'web3'

import troveManagerAbi from "../../abi/TroveManager.json";
// import {troveTelegramMsg, troveDiscordMsg} from "../../utils/msgToBeSent";
import {msgToBeSent} from '../../utils/msgToBeSent'

import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

// For Redeem and Liquidate

const troveContracts = [
  {
    chainName: 'Polygon Mainnet',
    chainWss: nconf.get('MAINNET_MATIC'),
    contracts: [
      {
        poolName: 'Weth',
        poolAdrs: nconf.get('Matic_TroveM_Weth')
      },
      {
        poolName: 'Wdai',
        poolAdrs: nconf.get('Matic_TroveM_Wdai')
      },
      {
        poolName: 'Wmatic',
        poolAdrs: nconf.get('Matic_TroveM_Wmatic')
      },
    ]
  },
  {
    chainName: 'BSC Mainnet',
    chainWss: nconf.get('MAINNET_BSC'),
    contracts: [
      {
        poolName: 'Maha',
        poolAdrs: nconf.get('Bsc_TroveM_Maha')
      },
      {
        poolName: 'Wbnb',
        poolAdrs: nconf.get('Bsc_TroveM_Wbnb')
      },
      {
        poolName: 'Wbusd',
        poolAdrs: nconf.get('Bsc_TroveM_Wbusd')
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
            nconf.get("TELEGRAM_EXCHANGE_CHATID"),
            telegramMsg
          )
          discord.sendMessage(
            nconf.get("DISCORD_EXCHANGE_CHANNEL"),
            discordMsg
          )

        })
    })
  })

}

troveManage()
