import nconf from "nconf";
import Web3 from 'web3'
import moment from 'moment'
import rp from 'request-promise'

import votingEscrowAbi from '../../abi/VotingEscrow.json'
import * as telegram from '../../output/telegram'
import * as discord from '../../output/discord'

const DISCORD_STAKING_CHANNEL = nconf.get("Staking_DiscordChannel") // for production
// const DISCORD_STAKING_CHANNEL = nconf.get("Test_DISCORD_CHANNEL_ID") // for staging

// const TELEGRAM_CHAT_ID = nconf.get("TELEGRAM_CHAT_ID") // For production
const TELEGRAM_CHAT_ID = nconf.get("Test_Tele_Chat_Id") // for staging

const mahaXBot = async () => {

  // Polygon
  const web3 = new Web3(nconf.get('MAINNET_MATIC'));
  const mahaxContract = new web3.eth.Contract(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    votingEscrowAbi,
    '0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE'
  );

  let mahaToUsdPrice = await rp(
    `https://api.coingecko.com/api/v3/simple/price?ids=mahadao&vs_currencies=usd`
  );
  const mahaToEthPrice = await rp(
    `https://api.coingecko.com/api/v3/simple/price?ids=mahadao&vs_currencies=eth`
  );

  mahaToUsdPrice = Number(
    JSON.parse(mahaToUsdPrice)["mahadao"]["usd"]
  ).toPrecision(4);
  const ethToMahaPrice = Number(
    1 / JSON.parse(mahaToEthPrice)["mahadao"]["eth"]
  ).toPrecision(6);

  mahaxContract.events
    .allEvents()
    .on("connected", (nr:any) => {
      console.log("connected", nr);
    })
    .on("data", (event:any) => {
      console.log("event", event);
      let msgTemplate = "";

      if (event.event == "Deposit") {
        if (event.returnValues.type == 1 || event.returnValues.type == 2) {
          const noOfGreenDots = Math.ceil(
            Number((event.returnValues.value / 10 ** 18) * mahaToUsdPrice) / 100
          );

          let greenDots = "";
          for (let i = 0; i < noOfGreenDots; i++) {
            greenDots = "🟢 " + greenDots;
          }

          msgTemplate = `
🚀  Governance is in swing...

*${event.returnValues.value / 10 ** 18} ($${
            (event.returnValues.value / 10 ** 18) * mahaToUsdPrice
          }) MAHA* has been locked till *${moment(
            event.returnValues.locktime * 1000
          ).format("DD MMM YYYY")}* by [${
            event.returnValues.provider
          }](https://polygonscan.com/address/${event.returnValues.provider})

${greenDots}

*1 MAHA* = *$${mahaToUsdPrice}*
*1 ETH* = *${ethToMahaPrice} MAHA*
[MahaDAO](https://polygonscan.com/token/0xedd6ca8a4202d4a36611e2fff109648c4863ae19) | [📶 Tx Hash 📶 ](https://polygonscan.com/tx/${
            event.transactionHash
          })
`;
        } else if (event.returnValues.type == 3) {
          msgTemplate = `
🚀  Governance is in swing...

The locking period is extended till *${moment(
            event.returnValues.locktime * 1000
          ).format("DD MMM YYYY")}* by [${
            event.returnValues.provider
          }](https://polygonscan.com/address/${event.returnValues.provider})

*1 MAHA* = *$${mahaToUsdPrice}*
*1 ETH* = *${ethToMahaPrice} MAHA*
[MahaDAO](https://polygonscan.com/token/0xedd6ca8a4202d4a36611e2fff109648c4863ae19) | [📶 Tx Hash 📶 ](https://polygonscan.com/tx/${
            event.transactionHash
          })
        `;
        } else {
          const noOfRedDots = Math.ceil(
            Number((event.returnValues.value / 10 ** 18) * mahaToUsdPrice) / 100
          );

          let redDots = "";
          for (let i = 0; i < noOfRedDots; i++) {
            redDots = "🔴 " + redDots;
          }

          msgTemplate = `
🚀  Governance is in swing...

*${event.returnValues.value / 10 ** 18} ($${
            (event.returnValues.value / 10 ** 18) * mahaToUsdPrice
          }) MAHA* has been withdrawn by [${
            event.returnValues.provider
          }](https://polygonscan.com/address/${event.returnValues.provider})

*1 MAHA* = *$${mahaToUsdPrice}*
*1 ETH* = *${ethToMahaPrice} MAHA*
[MahaDAO](https://polygonscan.com/token/0xedd6ca8a4202d4a36611e2fff109648c4863ae19) | [📶 Tx Hash 📶 ](https://polygonscan.com/tx/${
            event.transactionHash
          })
        `;
        }

        telegram.sendMessage(
          TELEGRAM_CHAT_ID,
          msgTemplate
        )
        discord.sendMessage(
          DISCORD_STAKING_CHANNEL,
          msgTemplate
        )
      }
    })
    .on("changed", (changed:any) => console.log("changed", changed))
    .on("error", (err:any) => console.log("error", err));
};

export default mahaXBot;
