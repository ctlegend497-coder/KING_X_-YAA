const { cmd } = require("../command");
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "jid",
    alias: ["myid", "userjid"],
    react: "🆔",
    desc: "Get user's JID or replied user's JID.",
    category: "main",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, sender }) => {
    try {
        // Reply karapu message ekak thiyanawanam eyage JID eka gannawa
        // Nathnam message eka ewapu kenage JID eka gannawa
        let targetJid = m.quoted ? m.quoted.sender : sender;

        let jidMsg = `╭━─━─━─━─━╮\n┃ 🆔 *USER JID INFO* ┃\n╰━─━─━─━─━╯\n\n`;
        jidMsg += `👤 *User:* @${targetJid.split('@')[0]}\n`;
        jidMsg += `🎫 *JID:* ${targetJid}\n\n`;

        if (isGroup) {
            jidMsg += `🏢 *Group JID:* ${from}\n\n`;
        }

        jidMsg += `> *© ZANTA-MD ID FINDER*`;

        // Mention ekak ekka message eka yawamu
        await zanta.sendMessage(from, { 
            text: jidMsg, 
            mentions: [targetJid] 
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ JID එක ලබා ගැනීමට නොහැකි විය.");
    }
});

cmd({
    pattern: "speed",
    alias: ["system", "ms"],
    react: "⚡",
    desc: "Check bot's response speed.",
    category: "main",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now(); // මැසේජ් එක ලැබුණු වෙලාව
        
        // මුලින්ම පුංචි මැසේජ් එකක් යවනවා
        const pinger = await zanta.sendMessage(from, { text: "🚀 *Checking Speed...*" }, { quoted: mek });
        
        const endTime = Date.now(); // රිප්ලයි එක යැවූ වෙලාව
        const ping = endTime - startTime; // කාලය අතර වෙනස

        const botName = global.CURRENT_BOT_SETTINGS?.botName || "ZANTA-MD";

        // රිප්ලයි එක Edit කරලා Speed එක පෙන්වනවා
        await zanta.sendMessage(from, { 
            text: `⚡ *${botName} SPEED REPORT*\n\n🚄 *Response Time:* ${ping}ms\n📡 *Status:* Online\n\n> *© ZANTA-MD*`, 
            edit: pinger.key 
        });

    } catch (err) {
        console.error(err);
        reply("❌ වේගය පරීක්ෂා කිරීමේදී දෝෂයක් විය.");
    }
});

cmd({
    pattern: "hiru",
    alias: ["news", "hirunews"],
    react: "📰",
    desc: "Get the latest news from Hiru News.",
    category: "search",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        const loading = await zanta.sendMessage(from, { text: "🗞️ *හිරු පුවත් ලබා ගනිමින් පවතී...*" }, { quoted: mek });

        // හිරු නිවුස් RSS feed එක හෝ සයිට් එකෙන් දත්ත ගනිමු
        const response = await axios.get('https://www.hirunews.lk/rss/sinhala.xml');
        const xmlData = response.data;

        // Cheerio පාවිච්චි කරලා XML එක parse කරමු
        const $ = cheerio.load(xmlData, { xmlMode: true });
        let newsList = [];

        // පුවත් 5ක් පමණක් තෝරා ගනිමු
        $('item').each((i, el) => {
            if (i < 5) {
                const title = $(el).find('title').text();
                const link = $(el).find('link').text();
                const desc = $(el).find('description').text().split('<')[0]; // HTML tags අයින් කරන්න
                const date = $(el).find('pubDate').text();

                newsList.push({ title, link, desc, date });
            }
        });

        if (newsList.length === 0) {
            return await zanta.sendMessage(from, { text: "☹️ *පුවත් කිසිවක් හමු නොවීය.*", edit: loading.key });
        }

        let newsReport = `╭━─━─━─━─━─━─━─━╮\n┃ 📰 *HIRU NEWS UPDATES* ┃\n╰━─━─━─━─━─━─━─━╯\n\n`;

        newsList.forEach((v, i) => {
            newsReport += `📍 *${i + 1}. ${v.title}*\n\n📝 ${v.desc}\n📅 ${v.date}\n🔗 ${v.link}\n\n`;
        });

        newsReport += `> *© ZANTA-MD NEWS BOT*`;

        // Loading මැසේජ් එක Edit කරලා News Report එක යවමු
        await zanta.sendMessage(from, { 
            text: newsReport, 
            edit: loading.key,
            contextInfo: {
                externalAdReply: {
                    title: "Hiru News - Latest",
                    body: "Breaking News from Sri Lanka",
                    thumbnailUrl: "https://www.hirunews.lk/images/logo.png",
                    sourceUrl: "https://www.hirunews.lk",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (err) {
        console.error(err);
        reply("❌ *හිරු පුවත් සේවාව සමඟ සම්බන්ධ විය නොහැක. Codespace එකේ axios install කර ඇත්දැයි බලන්න.*");
    }
});
