import nconf from "nconf";
import { Client, Intents, MessageEmbed, TextChannel } from "discord.js";

const client = new Client({
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

const DISCORD_TOKEN = nconf.get('MAHA_DiscordClientToken') // for production
// const DISCORD_TOKEN = nconf.get('Test_DISCORD_TOKEN') // for testing


client.login(DISCORD_TOKEN); //login bot using token

export const sendMessage = (channelName: any, messageMarkdown: string) => {
  const channel = client.channels.cache.get(channelName);

  const discordMsgEmbed = new MessageEmbed()
    .setColor("#F07D55")
    .setDescription(messageMarkdown);

  if (channel) (channel as TextChannel).send({ embeds: [discordMsgEmbed] });
};
