const passport = require('passport');
const GitHubStrategy = require('passport-github2');
const Octokit = require('@octokit/rest');

passport.use(new GitHubStrategy({
    clientID: global.github.clientid,
    clientSecret: global.github.secret,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log("Setup Github OAuth");
    
    //User.findOrCreate({ githubId: profile.id }, function (err, user) {
      //return cb(err, user);
    //});
    var user = {
      client: Octokit({auth:accessToken})
    }

    return cb(null,user);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

function Middleware(app) {  
  app.use(passport.initialize());
  app.use(passport.session());
 
}

function Authenticate() {
    return passport.authenticate('github');
}
function AuthCallback(fail) {
    return passport.authenticate('github',{failureRedirect: fail});
}


module.exports = {Middleware,Authenticate,AuthCallback};