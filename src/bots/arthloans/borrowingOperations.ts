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
        collAdrs: '0x5F3fD21232C976773233f8E5F5d6564cf2820512'
      },
      {
        collName: 'Wdai',
        collAdrs: '0x240AE60633D340AEDDE68F57AF47D26bf270b8f6'
      },
      {
        collName: 'Wmatic',
        collAdrs: '0x87FfC8AD29A87bD4a5F1927b0f8991b18dED8787'
      },
    ],
  },
  {
    chainName: 'BSC Mainnet',
    chainWss: nconf.get('MAINNET_BSC'),
    contract: [
      {
        collName: 'Maha',
        collAdrs: '0xd55555376f9A43229Dc92abc856AA93Fee617a9A'
      },
      {
        collName: 'Wbnb',
        collAdrs: '0x20B8B7BA955617b8661D88709698DA15005cdCb3'
      },
      {
        collName: 'Wbusd',
        collAdrs: '0x36a669C9CF3e225c5F73efe065074f7D88a69fd8'
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
