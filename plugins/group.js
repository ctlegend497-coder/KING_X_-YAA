const { cmd, commands } = require("../command");
const { getGroupAdmins } = require("../lib/functions"); // getGroupAdmins function එක functions.js එකෙන් ලබා ගනී

// --- 🛡️ Core Admin Check Helper Function (Silent Fix සමග) ---
const checkAdminStatus = async (zanta, from, reply, isGroup, m, requireUserAdmin = true) => {
    if (!isGroup) {
        reply("*This command can only be used in a Group!* 🙁");
        return false;
    }

    try {
        // 1. Group Metadata නැවත Fetch කරයි (මෙය නවතම තත්ත්වය සපයයි)
        let groupMeta = await zanta.groupMetadata(from);

        const botJid = zanta.user.id.includes(':') 
            ? zanta.user.id.split(':')[0] + '@whatsapp.net' 
            : zanta.user.id.replace("@s.whatsapp.net", "@whatsapp.net");

        const senderJid = m.sender.replace("@s.whatsapp.net", "@whatsapp.net");

        // 2. Admin ලැයිස්තුව සොයා ගනී
        const admins = getGroupAdmins(groupMeta.participants).map(j => j.replace("@s.whatsapp.net", "@whatsapp.net"));

        const isBotAdminNew = admins.includes(botJid);
        const isUserAdminNew = admins.includes(senderJid);

        if (!isBotAdminNew) {
            // ❌ Bot Admin නැතිනම්, Silent ලෙස නවත්වයි (ඔබගේ ඉල්ලීම පරිදි)
            return false; 
        }

        // 3. User Admin අවශ්‍ය නම් පරීක්ෂා කරයි
        if (requireUserAdmin && !isUserAdminNew) {
            reply("*You must be an Admin to use this command!* 👮‍♂️❌");
            return false;
        }

        return true; // සියල්ල සාර්ථකයි
        
    } catch (e) {
        console.error("Error fetching Group Metadata for Admin check:", e);
        reply("*Error:* Failed to check admin status. Please ensure I am an admin and try again. 😔");
        return false;
    }
};

const getTargetJid = (mentionedJid, quoted) => {
    let targetJid = null;
    if (mentionedJid && mentionedJid.length > 0) {
        targetJid = mentionedJid[0];
    } else if (quoted) {
        targetJid = quoted.sender;
    }
    return targetJid;
};

// --- KICK COMMAND ---
cmd(
  {
    pattern: "kick",
    alias: ["remove"],
    react: "👋",
    desc: "Kicks a mentioned/replied user from the group.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, mentionedJid, quoted }) => {
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJidRaw = getTargetJid(mentionedJid, quoted);
      if (!targetJidRaw) {
        return reply("*Please mention or reply to the user you want to kick.* 🧑‍💻");
      }

      // FIXED: Must use @s.whatsapp.net for update actions
      const targetJid = targetJidRaw.replace("@whatsapp.net", "@s.whatsapp.net");

      const ownerNumber = ['94743404814' , '0743404814'];
      if (ownerNumber.includes(targetJidRaw.split('@')[0])) {
          return reply("*I cannot kick my owner!* 👑");
      }
      
      reply("*Kicking user... 👋*");

      const response = await zanta.groupParticipantsUpdate(from, [targetJid], "remove");
      
      if (response && response[0] && response[0].status === '403') {
          return reply("*Failed to kick. The target is likely an owner or a higher-level admin.* 😔");
      }
      
      return reply(`*User successfully kicked! 🫡✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the kick operation. ${e.message || e}`);
    }
  }
);

// --- PROMOTE COMMAND ---
cmd(
  {
    pattern: "promote",
    react: "👑",
    desc: "Promotes a mentioned/replied user to Group Admin.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, mentionedJid, quoted }) => {
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJidRaw = getTargetJid(mentionedJid, quoted);
      if (!targetJidRaw) {
        return reply("*Please mention or reply to the user you want to promote.* 👑");
      }

      const targetJid = targetJidRaw.replace("@whatsapp.net", "@s.whatsapp.net");

      reply("*Promoting user... ⬆️*");

      await zanta.groupParticipantsUpdate(from, [targetJid], "promote");
      
      return reply(`*User successfully promoted to Admin! 👑✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the promote operation. ${e.message || e}`);
    }
  }
);

// --- DEMOTE COMMAND ---
cmd(
  {
    pattern: "demote",
    react: "🔻",
    desc: "Demotes a mentioned/replied Group Admin to a regular member.",
    category: "group",
    filename: __filename,
  },
  async (zanta, mek, m, { from, reply, isGroup, mentionedJid, quoted }) => {
    if (!await checkAdminStatus(zanta, from, reply, isGroup, m)) return;

    try {
      const targetJidRaw = getTargetJid(mentionedJid, quoted);
      if (!targetJidRaw) {
        return reply("*Please mention or reply to the Admin you want to demote.* 🔻");
      }

      const targetJid = targetJidRaw.replace("@whatsapp.net", "@s.whatsapp.net");

      reply("*Demoting user... ⬇️*");

      await zanta.groupParticipantsUpdate(from, [targetJid], "demote");
      
      return reply(`*Admin successfully demoted! 🧑‍💻✅*`);
      
    } catch (e) {
      console.error(e);
      reply(`*Error:* Failed to perform the demote operation. ${e.message || e}`);
    }
  }
);
