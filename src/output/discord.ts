import nconf from "nconf";
import { Client, Intents, MessageEmbed, TextChannel } from "discord.js";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
  ],
});

client.on("ready", () =>
  console.log(`DISCORD: Logged in as ${client.user?.tag}!`)

);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName == "maha") await interaction.reply("DAO!");
});

client.on("messageCreate", (msg) => {
  if (msg.content.toLowerCase() == "maha") msg.channel.send("DAO");
});

client.user?.setUsername('Maha')

const DISCORD_TOKEN = nconf.get('MAHA_DiscordClientToken') // for production
// const DISCORD_TOKEN = nconf.get('Test_DISCORD_TOKEN') // for testing

console.log('DISCORD_TOKEN', DISCORD_TOKEN)

client.login(DISCORD_TOKEN); //login bot using token

export const sendMessage = (channelName: any, messageMarkdown: string, user?: any) => {
  const channel = client.channels.cache.get(channelName);


  let discordMsgEmbed: any
  if(user){
    console.log('if user')
    // client.user?.setUsername(user.screen_name)
    // client.user?.setAvatar(user.profile_image_url)
    discordMsgEmbed = new MessageEmbed()
    .setColor("#F07D55")
    .setDescription(messageMarkdown)
    .setAuthor({
      name: user.name,
      iconURL: user.profile_image_url
    })
  }
  else{
    client.user?.setUsername('Maha')

    discordMsgEmbed = new MessageEmbed()
      .setColor("#F07D55")
      .setDescription(messageMarkdown)

  }

  if (channel) (channel as TextChannel).send({ embeds: [discordMsgEmbed] });
};
