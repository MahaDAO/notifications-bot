import nconf from "nconf";
import Web3 from 'web3'

import borrowerOperationsAbi from '../../abi/BorrowerOperations.json'
// import {borrowOpTelegramMsg, borrowOpDiscordMsg} from '../../utils/msgToBeSent'
import {msgToBeSent} from '../../utils/msgToBeSent'
import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const DISCORD_STAKING_CHANNEL = nconf.get("Staking_DiscordChannel") // for production
// const DISCORD_STAKING_CHANNEL = nconf.get("Test_DISCORD_CHANNEL_ID") // for staging

// const TELEGRAM_CHAT_ID = nconf.get("TELEGRAM_CHAT_ID") // For production
const TELEGRAM_CHAT_ID = nconf.get("Test_Tele_Chat_Id") // for staging

// For Create, Update, Close the loan

const borrowingContracts = [
  {
    chainName: 'Polygon Mainnet',
    chainWss: nconf.get('MAINNET_MATIC'),
    contract: [
      {
        collName: 'WETH',
        collAdrs: '0x5F3fD21232C976773233f8E5F5d6564cf2820512'
      },
      {
        collName: 'DAI',
        collAdrs: '0x240AE60633D340AEDDE68F57AF47D26bf270b8f6'
      },
      {
        collName: 'WMATIC',
        collAdrs: '0x87FfC8AD29A87bD4a5F1927b0f8991b18dED8787'
      },
      {
        collName: 'USDCUSDT-QLP-S',
        collAdrs: '0x123086374B0fCe322EbDb7CBbFe454856Ef88524'
      }
    ],
  },
  {
    chainName: 'BSC Mainnet',
    chainWss: nconf.get('MAINNET_BSC'),
    contract: [
      {
        collName: 'MAHA',
        collAdrs: '0xd55555376f9A43229Dc92abc856AA93Fee617a9A'
      },
      {
        collName: 'WBNB',
        collAdrs: '0x20B8B7BA955617b8661D88709698DA15005cdCb3'
      },
      {
        collName: 'BUSD',
        collAdrs: '0x36a669C9CF3e225c5F73efe065074f7D88a69fd8'
      },
      {
        collName: 'BUSDUSDC-APE-LP-S',
        collAdrs: '0x3f3cdCC49599600EeaF7c6e11Da2E377BDEE95cA'
      },
      {
        collName: 'BUSDUSDT-APE-LP-S',
        collAdrs: '0xE4E773433Be8cc3ABDa9Bb5393C97336F27AE76b'
      }
    ],

  },
  {
    chainName: 'Ethereum',
    chainWss: nconf.get('MAINNET_ETH'),
    contract: [
      {
        collName: 'WETH',
        collAdrs: '0xE28bc1785a7DedFef0eA8890C238A6377c756106'
      },
      {
        collName: 'FXS',
        collAdrs: '0x98280255Db799E9aD303A34EBf745ee53B404117'
      }
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
              TELEGRAM_CHAT_ID,
              telegramMsg
            )

            discord.sendMessage(
              DISCORD_STAKING_CHANNEL,
              discordMsg
            )
          }

        })
    })
  })

}

export default borrowingOperations
