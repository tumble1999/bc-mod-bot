const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const atob = require('atob-lite');
const discord = require('./discordBot');
const github = require('./github.js');
const session = require('express-session');
const request = require('request');

function decode(code) {
    return JSON.parse(atob(code));
}

var app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
}));


app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());
github.Middleware(app);

app.get('/approve/fail', (req, res) => {
    res.send("Submission Approvel Failed");
})

app.get('/auth/github', github.Authenticate())

app.get('/approve', async (req, res, next) => {
    if (req.user) {
        res.send('YAY');
    } else {
        req.session.returnTo = req.originalUrl
        res.redirect('/auth/github')
    }
});

app.get('/auth/github/callback', github.AuthCallback('/auth/github/fail'), (req, res) => {
    res.redirect(req.session.returnTo || '/approve/fail');
    delete req.session.returnTo;
})
app.get('/auth/github/fail', (req, res) => {
    res.send("GitHub Login Failed")
});

app.get('/avatar/:id/avatar.png', async (req, res) => {
    var img = await discord.getAvatar(req.params.id);
    ///TODO: Display Image
});

app.post('/submit', async (req, res) => {
    var id = req.body.id;
    var infoCode = req.body.info;

    var info = decode(infoCode);
    var tpcode;
    if (!info.code) {
        if (info.install) {
            var asynctpcode = async ()=>
            new Promise((resolve, reject) => {
                request(info.install, { json: true }, (err, res, body) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    resolve(body);
                });
            });
            tpcode = await asynctpcode();
            console.log(tpcode);
            
            
        } else {
            res.send("no tp data");
        }
    } else {
        tpcode = atob(info.code);
    }
    var tp = JSON.parse(tpcode);



    var tpsubmission = {
        name: tp.name,
        authorname: tp.author,
        authorid: id,
        description: tp.description,
        code: info.code,
        icon: info.icon,
        banner: info.banner,
        video: info.video
    }
    console.log(info);

    discord.SubmitTP(tpsubmission);

    res.send("It works");
});

app.get("/", (req, res) => {
    res.send(JSON.stringify(global.submissions), 0, 2);
});

module.exports = app;