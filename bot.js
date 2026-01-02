import supbase from "./supabase.js";

import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const bot = new TelegramBot(token);
bot.setWebHook(`${webhookUrl}`);

const app = express();
app.use(express.json());

const serverStart = Date.now();

app.get("/health", async (req, res) => {
  const start = Date.now();
  let ping = null;
  try {
    await axios.get("https://api.telegram.org", { timeout: 2000 });
    ping = Date.now() - start;
  } catch (error) {
    ping = null;
  }

  res.json({
    status: "ok",
    uptime: process.uptime(),
    since: new Date(serverStart).toISOString(),
    ping_ms: ping,
  });
});

app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

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
  const name = msg.from.first_name || "there";
  const startText = `Hello ${name}! Welcome to the Meme Bot.

This bot can send you memes on demand or when you send messages containing the words "meme", "lol", "funny", or "joke".

Quick Commands:
/start - Show this welcome message
/meme - Fetch a random meme now
/help - Show available commands and usage
/menu - Open a quick command keyboard

Author: naiih001
Twitter: https://x.com/isaac_hayab
Telegram: https://t.me/naiih069

Tip: send a short message containing "meme" or "lol" (without starting with \`/\`) to receive an automatic meme.`;

  bot.sendMessage(chatId, startText);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `Meme Bot — Help\n\nCommands:\n/start - Show welcome message and usage tips\n/meme - Fetch a random meme immediately\n/menu - Open helpful command keyboard\n/help - Show this message\n\nAutomatic triggers:\n- Send a message containing the words: meme, lol, funny, or joke (do NOT start the message with a leading '/').\n\nAuthor: naiih001\nTwitter: https://twitter.com/naiih001\nTelegram: https://t.me/naiih001\n\nIf you want a different behavior (e.g., more/less triggers), tell me and I can update it.`;
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
        ["/meme", "/localmeme"], // row 1
        ["/funny", "/joke"], // row 2
        ["/help"], // row 3
      ],
      resize_keyboard: true, // makes it smaller, nicer
      one_time_keyboard: true, // disappears after use
    },
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
  // Store chatId once
  const chatId = msg.chat.id;

  try {
    const { data: existing } = await supbase
      .from("users")
      .select("chat_id")
      .eq("chat_id", chatId)
      .single();

    if (!existing) {
      await supbase.from("users").insert([
        {
          chat_id: chatId,
          username: msg.from.username || null,
          first_name: msg.from.first_name || null,
          last_name: msg.from.last_name || null,
        },
      ]);
    }
    console.log(`Recorded new user: ${chatId}`);
  } catch (error) {
    console.error("Error handling message:", error);
  }

  const text = msg.text?.toLowerCase();

  if (!text) return;

  // Ignore bot commands (like "/meme") to avoid double-sending when
  // a command handler (bot.onText(/\/meme/)) already responds.
  if (
    msg.entities?.some((e) => e.type === "bot_command") ||
    text.startsWith("/")
  )
    return;

  if (
    text.includes("meme") ||
    text.includes("lol") ||
    text.includes("funny") ||
    text.includes("joke")
  ) {
    const memeUrl = await getMeme();
    if (memeUrl) bot.sendPhoto(chatId, memeUrl);
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.code, error.message);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
