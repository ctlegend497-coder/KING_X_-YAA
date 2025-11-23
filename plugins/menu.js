const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    desc: "Displays all available commands",
    category: "main",
    filename: __filename,
  },
  async (
    zanta,
    mek,
    m,
    {
      from,
      reply
    }
  ) => {
    try {
      const categories = {};

      for (let cmdName in commands) {
        const cmdData = commands[cmdName];
        const cat = cmdData.category?.toLowerCase() || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({
          pattern: cmdData.pattern,
          desc: cmdData.desc || "No description"
        });
      }

      let menuText = "📋 *Available Commands:*\n";

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n📂 *${cat.toUpperCase()}*\n`;
        cmds.forEach(c => {
          menuText += `*◻ .${c.pattern} :* ${c.desc}\n`;
        });
      }

      await reply(menuText.trim());

      await zanta.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/ChatGPT%20Image%20Nov%2023,%202025,%2005_09_00%20AM.png?raw=true",
          },
          caption,
        },
        { quoted: mek }
      );
    } catch (err) {
      console.error(err);
      reply("❌ Error generating menu.");
    }
  }
);



