import nconf from "nconf";
import Web3 from 'web3'

import borrowerOperationsAbi from '../../abi/BorrowerOperations.json'
// import {borrowOpTelegramMsg, borrowOpDiscordMsg} from '../../utils/msgToBeSent'
import {msgToBeSent} from '../../utils/msgToBeSent'
import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

// For Create, Update, Close the loan

const borrowingContracts = [
  {
    chainName: 'Polygon Mainnet',
    chainWss: nconf.get('MAINNET_MATIC'),
    contract: [
      {
        collName: 'Weth',
        collAdrs: nconf.get('Matic_Borrow_Weth')
      },
      {
        collName: 'Wdai',
        collAdrs: nconf.get('Matic_Borrow_Wdai')
      },
      {
        collName: 'Wmatic',
        collAdrs: nconf.get('Matic_Borrow_Wmatic')
      },
    ],
  },
  {
    chainName: 'BSC Mainnet',
    chainWss: nconf.get('MAINNET_BSC'),
    contract: [
      {
        collName: 'Maha',
        collAdrs: nconf.get('Bsc_Borrow_Maha')
      },
      {
        collName: 'Wbnb',
        collAdrs: nconf.get('Bsc_Borrow_Wbnb')
      },
      {
        collName: 'Wbusd',
        collAdrs: nconf.get('Bsc_Borrow_Wbusd')
      },
    ],

  }
]

const borrowingOperations = () => {

  borrowingContracts.map((borrowContract: any) => {
    borrowContract.contract.map((adrs: any) => {
      new (new Web3(borrowContract.chainWss)).eth.Contract(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        borrowerOperationsAbi, adrs.collAdrs).events.allEvents()
        .on('connected', (nr:any) => console.log(`connected ${borrowContract.chainName} ${adrs.collName}`))
        .on('data', async(event:any) => {

          console.log('borrowContract', event)
          let telegramMsg: string
          let discordMsg: string

          if(event.event == 'TroveUpdated'){
            telegramMsg = await msgToBeSent(event, borrowContract.chainName, adrs.collName)
            discordMsg = await msgToBeSent(event, borrowContract.chainName, adrs.collName)

            telegram.sendMessage(
              nconf.get("TELEGRAM_EXCHANGE_CHATID"),
              telegramMsg
            )

            discord.sendMessage(
              nconf.get("DISCORD_EXCHANGE_CHANNEL"),
              discordMsg
            )
          }

        })
    })
  })

}

borrowingOperations()
