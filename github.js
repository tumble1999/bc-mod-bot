const passport = require('passport');
const GitHubStrategy = require('passport-github2');
const Octokit = require('@octokit/rest').plugin(require('@octokit/plugin-retry'));
const slugify = require('slugify');
const discordBot = require('./discordBot.js');

passport.use(new GitHubStrategy({
  clientID: global.github.clientid,
  clientSecret: global.github.secret,
  callbackURL: "http://" + global.url + "/auth/github/callback"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log("Setup Github OAuth");

    //User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //return cb(err, user);
    //});
    var user = {
      token: accessToken
    }

    return cb(null, user);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

function Middleware(app) {
  app.use(passport.initialize());
  app.use(passport.session());

}

function Authenticate() {
  return passport.authenticate('github', { scope: ['public_repo'] });
}
function AuthCallback(fail) {
  return passport.authenticate('github', { failureRedirect: fail });
}

/*
{ name: 'One Click Test',
  authorname: 'TumbleGamer',
  authorid: '336869008148135948',
  description: '',
  approved: 0 }
*/
async function publishTP(token, tp) {
  var octokit = Octokit({
    auth() {
      return 'token ' + token;
    }
  });
  octokit.request('/').catch(error => {
    if (error.request.request.retryCount) {
      console.log(`request failed after ${error.request.request.retryCount} retries`)
    }

    console.error(error)
  })
  var owner = "boxcritters";
  var repo = "boxcritters.github.io";
  var slug = slugify(tp.name);
  var path = "_texturepacks/" + slug + ".md";
  var message = "Published Texture Pack " + tp.name + " by " + tp.authorname;
  var submitter = await discordBot.getMember(tp.authorid);
  var author = {
    name: tp.authorname,
    email: "tumblegamer+boxcritters@gmail.com"
  };
  var contentraw = `---
title: ${tp.name || ''}
author:
- ${tp.authorname || ''}
description: ${tp.description || ''}
logo: ${tp.logo || ''}
image: ${tp.image || ''}`;

  if (tp.code) {
    contentraw += `
code: >-
${tp.code}`;
  }
  if (tp.install) {
    contentraw += `
install: ${tp.install}`;
  }

  contentraw += `
featured: false
---`;
  var content = Buffer.from(contentraw).toString('base64');
  console.log("Creating file " + owner + "/" + repo + "/" + path);
  try {
    var fileInfo = await octokit.repos.createOrUpdateFile({
      owner,
      repo,
      path,
      message,
      content,
      author
    });
    console.log("DONE???");

    console.log(fileInfo);
    var baseurl = "http://boxcritters.github.io/texturepacks/"
    submitter.send("Your texture pack has been submitted:" + baseurl + slug);
    return fileInfo.html_url;
  } catch (err) {
    console.log("Error: " + err);
    if (response.status == 422) {
      await submitter.send("We could not submit your texture pack as one exists with the same name.");
      throw new Error("Texture pack already exists. The submiter has been notified");
    }
    throw new Error(response);
  }
}


module.exports = { Middleware, Authenticate, AuthCallback, publishTP };