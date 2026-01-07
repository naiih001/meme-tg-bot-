# Telegram Meme Bot

This is a Telegram bot designed to deliver memes on demand and interact with users by recording their information in a Supabase database.

### Environment Variables

To run this project, you will need to add the following environment variables to a `.env` file in the root directory:

`TELEGRAM_BOT_TOKEN` = Your Telegram Bot API token
`SUPABASE_URL` = Your Supabase project URL
`SUPABASE_KEY` = Your Supabase project `anon` key

For more information on how to get these values, refer to the official documentation for [Telegram Bot API](https://core.telegram.org/bots/api) and [Supabase](https://supabase.com/docs).

### Features

- **Meme on Demand**: Use the `/meme` command to get a random meme.
- **Automatic Meme Delivery**: The bot sends a meme if your message contains "meme", "lol", "funny", or "joke".
- **Scheduled Meme Reminders**: Periodically reminds users to get new memes with varied messages.
- **User Management**: Integrates with Supabase to record user `chat_id` and `username`.
- **Help and Menu Commands**: `/start` for welcome message, `/help` for commands, and `/menu` for a quick command keyboard.

---

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run bot.js
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

### Author
- **naiih001**
  - Twitter: https://x.com/isaac_hayab
  - Telegram: https://t.me/naiih069
