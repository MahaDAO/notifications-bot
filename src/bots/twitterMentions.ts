import Twit from 'twit'
import nconf from 'nconf'

import * as discord from '../output/discord'
import {config} from '../utils/config'

export const twitterMetions = (mode: any) => {

   let msgTemplate: string
   const T = new Twit({
    consumer_key: nconf.get("TWITTER_API_KEY"),
    consumer_secret: nconf.get("TWITTER_API_SECRET"),
    access_token: nconf.get("TWITTER_ACCESS_TOKEN"),
    access_token_secret: nconf.get("TWITTER_ACCESS_TOKEN_SECRET")
   })

   const stream = T.stream('statuses/filter', {
     follow: ['2170763245'],
     track: ['$MAHA', '@TheMahaDAO']
   })

   stream.on('tweet', (tweet: any) => {
     console.log('tweet', tweet)
     msgTemplate = '$MAHA tweet'
     discord.sendMessage(
      mode === 'production' ? config().production.DISCORD.twitterMention : config().staging.DISCORD,
      msgTemplate
     )
   })

}

