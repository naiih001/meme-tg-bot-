const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

async function getMeme() {
  try {
    const res = await axios.get("https://meme-api.com/gimme");
    return res.data.url;
  } catch (error) {
    console.error("Error fetching meme:", error);
    return null;
  }
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Hello ${msg.from.first_name}, welcome to the bot!`
  );
});

bot.onText(/\/meme/, async (msg) => {
  const chatId = msg.chat.id;
  const memeUrl = await getMeme();
  if (!memeUrl) {
    bot.sendMessage(chatId, "Sorry, could not fetch a meme at this time.");
    return;
  }
  bot.sendPhoto(chatId, memeUrl);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (text.includes("meme") || text.includes("lol")) {
    const memeUrl = await getMeme();
    if (memeUrl) bot.sendPhoto(chatId, memeUrl);
  }
});
