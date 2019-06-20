const Discord = require('discord.js');
var client = new Discord.Client();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.guilds.forEach(guildCheck);
client.on("guildCreate",guildCheck);

function start(token) {
    client.login(token);
}


function guildCheck(guild) {
    if(guild.id !== global.discord.serverID) guild.leave();
}

async function getGuild() {
    return new Promise((resolve,reject)=>{
        client.guilds.forEach(guild=>{
            if(guild.id === global.discord.serverID) {
                resolve(guild);
            }
        });
    })
}
async function getChannel(channelID) {
    var guild = await getGuild();
    return new Promise((resolve,reject)=>{
        guild.channels.forEach(channel=>{
            if(channel.id === channelID) {
                resolve(channel);
            }
        });
    })
}

async function getMember(memberID) {
    var guild = await getGuild();
    return new Promise((resolve,reject)=>{
        guild.members.forEach(member=>{
            if(member.id === memberID) {
                resolve(member);
            }
        });
    })
}



async function SubmitTP(tp) {
    var submissionsChannel = await getChannel(global.discord.submissionsChannelID)
    var author = await getMember(tp.authorid)
    var embeddata = {
        author:{
            name:`${tp.authorname} (submitted by ${author.displayName})`,
            icon_url: author.user.avatarURL,
            url: `https://boxcritters.github.io/authors?a=${tp.authorname}`
        },
        description:tp.description,
        footer: {
            text:"Box Critters Modding Community"
        },
        timestamp:new Date().toISOString(),
        title: tp.name,
    }
    if(tp.icon) {
        embeddata.thumbnail = {
            url:tp.icon
        }
    }
    if(tp.banner) {
        embeddata.image = {
            url:tp.banner
        }
    }    

    if(tp.installurl){
        embeddata.url = tp.installurl;
    }


    if(tp.video) {
        var videomsg = await submissionsChannel.send(tp.video);
    }
    var msg = await submissionsChannel.send({embed:embeddata});

    

    tp.approved = 0;                

    if(tp.code) {
        var codemsg = await submissionsChannel.send("```" + tp.code + "```");
    }

    msg.react('✅');
    msg.react('❎');

    var filterAccept = (reaction,user)=>reaction.emoji.name == '✅' && user.id != client.user.id;
    var collectAccept = msg.createReactionCollector(filterAccept,{maxEmojis:1});
    collectAccept.on('collect', r => {
        msg.delete();
        if(codemsg) {
            codemsg.delete();
        }
        if(videomsg) {
            videomsg.delete();
        }

        var url = "http://localhost:3000/approve/"
        url += btoa(JSON.stringify(tp));

        r.users.last().send(`Link to Approve the puplishing of **${tp.name}** by ${tp.authorname} (submitted by ${author}): ${url}`);
    });

    
    var filterDeny = (reaction,user)=>reaction.emoji.name == '❎' && user.id != client.user.id;
    var collectDeny = msg.createReactionCollector(filterDeny,{maxEmojis:1});
    collectDeny.on('collect', r => {
        msg.delete();
        if(codemsg) {
            codemsg.delete();
        }
        if(videomsg) {
            videomsg.delete();
        }
    });
    global.submissions.push(tp);
}



async function getAvatar(id) {
    return (await getMember(id)).user.avatarURL;
}

module.exports = {SubmitTP,start,getAvatar};