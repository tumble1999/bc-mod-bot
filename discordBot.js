const Discord = require('discord.js');
const btoa = require('btoa-lite');

var client = new Discord.Client();
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
client.guilds.cache.forEach(guildCheck);
client.on("guildCreate",guildCheck);

client.on("message",(m)=>{
	if(m.author.id==client.user.id) return;
	if(!m.mentions.has(client.user)&&m.channel.id!="693492173915815947") return;
	/*m.channel.send(m.author.toString() + m.content);
	m.channel.typing = true;
	bot.ask(m.content, function (err, response) {
		m.channel.send(m.author.toString() + " " + response);// Will likely be: "Living in a lonely world"
	});*/
})


function start(token) {
	client.login(token);
}


function guildCheck(guild) {
    if(guild.id !== global.discord.serverID) guild.leave();
}

function getGuild(guild) {
	return client.guilds.cache.get(guild||global.discord.serverID);
}
function getChannel(channelID,g) {
	var guild = g ||getGuild();
	return guild.channels.cache.get(channelID);
}

function getMember(memberID) {
	var guild = getGuild();
	return guild.members.cache.get(memberID);
}



async function SubmitTP(tp) {
    var submissionsChannel = getChannel(global.discord.submissionsChannelID)
    var author = getMember(tp.authorid)
    author.send("Your texture pack " + tp.name + ", has been submitted, a staff member will now review your submission.")
    var embeddata = {
        author:{
            name:`${tp.authorname} (submitted by ${author.displayName})`,
            icon_url: author.user.avatarURL(),
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

    if(tp.install){
        embeddata.url = tp.install;
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
	var filter = (test)=>(reaction,user)=>reaction.emoji.name == test && user.id != client.user.id;
	
    msg.createReactionCollector(filter('✅'),{maxEmojis:1})
    .on('collect', (r,u) => {
        msg.delete();
        if(codemsg) {
            codemsg.delete();
        }
        if(videomsg) {
            videomsg.delete();
        }

        var url = "http://" + global.url + "/approve/"
		url += btoa(JSON.stringify(tp));
        u.send(`Link to Approve the publishing of **${tp.name}** by ${tp.authorname} (submitted by ${author}): ${url}`);
	});
	
    msg.createReactionCollector(filter('❎'),{maxEmojis:1})
    .on('collect', (r,u) => {
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
    return getMember(id).user.avatarURL;
}

module.exports = {SubmitTP,start,getAvatar,getMember};