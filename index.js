require('./config/global.js');
global.Promise = Promise;
const webserver = require('webserver');
const discord = require('./discordBot.js');
const app = require('./app.js');

var port = 8080||process.env.PORT;

//webserver(app,port);
discord.start(global.discord.token)
