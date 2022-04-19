import nconf from "nconf";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(nconf.get("TELEGRAM_BOT_TOKEN"), { polling: true });

export const sendMessage = (chatId: string, messageMarkdown: string) => {
  bot.sendMessage(chatId, messageMarkdown, {
    parse_mode: "Markdown",
    disable_web_page_preview: true
  });
};
