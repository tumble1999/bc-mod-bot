const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

passport.use(new GitHubStrategy({
	clientID: global.github.clientid,
	clientSecret: global.discord.secret,
	callbackURL: "http://" + global.url + "/auth/discord/callback"
},
function(accessToken,refreshToken, profile, cb) {
	console.log("Setup Discord OAuth");
	
    var user = {
		token: accessToken
	  }
  
	  return cb(null, user);
	var user = 
}
));