const TelegramBot = require('node-telegram-bot-api');
const token = '7726832571:AAG67RDTuzqPx7w_U8e_WLSKVVLUvMBYbTM';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/invite/, (msg) => {
    const chatId = msg.chat.id;
    const link = 'http://localhost:3000';
    bot.sendMessage(chatId, `Приглашение в игру: ${link}`);
});
