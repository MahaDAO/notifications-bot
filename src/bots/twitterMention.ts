import Twit from 'twit'
import nconf from 'nconf'

import * as discord from '../output/discord'
import {config} from '../utils/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const twitterMetions = (mode: any) => {

   let msgTemplate: string
   const T = new Twit({
    consumer_key: nconf.get("TWITTER_API_KEY"),
    consumer_secret: nconf.get("TWITTER_API_SECRET"),
    access_token: nconf.get("TWITTER_ACCESS_TOKEN"),
    access_token_secret: nconf.get("TWITTER_ACCESS_TOKEN_SECRET")
   })

   const whiteListedUsers = [
    '2170763245', // Rupali Doke
    '1324641632', // Alan Johnson
    '1375011044305874946', // SebGme92
    '904268827927523328', // Rahul_2503
    '1431215677604511751', // magxitoken
    '318597303', // MarianMnt
    '759100185297367040', // cryptomickbit
    '767252878209744896', // senamakel
    '804802806', // Akdite
   ]

   const trackWords = [
    '$MAHA',
    '@TheMahaDAO'
   ]

   const stream = T.stream('statuses/filter', {
     follow: whiteListedUsers,
     track: trackWords,

    })

   const discord_channel = config().staging.DISCORD

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   stream.on('tweet', (tweet: any) => {
    if(whiteListedUsers.includes(tweet.user.id_str) &&
      (trackWords.some(word => tweet.text.includes(word))) &&
        !tweet.retweeted && !tweet.retweeted_status && !tweet.in_reply_to_status_id &&
        !tweet.in_reply_to_status_id_str && !tweet.in_reply_to_user_id &&
        !tweet.in_reply_to_user_id_str && !tweet.in_reply_to_screen_name
        ) {
        console.log('tweet', tweet)

        console.log('discord_channel', discord_channel)
        msgTemplate = `${tweet.text}`

        discord.sendMessage(
          mode === 'production' ? config().production.DISCORD.twitterMention : config().staging.DISCORD,
          msgTemplate,
          tweet.user)
      }
    else{
      console.log('not includes hence do not send')
    }
   })

}
