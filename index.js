require('./config/global.js');
const webserver = require('webserver');
const discord = require('./discordBot.js');
const app = require('./app.js');

var port = 3000||process.env.PORT;

webserver(app,port);
discord.start(global.discord.token)
