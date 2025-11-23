const { cmd } = require("../command");

// Note: If zanta.downloadMediaMessage is not available, you might need to use the raw Baileys download logic.
// However, assuming ZANTA_MD exposes the core Baileys functionality via 'zanta'.

cmd(
    {
        pattern: "save",
        react: "✅", 
        desc: "Resend Status or One-Time View Media (Final FIX: Native Download)",
        category: "general",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            quoted,
            reply,
        }
    ) => {
        try {
            if (!quoted) {
                return reply("*කරුණාකර Status/Media Message එකකට reply කරන්න!* 🧐");
            }

            // 1. Media Object එක ලබා ගැනීම (Log එක අනුව quoted.quoted හෝ quoted.fakeObj)
            const mediaObject = quoted.quoted || quoted.fakeObj;
            let saveCaption = "*💾 Saved and Resent!*";
            
            if (!mediaObject) {
                return reply("*⚠️ Media Content එක හඳුනාගැනීමට අසමත් විය.*");
            }
            
            // 2. Media Type එක තීරණය කිරීම
            const messageType = Object.keys(mediaObject)[0];
            
            // 3. Media File Download (Native Baileys Method භාවිතයෙන්)
            reply("*Status Media File එක Download කරමින් (Decryption)...* ⏳");
            
            // Baileys media download සඳහා සම්පූර්ණ message key සහ content අවශ්‍ය වේ.
            // අපි 'm' object එකේ quoted part එකම download කිරීමට යවමු.
            
            // ⚠️ වැදගත්: downloadMediaMessage සඳහා, අපි Inner Media Object එක නොව,
            // සම්පූර්ණ Quoted Message Object එක යැවිය යුතුයි.
            const messageForDownload = m.message.extendedTextMessage.contextInfo.quotedMessage;
            
            if (!messageForDownload) {
                 return reply("*⚠️ Download කිරීමට අවශ්‍ය Message Context එක සොයාගත නොහැක.*");
            }
            
            // Baileys' native function භාවිතයෙන් Media Buffer එක ලබා ගැනීම
            const mediaBuffer = await zanta.downloadMediaMessage(
                { message: messageForDownload, key: quoted.key }, 
                'buffer'
            );
            
            // 4. Message Options සැකසීම (Buffer භාවිතයෙන්)
            let messageOptions = {};
            
            if (messageType === 'imageMessage') {
                messageOptions = { image: mediaBuffer, caption: saveCaption };
            } else if (messageType === 'videoMessage') {
                messageOptions = { video: mediaBuffer, caption: saveCaption };
            } else if (messageType === 'documentMessage') {
                // Document requires mime type and file name
                messageOptions = { 
                    document: mediaBuffer, 
                    fileName: mediaObject[messageType].fileName || 'saved_media', 
                    mimetype: mediaObject[messageType].mimetype, 
                    caption: saveCaption 
                };
            } else {
                 return reply("*⚠️ හඳුනාගත් Media Type එක යැවීමට සහය නොදක්වයි.*");
            }

            // 5. Message යැවීම
            await zanta.sendMessage(from, messageOptions, { quoted: mek });

            return reply("*වැඩේ හරි 🙃✅*");

        } catch (e) {
            console.error(e);
            reply(`*Error downloading or sending media:* ${e.message || e}`);
        }
    }
);
