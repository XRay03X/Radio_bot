const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const dotenv = require("dotenv").config();
const szivarvany = require("./szivarvany.json");
const radiok = require("./radiok.json");




require("./server.js");

const TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX;
const GOOGLE_API_KEY = process.env.YTAPI_KEY;

const bot = new Client({
    disableEveryone: true
});

const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on("ready", () => console.log(`${bot.user.tag} tökéletesen elindult!`));
bot.on("disconnect", () => console.log("Hiba indíts újra!"));
bot.on("reconnecting", () => console.log("Újracsatlakozok...."));
 let statusok = [
        //"Botot írta: István#7237",
        //"Ha nem tudsz valamilyen parancsot:#help",
        //`Szerverek ahol használják: ${bot.guilds.size}`
        "#help ł Hivatalos szerver:https://discord.gg/y7AqvMu" 
    ]

    setInterval(function(){
        let status = statusok[Math.floor(Math.random() * statusok.length)];
        bot.user.setActivity(status, {type: "PLAYING"})
    }, 3000) 

    
    
    

// youtube support
bot.on("message", async msg => { 
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;

    const args = msg.content.split(" ");
    const searchString = args.slice(1).join(" ");
    const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
    const serverQueue = queue.get(msg.guild.id);

    let command = msg.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "help" || command == "cmd") {
        const helpembed = new Discord.RichEmbed()
            .setColor("#7289DA")
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL)
            .setDescription(`
            __**Parancslista**__
            > \`virgin\` > **\`Vigrin Rádió\`**
            > \`radiozu\` > **\`RadioZU\`**
            > \`radio1\` > **\`Rádió1\`**
            > \`retro\` > **\`Retro Rádió\`**
            > \`petofi\` > **\`Petőfi Rádió\`**
            > \`city\` > **\`City Rádió\`**
            > \`mex\` > **\`Mex Rádió\`**
            > \`off\` > **\`Rádió kinyomása\`**`)
                        .setFooter("©️ 2021 István#5161");
        msg.channel.send(helpembed);
         /* ---Javítás alatt----
            > \`play\` > **\`play [szöveg/url]\`**
            > \`keres\` > **\`keres [szöveg]\`**
            > \`rainbow\` > **\`rainbow [@rangnév]\`**
            > \`rainbowstop\` > **\`rainbowstop (megállítja a diszkót)\`**
            \`hogy müködjön a diszkó igy állisd be\` > **\`https://imgur.com/a/gqbkRmk\`**
            > \`skip\`, \`stop\`,  \`pause\`, \`resume\`
            > \`nowplaying\`, \`queue\`, \`hang\`*/
    }
    });
    /*if (command === "play" || command === "p") {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send("Sajnálom be kell lépned egy szobába hogy használd a botot!");
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT")) {
            return msg.channel.send("Sajnálom szükségem van CSATLAKOZÁSI engedélyhez!");
        }
        if (!permissions.has("SPEAK")) {
            return msg.channel.send("Sajnálom szükségem van Beszéd engedélyhez!");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
            }
            return msg.channel.send(`<:thumbsup:591629527571234819>  **|**  Lejátszásilista: **\`${playlist.title}\`**Hozzáadva a listához!`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return msg.channel.send("Bocs nem értelmezem az ékezetes betűket!");
                } catch (err) {
                    console.error(err);
                    return msg.channel.send("Bocs nem értelmezem az ékezetes betűket!");
                }
            }
            return handleVideo(video, msg, voiceChannel);
        }
    }
    if (command === "keres" || command === "ker") {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send("Sajnálom be kell lépned egy szobába hogy használd a botot!");
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT")) {
            return msg.channel.send("Sajnálom szükségem van CSATLAKOZÁSI engedélyhez!");
        }
        if (!permissions.has("SPEAK")) {
            return msg.channel.send("Sajnálom szükségem van Beszéd engedélyhez!");
        }
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
            }
            return msg.channel.send(`<:yes:591629527571234819>  **|**  Lejátszási lista: **\`${playlist.title}\`** hozzáadva a listához!`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    msg.channel.send(`
__**Zene választás**__

${videos.map(video2 => `**\`${++index}\`  |**  ${video2.title}`).join("\n")}

Válaszd ki 1-10 ig melyik számot szeretnéd!
					`);
                    
                    try {
                        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                            maxMatches: 1,
                            time: 10000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send("Le járt az idő ha szeretnél választani újra írd be a parancsot");
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return msg.channel.send("Bocs nem értelmezem az ékezetes betűket!");
                }
            }
            return handleVideo(video, msg, voiceChannel);
        }

    } else if (command === "skip") {
        if (!msg.member.voiceChannel) return msg.channel.send("Sajnálom de nem vagy bent a szobába hogy kiskipelhesd a zenét....");
        if (!serverQueue) return msg.channel.send("Most nem játszok semmit **\`skip\`** neked.");
        serverQueue.connection.dispatcher.end("A zene skippelve lett!");
        msg.channel.send("⏭️  **|**  A zene skippelve lett!");
        return undefined;

    } else if (command === "stop") {
        if (!msg.member.voiceChannel) return msg.channel.send("Sajnálom de nem vagy bent a szobába hogy kinyomd a zenét...");
        if (!serverQueue) return msg.channel.send("Most nem játszok semmit **\`stop\`** neked.");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end("Kinyomtad a zenét!");
        msg.channel.send("⏹️  **|**  Kinyomtad a zenét!");
        return undefined;

    } else if (command === "hangero" || command === "hang") {
        if (!msg.member.voiceChannel) return msg.channel.send("Sajnálom de nem vagy bent a szobába hogy hangerőt állíts");
        if (!serverQueue) return msg.channel.send("Semmi nincs bent");
        if (!args[1]) return msg.channel.send(`Mostani hangerő: **\`${serverQueue.volume}%\`**`);
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
        return msg.channel.send(`Megváltoztattad a hangerőt: **\`${args[1]}%\`**`);

    } else if (command === "nowplaying" || command === "np") {
        if (!serverQueue) return msg.channel.send("Most nincs bent semmi.");
        return msg.channel.send(`🎶  **|**  Most játszom: **\`${serverQueue.songs[0].title}\`**`);

    } else if (command === "queue" || command === "q") {
        if (!serverQueue) return msg.channel.send("Nincs bent semmi");
        return msg.channel.send(`
__**Zene várólista**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}

**Most játszom: \`${serverQueue.songs[0].title}\`**
        `);

    } else if (command === "pause") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send("⏸  **|**  Megállítottad a zenét!");
        }
        return msg.channel.send("Nincs bent semmi.....");

    } else if (command === "resume") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send("▶  **|**  Folytatódik a zenéd!");
        }
        return msg.channel.send("Nincs semmi bent....");
    }
   
    if (command === 'ping') {
        msg.channel.send('Pong.');
    } else if (command === 'beep') {
        msg.channel.send('Boop.');
    } else if (command === 'server') {
        msg.channel.send(`Szerver neve: ${msg.guild.name}\nTagok: ${msg.guild.memberCount}`);
    } else if (command === 'user-info') {
        msg.channel.send(`Felhasználóneved: ${msg.author.username}\nAzonosítod: ${msg.author.id}`);
    } else if (command === 'szia') {
        if (!args.length) {
            return msg.channel.send(`Szopjá egyet, ${msg.author}!`);
        } else if (args[0] === 'foo') {
            return msg.channel.send('bar');
        }
    
        msg.channel.send(`First argument: ${args[0]}`);
    } else if (command === 'kick') {
        if (!msg.mentions.users.size) {
            return msg.reply('jelöld meg azt a faszt akit ki akarsz dobni!');
        }
    
        const taggedUser = msg.mentions.users.first();
    
        msg.channel.send(`Ki akarod baszni: ${taggedUser.username}`);
    } else if (command === 'avatar') {
        if (!msg.mentions.users.size) {
            return msg.channel.send(`Profilképed: ${msg.author.displayAvatarURL({ dynamic: true })}`);
        }
    
        const avatarList = msg.mentions.users.map(user => {
            return `${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`;
        });
    
        msg.channel.send(avatarList);
    } else if (command === 'prune') {
        const amount = parseInt(args[0]) + 1;
    
        if (isNaN(amount)) {
            return msg.reply('that doesn\'t seem to be a valid number.');
        } else if (amount <= 1 || amount > 100) {
            return msg.reply('you need to input a number between 1 and 99.');
        }
    
        msg.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('there was an error trying to prune messages in this channel!');
            return undefined;
        });
    }



async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(msg.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(msg.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`Nem tudok csatalkozni mert ez a bajom geci: ${error}`);
            queue.delete(msg.guild.id);
            return msg.channel.send(`Nem tudok csatalkozni mert ez a bajom geci: **\`${error}\`**`);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        if (playlist) return undefined;
        else return msg.channel.send(`<:thumbsup:591629527571234819>  **|** **\`${song.title}\`** Hozzáadva a zenelistához`);
    }
    return undefined;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on("end", reason => {
            if (reason === "Mivel nincs több zene kilépek") console.log("Song ended");
            else console.log(reason);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    serverQueue.textChannel.send(`🎶  **|**  Elkezdtem játszani **\`${song.title}\`**`);
}*/
//,,szivárvány" parancs
bot.on('message', message => {
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);
    if(command === PREFIX + szivarvany.rainbowcommand) {
        const rolez = message.mentions.roles.first() || message.guild.roles.find(r=> r.name === args [0])
        if(!rolez) return message.channel.send(botconfig.messageresponse.rolenotfound).catch(err=> message.channel.send("No response"))
        if(!message.guild.member(bot.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(szivarvany.messageresponse.missingperm).catch(err=> message.channel.send("no response"))
        var colors = szivarvany.rainbowrole
        var rolestart = setInterval(function() {
            var colorsz = colors[Math.floor(Math.random() * colors.length)];
            rolez.setColor(colorsz)
        }, szivarvany.rainbowdelay); 
            message.channel.send(szivarvany.messageresponse.success).catch(err=> message.channel.send("No response"))

    }
    if(command === PREFIX +szivarvany.rainbowstop) {
            setTimeout(function () {
           process.exit()
            }, 1000);
           
                       message.channel.send(szivarvany.messageresponse.rainbowstop).catch(err=> message.channel.send("No response"))
                    }
                });
//online rádió support

let SONG_INFO = {
    title: '',
    image: '',
    appleMusicUrl: ''
  }

  
  bot.on('message', async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(PREFIX)) return
  
    const voiceChannel = message.member.voiceChannel
  
    if (message.content == PREFIX + 'virgin') {
      if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
  
      const broadcast = message.client.createVoiceBroadcast()
  
      voiceChannel.join().then(connection => {
        message.channel.send(':thumbsup: A Vigrin rádió szól!')
  
        broadcast.playStream(radiok.vigrinradio)
        connection.playBroadcast(broadcast)
      })
    }
    if (message.content == PREFIX + 'radiozu') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
    
        const broadcast = message.client.createVoiceBroadcast()
    
        voiceChannel.join().then(connection => {
          message.channel.send(':thumbsup: A RadioZU rádió szól!')
    
          broadcast.playStream(radiok.radiozu)
          connection.playBroadcast(broadcast)
        })
    }
    if (message.content == PREFIX + 'radio1') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A Rádió1 rádió szól!')
        
            broadcast.playStream(radiok.radio1)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'retro') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A Retro rádió szól!')
        
            broadcast.playStream(radiok.retro)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'petofi') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A Petőfi rádió szól!')
        
            broadcast.playStream(radiok.petofi)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'city') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A City rádió szól!')
        
            broadcast.playStream(radiok.city)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'mex') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A Mex Mulatós rádió szól!')
        
            broadcast.playStream(radiok.mercy)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'teszt') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A teszt rádió szól!')
        
            broadcast.playStream(radiok.sajat)
            connection.playBroadcast(broadcast)
        })
      }
      if (message.content == PREFIX + 'techno') {
        if (!voiceChannel) return message.channel.send('Bent kell legyél hogy halljad a rádiót!')
        
        const broadcast = message.client.createVoiceBroadcast()
        
        voiceChannel.join().then(connection => {
            message.channel.send(':thumbsup: A TechnoBaseFM rádió szól!')
        
            broadcast.playStream(radiok.techno)
            connection.playBroadcast(broadcast)
        })
      }
  
    if (message.content == PREFIX + 'np') {
      message.channel.send(new RichEmbed()
        .setColor('#2B6DC2')
        .setURL(SONG_INFO.appleMusicUrl)
        .setImage(SONG_INFO.image)
        .setTitle(SONG_INFO.title))
    }
  
    if (message.content == PREFIX + 'off') {
      await voiceChannel.leave()
      message.channel.send(':no_entry: Sikeresen kinyomtad a rádíót!')
    }
    /*if (command === "help" || command == "cmd") {
        const helpembed = new Discord.RichEmbed()
            .setColor("#7289DA")
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL)
            .setDescription(`
            __**Parancslista**__
            > \`vigrin\` > **\`Vigrin Rádió\`**
            > \`radiozu\` > **\`RadioZU\`**
            > \`radio1\` > **\`Rádió1\`**
            > \`retro\` > **\`Retro Rádió\`**
            > \`petofi\` > **\`Petőfi Rádió\`**
            > \`city\` > **\`City Rádió\`**
            > \`mercy\` > **\`Mercy Rádió\`**
            > \`off\` > **\`Rádió kinyomása\`**
            > \`skip\`, \`stop\`,  \`pause\`, \`resume\`
            > \`nowplaying\`, \`queue\`, \`hang\``)
                        .setFooter("©️ 2020 István#6363");
        msg.channel.send(helpembed);
    }*/
    });
    const Welcome = require("discord-welcome");
 //szerver üdvözlő support
    Welcome(bot, {
        "318010120527282177": {
            privatemsg : "Gyere szopjá egyet komolyan mondom",
            publicmsg : "Üdvözöllek @MEMBER a Szatmárchaten jó szórakozást! Vigyázzon a román horrorkaravánokra :wink:",
            publicchannel : "csengersima-petea"
        },
        "747200314289029170": {
            privatemsg : "Üdvözöllek a teszt szerveren",
            publicmsg : "Üdvözöllek a teszt szerveren",
            publicchannel : "welcome"
        },
        "595582681568378930": {
            privatemsg : "Gyere szopjá egyet komolyan mondom",
            publicmsg : "Üdvözöllek @MEMBER a ZSONDÉR SZERÓN jó szórakozást!",
            publicchannel : "595582681568378932"
        }
    })
//alap szarok






        

//lyrics





bot.login(TOKEN);
//nemmegyvalamiért
