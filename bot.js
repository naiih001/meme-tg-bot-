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
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'there';
  const startText = `Hello ${name}! Welcome to the Meme Bot.

This bot can send you memes on demand or when you send messages containing the words "meme" or "lol".

Commands:
/start - Show this welcome message
/meme - Fetch a random meme
/help - Show available commands and usage

Author: naiih001
Twitter: https://twitter.com/naiih001
Telegram: https://t.me/naiih001

Type /help for more details or just send "meme" to get one now. Enjoy!`;

  bot.sendMessage(chatId, startText);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `Available commands:\n\n/start - Show welcome message\n/meme - Fetch a random meme\n/help - Show this help message\n\nYou can also send messages containing "meme" or "lol" to receive a meme automatically.`;
  bot.sendMessage(chatId, helpText);
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

bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      keyboard: [
        ['/meme', '/localmeme'], // row 1
        ['/funny', '/joke'],      // row 2
        ['/help']                  // row 3
      ],
      resize_keyboard: true, // makes it smaller, nicer
      one_time_keyboard: true // disappears after use
    }
  };

  bot.sendMessage(chatId, "Here are the commands you can use:", options);
});

// bot.onText(/\/menu/, (msg) => {
//   const chatId = msg.chat.id;

//   const options = {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: 'Random Meme', callback_data: 'meme' }],
//         [{ text: 'Local Meme', callback_data: 'localmeme' }],
//         [{ text: 'Funny', callback_data: 'funny' }],
//         [{ text: 'Help', callback_data: 'help' }]
//       ]
//     }
//   };

//   bot.sendMessage(chatId, 'Choose a command:', options);
// });

// handle button clicks
// bot.on('callback_query', async (callbackQuery) => {
//   const chatId = callbackQuery.message.chat.id;
//   const data = callbackQuery.data;

//   if (data === 'meme') {
//     const memeUrl = await getMeme();
//     if (memeUrl) bot.sendPhoto(chatId, memeUrl);
//   } else if (data === 'help') {
//     bot.sendMessage(chatId, "Commands: /meme, /localmeme, /funny, /help");
//   }

//   // answerCallbackQuery is required to remove the “loading” icon
//   bot.answerCallbackQuery(callbackQuery.id);
// });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  const text = msg.text?.toLowerCase();

  if (!text) return;

  // Ignore bot commands (like "/meme") to avoid double-sending when
  // a command handler (bot.onText(/\/meme/)) already responds.
  if (msg.entities?.some((e) => e.type === "bot_command") || text.startsWith('/')) return;

  if (text.includes("meme") || text.includes("lol") || text.includes("funny") || text.includes("joke")) {
    const memeUrl = await getMeme();
    if (memeUrl) bot.sendPhoto(chatId, memeUrl);
  }
});
