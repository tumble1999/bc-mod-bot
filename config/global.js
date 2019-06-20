console.log("Setting Global Vars...");
global = {
    discord: {
        serverID:"567030108003631104",
        token: require('./token.js').discord || process.env.DISCORD_TOKEN,
        submissionsChannelID: "588060601910034458"
    },
    github: {
        clientid: "f7ea22c76f3ab07934aa",
        secret: require('./token.js').github || process.env.GH_SECRET,
    },
    submissions: [],
    getSubmissions: function(authorid) {
        return this.global.submissions.filter(sub=>sub.authorid == authorid)
    }
}