              console.log("BOT FILE STARTED");

              const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ModalBuilder,
                    TextInputBuilder,
                    TextInputStyle,
                    StringSelectMenuBuilder } = require("discord.js");
              const transcripts = require("discord-html-transcripts");
              const fs = require("fs");
const DATA_FILE = process.env.DATA_FILE || "./data.json";
              const strikes = new Map();
              const staffPoints = new Map();
  const staffRatings = new Map();
  const giveawayBlacklist = new Map();

              // Prevent duplicate instance
              if (global.__bot_started) {
                console.log("Duplicate instance blocked");
                process.exit(0);
              }
              global.__bot_started = true;

              const client = new Client({
                intents: [
                  GatewayIntentBits.Guilds,
                  GatewayIntentBits.GuildMessages,
                  GatewayIntentBits.MessageContent,
                  GatewayIntentBits.GuildMembers,
                  GatewayIntentBits.GuildMessageReactions // ⭐ REQUIRED
                ],
                partials: ["MESSAGE", "CHANNEL", "REACTION"] // ⭐ REQUIRED
              });

              const PREFIX = ".";
              const TOKEN = process.env.DISCORD_TOKEN;

              // ROLES
              const ROLES = {
                ultimate: "1380078875626700851",
                owner: "1366645098359685183",
                admin: "1366645112234315818",
                whitelist: "1424453163464786011",
                headmod: "1495763550650630255",
                mod: "1366645101685903391",
                trial: "1379001032197279795",
                cooldown: "1476454062605209693",
                gwyBanned: "1390675664159506523",
                eventBan: "1395348953603768391",
                brookArmy: "1406646672829841608",
                valorant: "1411728410723750050",
                dashRole: "1405606969959518270",
                dotRole: "1399675259061276702",
                muted: "1413142263298658355",
                booster: "1384106733374410843",
                motm: "1363682773038010468",
              };

              // CHANNELS
              const CHANNELS = {
                adminLogs: "1381173430472282163",
                botLogs: "1386717650511466618",
                giveawayLogs: "1318164139788468227",
                ticketCategory: "1323670067782619208",
                ticketPanel: "1397264703373443233",
                strikeLogs: "1381173430472282163",
                modLogs: "1506172574189617202",
                motmAnnouncements: "1422082737241587752",
                weeklyReports: "1393821587559420004",
              };

            const TRUSTED_BOTS = [
              "235148962103951360", // Carl-bot
              "557628352828014614", // Ticket Tool
              "155149108183695360", // Dyno
              "530082442967646230", // Giveaway Boat
              "282859044593598464", // ProBot
              "437808476106784770", // Arcane
              "426537812993638400", // Bloxlink
              "456633518882160642", // YouTube
              "282286160494067712",  // Pingcord
              "472911936951156740", // Voice Master
              "458276816071950337", // ServerStats
            ];

            function isTrustedBot(member) {
              return member?.user?.bot && TRUSTED_BOTS.includes(member.id);
            }

            const PROTECTED_PING_USERS = [
              "1022929219690434560", // Takila
              "1288801215282413644", // Hiro
              "1057967090906173490", // Aniket
              "1317889415774994444"  // Brook
            ];

  function canPingProtected(member) {
    if (!member) return false;

    return (
      member.roles.cache.has(ROLES.owner) ||
      member.roles.cache.has(ROLES.admin) ||
      member.roles.cache.has(ROLES.ultimate) ||
      member.roles.cache.has(ROLES.headmod) ||
      member.roles.cache.has(ROLES.mod) ||
      member.roles.cache.has(ROLES.trial) ||
      member.roles.cache.has("1318177382921928805") || // Youtuber
      member.roles.cache.has("1336072860879556639") || // Friends
      member.roles.cache.has("1464333464361767103")    // YouTube Member
    );
  }

              // STORAGE
              const giveaways = new Map();
              const fixedWinners = new Map();
              const activeCommands = new Set();
              const punishmentLogs = new Map();
              const banTracker = new Map();
              const giveawayDrafts = new Map();
              const messageStats = new Map();

              let caseCounter = 1000;
let lastWeeklyReportKey = null;


              // 💾 SAVE DATA
              function saveData() {

                const data = {
                  strikes: Object.fromEntries(strikes),
                  punishmentLogs: Object.fromEntries(punishmentLogs),
                  staffPoints: Object.fromEntries(staffPoints),
                  staffRatings: Object.fromEntries(staffRatings),
                  giveawayBlacklist:
                  Object.fromEntries(giveawayBlacklist),
                  giveaways: Object.fromEntries(giveaways),
                  fixedWinners: Object.fromEntries(fixedWinners),
                  messageStats: Object.fromEntries(messageStats),
                  caseCounter,
                  lastWeeklyReportKey
                };

                fs.writeFileSync(
                  DATA_FILE,
                  JSON.stringify(data, null, 2)
                );
              }


              // 📂 LOAD DATA
              function loadData() {

                if (!fs.existsSync(DATA_FILE)) return;

                const raw = fs.readFileSync(DATA_FILE);

                const data = JSON.parse(raw);

                // strikes
                if (data.strikes) {

                  strikes.clear();

                  for (const key in data.strikes) {
                    strikes.set(key, data.strikes[key]);
                  }
                }

                // punishment logs
                if (data.punishmentLogs) {

                  punishmentLogs.clear();

                  for (const key in data.punishmentLogs) {
                    punishmentLogs.set(key, data.punishmentLogs[key]);
                  }
                }

                // staff points
                if (data.staffPoints) {

                  staffPoints.clear();

                  for (const key in data.staffPoints) {
                    staffPoints.set(key, data.staffPoints[key]);
                  }
                }

                if (data.staffRatings) {
                  staffRatings.clear();

                  for (const key in data.staffRatings) {
                    staffRatings.set(key, data.staffRatings[key]);
                  }
                }

                // giveaway blacklist
                if (data.giveawayBlacklist) {

                  giveawayBlacklist.clear();

                  for (const key in data.giveawayBlacklist) {

                    giveawayBlacklist.set(
                      key,
                      data.giveawayBlacklist[key]
                    );
                  }
                }

                // giveaways
                if (data.giveaways) {

                  giveaways.clear();

                  for (const key in data.giveaways) {
                    giveaways.set(key, data.giveaways[key]);
                  }
                }

                // fixed winners
                if (data.fixedWinners) {

                  fixedWinners.clear();

                  for (const key in data.fixedWinners) {
                    fixedWinners.set(key, data.fixedWinners[key]);
                  }
                }

// message stats
if (data.messageStats) {
  messageStats.clear();

  for (const key in data.messageStats) {
    messageStats.set(
      key,
      data.messageStats[key]
    );
  }
}

if (data.lastWeeklyReportKey) {
  lastWeeklyReportKey = data.lastWeeklyReportKey;
}
}

                loadData();
    function expireOldStrikes() {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      let changed = false;

      for (const [userId, userStrikes] of strikes.entries()) {
        const active = userStrikes.filter(s => Date.now() - s.time < thirtyDays);

        if (active.length !== userStrikes.length) {
          strikes.set(userId, active);
          changed = true;
        }
      }

      if (changed) saveData();
    }

    async function alertFiveStrikes(guild, userId, currentStrikes, reason, givenBy) {
      if (!guild || !currentStrikes || currentStrikes.length !== 5) return;

      const alertChannel =
        guild.channels.cache.get(CHANNELS.adminLogs) ||
        guild.channels.cache.get(CHANNELS.strikeLogs) ||
        guild.channels.cache.get(CHANNELS.botLogs);

      if (!alertChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("⚠️ Staff Reached 5 Strikes")
        .setColor(0xff3b3b)
        .setDescription(
          `<@${userId}> has reached **5 active strikes**.\n\n` +
          `Admin review is now required.`
        )
        .addFields(
          {
            name: "Staff Member",
            value: `<@${userId}>`,
            inline: true
          },
          {
            name: "Total Active Strikes",
            value: `${currentStrikes.length}`,
            inline: true
          },
          {
            name: "Latest Reason",
            value: reason || "No reason provided",
            inline: false
          },
          {
            name: "Latest Strike Given By",
            value: givenBy ? `<@${givenBy}>` : "Unknown",
            inline: true
          }
        )
        .setFooter({
          text: "Lunar Strike Alert • Admin action required"
        })
        .setTimestamp();

      await alertChannel.send({
        content: `<@&${ROLES.admin}>`,
        embeds: [embed],
        allowedMentions: {
          roles: [ROLES.admin]
        }
      }).catch(() => null);
    }

              function getTodayKey() {
                return new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit"
                }).format(new Date());
              }

              function isStaffMember(member) {
                if (!member) return false;

                return (
                  member.roles.cache.has(ROLES.trial) ||
                  member.roles.cache.has(ROLES.mod) ||
                  member.roles.cache.has(ROLES.headmod) ||
                  member.roles.cache.has(ROLES.admin) ||
                  member.roles.cache.has(ROLES.owner) ||
                  member.roles.cache.has(ROLES.ultimate)
                );
              }

  // LEVEL SYSTEM
  function getUserLevel(member) {
    if (!member) return 0;

    if (
      member.roles.cache.has(ROLES.ultimate) ||
      member.roles.cache.has(ROLES.owner) ||
      member.roles.cache.has(ROLES.admin)
    ) return 4;

    if (member.roles.cache.has(ROLES.whitelist)) return 3;
    if (member.roles.cache.has(ROLES.mod) || member.roles.cache.has(ROLES.headmod)) return 2;
    if (member.roles.cache.has(ROLES.trial)) return 1;

    return 0;
  }
function buildHelpEmbed(level) {
  const commandCount = level >= 4 ? "80+" : level >= 2 ? "45+" : "18+";

  return new EmbedBuilder()
    .setTitle("Lunar")
    .setColor(0x2b2d31)
    .setDescription(
      "**Help menu**\n\n" +
      "• Prefix for this server is `.`\n" +
      `• Available commands: **${commandCount}**\n` +
      `• Your access level: **${level}**\n\n` +
      "━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "__Main__",
        value:
          "🛡️ : **Security**\n" +
          "⚒️ : **Automod**\n" +
          "🚫 : **Moderation**\n" +
          "🎫 : **Tickets**\n" +
          "📊 : **Staff System**",
        inline: false
      },
      {
        name: "__Extra__",
        value:
          "🎉 : **Giveaways**\n" +
          "⚙️ : **Utility**\n" +
          "📚 : **Cases**\n" +
          "👤 : **Profiles**\n" +
          "🔒 : **Hidden**",
        inline: false
      },
      {
        name: "Select a category to view",
        value: "Use the dropdown below to open a command category.",
        inline: false
      }
    )
    .setFooter({
      text: `Lunar Help • Access Level ${level}`
    })
    .setTimestamp();
}
  function buildHelpCategoryEmbed(category, level) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTimestamp();

    if (category === "giveaways") {
      embed
        .setTitle("🎉 Giveaway Commands")
        .setDescription(
          "`/giveaway create` - Create premium giveaway\n" +
          "`/giveaway edit` - Edit ongoing giveaway\n" +
          "`/giveaway removeuser` - Remove user from giveaway\n" +
          "`.gstart` - Start quick giveaway\n" +
          "`.greroll` - Reroll winner\n" +
          "`.gend` - End giveaway\n" +
          "`.gpause` - Pause giveaway\n" +
          "`.gresume` - Resume giveaway\n" +
          "`.gblacklist` - Giveaway blacklist\n" +
          "`.gunblacklist` - Remove giveaway blacklist\n" +
          "`.gblacklists` - View giveaway blacklist"
        );
    }

    if (category === "staff") {
      embed
        .setTitle("👑 Staff Commands")
        .setDescription(
          "`/staff profile` - View staff profile\n" +
          "`/staff rate` - Give +1 daily rating to a staff member\n" +
          "`/staff weeklyreport` - Weekly activity report\n" +
          "`/staff resetmonth` - Reset monthly points\n" +
          "`.staffstats` - Staff stats\n" +
          "`.stafflb` - Staff leaderboard\n" +
          "`.motm` - Moderator of the month"
        );
    }

    if (category === "moderation") {
      embed
        .setTitle("🛡️ Moderation Commands")
        .setDescription(
          "`/strike` - Strike staff member\n" +
          "`/modlog` - Submit modlog\n" +
          "`.strike` - Strike staff\n" +
          "`.removestrike` - Remove strike\n" +
          "`.strikes` - View strikes\n" +
          "`.clearstrikes` - Clear strikes\n" +
          "`.modlogs` - View mod cases\n" +
          "`.case` - View case\n" +
          "`.close` - Close ticket"
        );
    }

    if (category === "security") {
      embed
        .setTitle("🚨 Security Systems")
        .setDescription(
          "Anti Bot Add\n" +
          "Anti Channel Delete\n" +
          "Anti Role Delete\n" +
          "Anti Mass Ban\n" +
          "Anti Everyone Ping\n" +
          "Role Guard\n" +
          "Giveaway Cooldown/Ban Guard"
        );
    }

    if (category === "tickets") {
      embed
        .setTitle("🎫 Tickets & Claims")
        .setDescription(
          "Claim Prize button\n" +
          "Claim ticket creation\n" +
          "Paid / Rejected / Need Proof buttons\n" +
          "Claim transcript logs\n" +
          "Auto-close after paid"
        );
    }

    if (category === "utility") {
      embed
        .setTitle("⚙️ Utility Commands")
        .setDescription(
          "`/help` - Open help menu\n" +
          "`/health` - Bot health check\n" +
          "`.help` - Prefix help\n" +
          "`.test` - Test bot\n" +
          "`.messages` - Message stats\n" +
          "`.messagelb` - Message leaderboard"
        );
    }

    if (category === "hidden") {
      if (level < 4) {
        embed
          .setTitle("🔒 Hidden Commands")
          .setDescription("You do not have access to hidden level 4 commands.");
      } else {
        embed
          .setTitle("🔒 Hidden Level 4 Commands")
          .setDescription(
            "`.gfix @user messageId` - Fix giveaway winner\n" +
            "`.greq messageId daily/weekly/monthly amount` - Set requirements\n" +
            "`.addpoints @user amount reason` - Add staff points\n" +
            "`.addmessages @user type amount` - Add messages\n" +
            "`.removemessages @user type amount` - Remove messages\n" +
            "`.setmessages @user type amount` - Set messages\n" +
            "`.resetdaily @user` - Reset daily messages\n" +
            "`.resetweekly @user` - Reset weekly messages\n" +
            "`.resetmonthly @user` - Reset monthly messages\n" +
            "`.clearstrikes @user` - Clear strikes\n" +
            "`.motm` - Force MOTM"
          );
      }
    }

    return embed.setFooter({
      text: `Lunar Help • Access Level ${level}`
    });
  }

  function buildHelpMenu(level) {
    const options = [
      {
        label: "Giveaways",
        value: "giveaways",
        description: "Giveaway commands and tools",
        emoji: "🎉"
      },
      {
        label: "Staff",
        value: "staff",
        description: "Staff points and reports",
        emoji: "👑"
      },
      {
        label: "Moderation",
        value: "moderation",
        description: "Strikes, modlogs, cases",
        emoji: "🛡️"
      },
      {
        label: "Security",
        value: "security",
        description: "Guard and anti-abuse systems",
        emoji: "🚨"
      },
      {
        label: "Tickets & Claims",
        value: "tickets",
        description: "Claim ticket systems",
        emoji: "🎫"
      },
      {
        label: "Utility",
        value: "utility",
        description: "Helpful bot commands",
        emoji: "⚙️"
      }
    ];

    if (level >= 4) {
      options.push({
        label: "Hidden Level 4",
        value: "hidden",
        description: "Admin-only hidden commands",
        emoji: "🔒"
      });
    }

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help_category")
        .setPlaceholder("Choose a help category")
        .addOptions(options)
    );
  }
function buildHelpActionRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_all")
      .setLabel("All Commands")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("help_report")
      .setLabel("Report")
      .setEmoji("🚨")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setLabel("Support")
      .setEmoji("🛟")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com/users/1288801215282413644")
  );
}
              function isBypass(member) {
                if (!member) return false;

                return (
                  member.roles.cache.has(ROLES.ultimate) ||
                  member.roles.cache.has(ROLES.owner) ||
                  member.roles.cache.has(ROLES.admin)
                );
              }
  function getCases(filterUserId = null) {
    return [...punishmentLogs.values()]
      .filter(log => !filterUserId || log.target === filterUserId)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  function getCaseStatusText(log) {
    if (log.status === "Approved") {
      return `✅ Approved${log.reviewedBy ? ` by <@${log.reviewedBy}>` : ""}`;
    }

    if (log.status === "Rejected") {
      return `❌ Rejected${log.reviewedBy ? ` by <@${log.reviewedBy}>` : ""}`;
    }

    return "⏳ Pending Review";
  }

  function buildCasesEmbed(cases, page, filterUserId = null) {
    const perPage = 3;
    const totalPages = Math.max(1, Math.ceil(cases.length / perPage));
    const start = page * perPage;
    const visibleCases = cases.slice(start, start + perPage);

    const embed = new EmbedBuilder()
      .setTitle("📚 Case Records")
      .setColor(0x5865f2)
      .setDescription(
        filterUserId
          ? `Showing cases for <@${filterUserId}>`
          : "Showing all moderation cases"
      )
      .setFooter({
        text: `Page ${page + 1}/${totalPages} • ${cases.length} total cases`
      })
      .setTimestamp();

    if (!visibleCases.length) {
      embed.addFields({
        name: "No cases found",
        value: "No moderation cases match this view.",
        inline: false
      });

      return embed;
    }

    for (const log of visibleCases) {
      const caseTime = log.timestamp
        ? `<t:${Math.floor(log.timestamp / 1000)}:R>`
        : "Unknown";

      const caseId = log.caseId || log.id || "Unknown";
      const status = getCaseStatusText(log);

      embed.addFields(
        {
          name: `#${caseId} • ${log.type || "Unknown"}`,
          value:
            `**Status:** ${status}\n` +
            `**Target:** <@${log.target}>\n` +
            `**Moderator:** <@${log.moderator}>`,
          inline: false
        },
        {
          name: "Reason",
          value: log.reason || "No reason provided",
          inline: true
        },
        {
          name: "Proof",
          value: log.proof ? `[Open](${log.proof})` : "None",
          inline: true
        },
        {
          name: "Created",
          value: caseTime,
          inline: true
        }
      );

      if (log.rejectReason) {
        embed.addFields({
          name: "Reject Reason",
          value: log.rejectReason,
          inline: false
        });
      }
    }

    return embed;
  }

  function buildCasesButtons(page, totalCases, viewerId, filterUserId = "all") {
    const perPage = 3;
    const totalPages = Math.max(1, Math.ceil(totalCases / perPage));

    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`cases_prev_${page}_${viewerId}_${filterUserId}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),

      new ButtonBuilder()
        .setCustomId(`cases_next_${page}_${viewerId}_${filterUserId}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= totalPages - 1)
    );
  }
  async function sendGiveawayAuditLog(guild, action, giveawayId, g, actor, details = {}) {
    if (!guild) return;

    const logChannel =
      guild.channels.cache.get(CHANNELS.giveawayLogs) ||
      guild.channels.cache.get(CHANNELS.botLogs);

    if (!logChannel) return;

    const colors = {
      created: 0x57f287,
      edited: 0xffcc00,
      ended: 0xff4d6d,
      rerolled: 0xff9800,
      removed: 0xff3b3b
    };

    const titles = {
      created: "Giveaway Created",
      edited: "Giveaway Edited",
      ended: "Giveaway Ended",
      rerolled: "Giveaway Rerolled",
      removed: "Giveaway User Removed"
    };

    const embed = new EmbedBuilder()
      .setTitle(titles[action] || "Giveaway Audit")
      .setColor(colors[action] || 0x5865f2)
      .addFields(
        {
          name: "Giveaway ID",
          value: `\`${giveawayId}\``,
          inline: true
        },
        {
          name: "Prize",
          value: g?.prize || "Prize",
          inline: true
        },
        {
          name: "Actor",
          value: actor ? `<@${actor.id}>` : "System",
          inline: true
        },
        {
          name: "Host",
          value: g?.host ? `<@${g.host}>` : "Unknown",
          inline: true
        },
        {
          name: "Channel",
          value: g?.channelId ? `<#${g.channelId}>` : "Unknown",
          inline: true
        },
        {
          name: "Entries",
          value: `${g?.users?.length || 0}`,
          inline: true
        }
      )
      .setTimestamp();

    if (details.summary) {
      embed.addFields({
        name: "Details",
        value: details.summary,
        inline: false
      });
    }

    if (g?.messageUrl) {
      embed.addFields({
        name: "Message",
        value: `[Jump to giveaway](${g.messageUrl})`,
        inline: false
      });
    }

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  }

              // STAFF POINTS
              function addPoints(userId, type) {

                const data = staffPoints.get(userId) || {
                  total: 0,
                  monthly: 0,
                  modlogs: 0,
                  tickets: 0,
                  giveaways: 0,
                  strikes: 0
                };

                if (type === "modlog") {
                  data.modlogs++;
                  data.total += 5;
                  data.monthly += 5;
                }

                if (type === "ticket") {
                  data.tickets++;
                  data.total += 3;
                  data.monthly += 3;
                }

                if (type === "giveaway") {
                  data.giveaways++;
                  data.total += 2;
                  data.monthly += 2;
                }

                if (type === "strike") {
                  data.strikes++;
                  data.total += 1;
                  data.monthly += 1;
                }

                staffPoints.set(userId, data);

                saveData();
              }

              // TIME PARSER
  function parseTime(str) {
    const num = parseInt(str);

    if (str.endsWith("s")) return num * 1000;
    if (str.endsWith("m")) return num * 60000;
    if (str.endsWith("h")) return num * 3600000;

    return num;
  }

      function formatGiveawayTime(endAt) {
        const unix = Math.floor(endAt / 1000);

        return `<t:${unix}:R>\nEnds: <t:${unix}:F>`;
      }
  function formatDuration(ms) {
    const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

      function buildGiveawayEmbed(g) {
        let requirementText = "";

        if (Number(g.requiredDaily) > 0) {
          requirementText += `🌅 Daily: ${g.requiredDaily}\n`;
        }

        if (Number(g.requiredWeekly) > 0) {
          requirementText += `📅 Weekly: ${g.requiredWeekly}\n`;
        }

        if (Number(g.requiredMonthly) > 0) {
          requirementText += `🗓️ Monthly: ${g.requiredMonthly}\n`;
        }

        if (g.requiredRole && g.requiredRole !== "none") {
          requirementText += `🎭 Role: <@&${g.requiredRole}>`;
        }

        const fields = [
          {
            name: "👑 Winners",
            value: `${g.winnerCount || 1}`,
            inline: true
          },
          {
            name: "⏰ Ends",
            value: g.paused
            ? `⏸️ Paused\nRemaining: ${formatDuration(g.remainingTime || 1000)}`
            : g.endAt
              ? formatGiveawayTime(g.endAt)
              : (g.durationInput || "Unknown"),
            inline: true
          },
          {
            name: "👤 Hosted By",
            value: `<@${g.host}>`,
            inline: false
          },

          ...(g.sponsor
            ? [{
                name: "🎖️ Sponsored By",
                value: `<@${g.sponsor}>`,
                inline: false
              }]
            : []),
          {
            name: "🎟️ Entries",
            value: `${g.users?.length || 0}`,
            inline: false
          },
          {
            name: "🎁 Extra Entries",
            value:
              `<@&1358683520578617444> • +3 entries\n` +
              `<@&1384106733374410843> • +3 entries\n` +
              `<@&1358681930480226496> • +2 entries`,
            inline: false
          }
        ];

        if (requirementText) {
          fields.push({
            name: "📋 Requirements",
            value: requirementText,
            inline: false
          });
        }

          return new EmbedBuilder()
          .setTitle("🎉 Giveaway Started")
          .setDescription(`## 🎁 ${g.prize || "Prize"}`)
          .setColor(0xff4d6d)
          .addFields(fields)
          .setFooter({
            text: "Click the button below to enter"
          })
          .setTimestamp();
      }
  function buildEndedGiveawayEmbed(g, winners) {
      return new EmbedBuilder()
      .setTitle("GIVEAWAY ENDED")
      .setDescription(`## 🎁 ${g.prize || "Prize"}`)
      .setColor(0xff4d6d)
      .addFields(
        {
          name: `Winner${winners.length > 1 ? "s" : ""}`,
          value: winners.map(id => `<@${id}>`).join("\n"),
          inline: false
        },
        {
          name: "Hosted by",
          value: `<@${g.host}>`,
          inline: false
        },
        ...(g.sponsor
          ? [{
              name: "Sponsored by",
              value: `<@${g.sponsor}>`,
              inline: false
            }]
          : [])
      )
      .setFooter({
        text: `Ended at`
      })
      .setTimestamp();
  }

  function buildEndedGiveawayRow(g) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enter")
        .setEmoji("🎉")
        .setLabel(`${g.users?.length || 0}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("participants")
        .setEmoji("👥")
        .setLabel("Participants")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
  }
  async function updateEndedGiveawayMessage(g, giveawayId) {
    const giveawayChannel = await getGiveawayChannel(g);
    if (!giveawayChannel) return;

    const oldMessage = await giveawayChannel.messages.fetch(giveawayId).catch(() => null);
    if (!oldMessage) return;

    const finalWinners =
      g.finalWinners && g.finalWinners.length > 0
        ? g.finalWinners
        : g.allWinners || [];

    await oldMessage.edit({
      embeds: [buildEndedGiveawayEmbed(g, finalWinners)],
      components: [buildEndedGiveawayRow(g)]
    }).catch(() => {});
  }
              // REMOVE GIVEAWAY COOLDOWN ROLE
              async function removeCooldownLater(member) {

                setTimeout(async () => {

                  try {

                    if (
                      member.roles.cache.has(ROLES.cooldown)
                    ) {

                      await member.roles.remove(
                        ROLES.cooldown
                      );

                      console.log(
                        `Removed giveaway cooldown from ${member.user.tag}`
                      );
                    }

                  } catch (err) {
                    console.log(err);
                  }

                }, 2 * 24 * 60 * 60 * 1000); // 2 days
              }

              let giveawaysRescheduled = false;

              function rescheduleActiveGiveaways() {
                if (giveawaysRescheduled) return;
                giveawaysRescheduled = true;

                for (const [messageId, g] of giveaways.entries()) {
                  if (!g || g.ended) continue;
                  if (g.paused) continue;
                  if (!g.endAt) continue;

                  const remaining = g.endAt - Date.now();

                  if (remaining <= 0) {
                    endGiveaway(messageId);
                  } else {
                    setTimeout(() => endGiveaway(messageId), remaining);
                  }
                }

                console.log(`Rescheduled ${giveaways.size} saved giveaways`);
              }
async function buildWeeklyStaffReportEmbed(guild) {
  await guild.members.fetch();

  const staffMembers = guild.members.cache.filter(member =>
    member.roles.cache.has(ROLES.trial) ||
    member.roles.cache.has(ROLES.mod) ||
    member.roles.cache.has(ROLES.headmod)
  );

  const trackedStaff = [...staffMembers.values()].map(member => {
    const data = staffPoints.get(member.id) || {
      total: 0,
      monthly: 0,
      modlogs: 0,
      tickets: 0,
      giveaways: 0,
      strikes: 0
    };

    return { member, data };
  });

  const topMonthly = trackedStaff
    .filter(entry => (entry.data.monthly || 0) > 0)
    .sort((a, b) => (b.data.monthly || 0) - (a.data.monthly || 0))
    .slice(0, 5)
    .map((entry, index) =>
      `**#${index + 1}** <@${entry.member.id}> - ${entry.data.monthly || 0} pts`
    )
    .join("\n") || "No monthly activity yet.";

  const topModlogs = trackedStaff
    .filter(entry => (entry.data.modlogs || 0) > 0)
    .sort((a, b) => (b.data.modlogs || 0) - (a.data.modlogs || 0))
    .slice(0, 5)
    .map((entry, index) =>
      `**#${index + 1}** <@${entry.member.id}> - ${entry.data.modlogs || 0} modlogs`
    )
    .join("\n") || "No modlogs yet.";

  const topTickets = trackedStaff
    .filter(entry => (entry.data.tickets || 0) > 0)
    .sort((a, b) => (b.data.tickets || 0) - (a.data.tickets || 0))
    .slice(0, 5)
    .map((entry, index) =>
      `**#${index + 1}** <@${entry.member.id}> - ${entry.data.tickets || 0} tickets`
    )
    .join("\n") || "No tickets closed yet.";

  const topGiveaways = trackedStaff
    .filter(entry => (entry.data.giveaways || 0) > 0)
    .sort((a, b) => (b.data.giveaways || 0) - (a.data.giveaways || 0))
    .slice(0, 5)
    .map((entry, index) =>
      `**#${index + 1}** <@${entry.member.id}> - ${entry.data.giveaways || 0} giveaways`
    )
    .join("\n") || "No giveaways hosted yet.";

  const inactiveStaff = trackedStaff
    .filter(entry => (entry.data.monthly || 0) === 0)
    .slice(0, 15)
    .map(entry => `<@${entry.member.id}>`)
    .join(", ") || "No inactive staff.";

  const totalMonthly = trackedStaff.reduce(
    (sum, entry) => sum + (entry.data.monthly || 0),
    0
  );

  return new EmbedBuilder()
    .setTitle("📊 Weekly Staff Activity Report")
    .setColor(0x5865f2)
    .setDescription(
      `Tracked Staff: **${trackedStaff.length}**\n` +
      `Total Monthly Points: **${totalMonthly}**`
    )
    .addFields(
      {
        name: "🏆 Top Monthly Points",
        value: topMonthly,
        inline: false
      },
      {
        name: "✅ Top Modlogs",
        value: topModlogs,
        inline: false
      },
      {
        name: "🎫 Top Tickets",
        value: topTickets,
        inline: false
      },
      {
        name: "🎉 Top Giveaways",
        value: topGiveaways,
        inline: false
      },
      {
        name: "💤 Inactive Staff",
        value: inactiveStaff,
        inline: false
      }
    )
    .setFooter({
      text: "Auto weekly report • Inactive = 0 monthly points"
    })
    .setTimestamp();
}

async function checkWeeklyStaffReport() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata"
    })
  );

  // Saturday 5 PM IST
  if (now.getDay() !== 6 || now.getHours() !== 17) return;

  const reportKey =
    `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  if (lastWeeklyReportKey === reportKey) return;

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const channel =
    guild.channels.cache.get(CHANNELS.weeklyReports) ||
    await guild.channels.fetch(CHANNELS.weeklyReports).catch(() => null);

  if (!channel) return;

  const embed = await buildWeeklyStaffReportEmbed(guild);

  await channel.send({
    embeds: [embed]
  });

  lastWeeklyReportKey = reportKey;
  saveData();
}
// READY
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "Lunar V2 by Hiro",
        type: 3
      }
    ],
    status: "online"
  });

  expireOldStrikes();
  setInterval(expireOldStrikes, 60 * 60 * 1000);

  rescheduleActiveGiveaways();
  checkWeeklyStaffReport();
  setInterval(checkWeeklyStaffReport, 60 * 1000);
});

                // 🔄 AUTO RESET MESSAGE STATS
                setInterval(() => {

                  const now = new Date();

                  // 🌅 DAILY RESET
                  if (
                    now.getHours() === 0 &&
                    now.getMinutes() === 0
                  ) {

                    for (
                      const [id, stats]
                      of messageStats.entries()
                    ) {

                      stats.daily = 0;

                      messageStats.set(id, stats);
                    }

                    console.log(
                      "Daily messages reset"
                    );

                    saveData();
                  }

                  // 📅 WEEKLY RESET
                  if (
                    now.getDay() === 1 &&
                    now.getHours() === 0 &&
                    now.getMinutes() === 0
                  ) {

                    for (
                      const [id, stats]
                      of messageStats.entries()
                    ) {

                      stats.weekly = 0;

                      messageStats.set(id, stats);
                    }

                    console.log(
                      "Weekly messages reset"
                    );

                    saveData();
                  }

                  // 🗓️ MONTHLY RESET
                  if (
                    now.getDate() === 1 &&
                    now.getHours() === 0 &&
                    now.getMinutes() === 0
                  ) {

                    for (
                      const [id, stats]
                      of messageStats.entries()
                    ) {

                      stats.monthly = 0;

                      messageStats.set(id, stats);
                    }

                    console.log(
                      "Monthly messages reset"
                    );

                    saveData();
                  }

                }, 60000);

              // 🚫 ANTI BOT ADD
              client.on(
                "guildMemberAdd",
                async member => {

                  try {

                    // ONLY CHECK BOTS
                    if (!member.user.bot) return;

                    // FETCH AUDIT LOGS
                    const logs =
                      await member.guild.fetchAuditLogs({
                        limit: 1,
                        type: 28
                      });

                    const log =
                      logs.entries.first();

                    if (!log) return;

                    const executor =
                      await member.guild.members.fetch(
                        log.executor.id
                      );

                    // ✅ BYPASS USERS
                    const allowed =

                      executor.roles.cache.has(
                        ROLES.owner
                      ) ||

                      executor.roles.cache.has(
                        ROLES.admin
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      );

                    // ✅ ALLOWED
                    if (allowed) return;

                    // ❌ KICK BOT
                    await member.kick(
                      "Unauthorized bot add"
                    ).catch(() => {});

                    // 🚨 LOG EMBED
                    const embed =
                      new EmbedBuilder()
                        .setTitle(
                          "🚫 Unauthorized Bot Add Prevented"
                        )
                        .setColor(0xff3b3b)
                        .addFields(
                          {
                            name: "👤 Added By",
                            value:
                              `<@${executor.id}>`,
                            inline: true
                          },
                          {
                            name: "🤖 Bot",
                            value:
                              `<@${member.id}>`,
                            inline: true
                          }
                        )
                        .setTimestamp();

                    const logChannel =
                      member.guild.channels.cache.get(
                        CHANNELS.adminLogs
                      );

                    if (logChannel) {

                      logChannel.send({
                        embeds: [embed]
                      }).catch(() => {});
                    }

                  } catch (err) {

                    console.log(
                      "Anti Bot Add Error:",
                      err
                    );
                  }
                }
              );

              // 🚫 ANTI CHANNEL DELETE
              client.on(
                "channelDelete",
                async channel => {

                  try {

                    const logs =
                      await channel.guild.fetchAuditLogs({
                        limit: 1,
                        type: 12
                      });

                    const log =
                      logs.entries.first();

                    if (!log) return;

                    const executor =
                      await channel.guild.members.fetch(
                        log.executor.id
                      );
                    if (executor.id === client.user.id) return;
                    if (isTrustedBot(executor)) return;

                    if (
                      channel.parentId === CHANNELS.ticketCategory ||
                      channel.name?.startsWith("claim-")
                    ) return;

                    // ✅ BYPASS USERS
                    const allowed =

                      executor.roles.cache.has(
                        ROLES.owner
                      ) ||

                      executor.roles.cache.has(
                        ROLES.admin
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      );

                    // ✅ ALLOWED
                    if (allowed) return;

                    // ♻️ RECREATE CHANNEL
                    const newChannel =
                      await channel.guild.channels.create({
                        name: channel.name,
                        type: channel.type,
                        topic: channel.topic || null,
                        nsfw: channel.nsfw || false,
                        parent: channel.parentId || null,
                        position: channel.position,
                        rateLimitPerUser:
                          channel.rateLimitPerUser || 0,
                        permissionOverwrites:
                          channel.permissionOverwrites.cache.map(
                            overwrite => ({
                              id: overwrite.id,
                              allow: overwrite.allow,
                              deny: overwrite.deny,
                              type: overwrite.type
                            })
                          )
                      });

                    // 🚨 LOG EMBED
                    const embed =
                      new EmbedBuilder()
                        .setTitle(
                          "🚫 Channel Delete Prevented"
                        )
                        .setColor(0xff3b3b)
                        .addFields(
                          {
                            name: "👤 Deleted By",
                            value:
                              `<@${executor.id}>`,
                            inline: true
                          },
                          {
                            name: "📁 Channel",
                            value:
                              `#${channel.name}`,
                            inline: true
                          },
                          {
                            name: "♻️ Action",
                            value:
                              `${newChannel} recreated`,
                            inline: false
                          }
                        )
                        .setTimestamp();

                    const logChannel =
                      channel.guild.channels.cache.get(
                        CHANNELS.adminLogs
                      );

                    if (logChannel) {

                      logChannel.send({
                        embeds: [embed]
                      }).catch(() => {});
                    }

                  } catch (err) {

                    console.log(
                      "Anti Channel Delete Error:",
                      err
                    );
                  }
                }
              );

              // 🚫 ANTI MASS BAN
              client.on(
                "guildBanAdd",
                async ban => {

                  try {

                    const logs =
                      await ban.guild.fetchAuditLogs({
                        limit: 1,
                        type: 22
                      });

                    const log =
                      logs.entries.first();

                    if (!log) return;

                    const executor =
                      await ban.guild.members.fetch(
                        log.executor.id
                      );
                    if (isTrustedBot(executor)) return;

                    // ✅ BYPASS USERS
                    const allowed =

                      executor.roles.cache.has(
                        ROLES.owner
                      ) ||

                      executor.roles.cache.has(
                        ROLES.admin
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      );

                    // ✅ ALLOWED
                    if (allowed) return;

                    // 📊 TRACK BANS
                    if (
                      !banTracker.has(executor.id)
                    ) {

                      banTracker.set(
                        executor.id,
                        []
                      );
                    }

                    const now = Date.now();

                    const bans =
                      banTracker.get(executor.id);

                    bans.push(now);

                    // KEEP LAST 15 SECONDS
                    const filtered =
                      bans.filter(
                        t => now - t < 15000
                      );

                    banTracker.set(
                      executor.id,
                      filtered
                    );

                    // 🚨 MASS BAN DETECTED
                    if (filtered.length >= 3) {

                      // ❌ REMOVE ROLES
                      const removableRoles =
                        executor.roles.cache.filter(
                          role =>

                            role.id !==
                            ban.guild.id &&

                            !role.managed
                        );

                      for (
                        const role of removableRoles.values()
                      ) {

                        await executor.roles.remove(
                          role.id
                        ).catch(() => {});
                      }

                      // 🚨 LOG EMBED
                      const embed =
                        new EmbedBuilder()
                          .setTitle(
                            "🚫 Mass Ban Prevented"
                          )
                          .setColor(0xff3b3b)
                          .addFields(
                            {
                              name: "👤 User",
                              value:
                                `<@${executor.id}>`,
                              inline: true
                            },
                            {
                              name: "📊 Bans",
                              value:
                                `${filtered.length} bans in 15s`,
                              inline: true
                            },
                            {
                              name: "🛡️ Action",
                              value:
                                "All roles removed",
                              inline: false
                            }
                          )
                          .setTimestamp();

                      const logChannel =
                        ban.guild.channels.cache.get(
                          CHANNELS.adminLogs
                        );

                      if (logChannel) {

                        logChannel.send({
                          embeds: [embed]
                        }).catch(() => {});
                      }

                      // RESET TRACKER
                      banTracker.delete(
                        executor.id
                      );
                    }

                  } catch (err) {

                    console.log(
                      "Anti Mass Ban Error:",
                      err
                    );
                  }
                }
              );

              // 🚫 ANTI ROLE DELETE
              client.on(
                "roleDelete",
                async role => {

                  try {

                    const logs =
                      await role.guild.fetchAuditLogs({
                        limit: 1,
                        type: 32
                      });

                    const log =
                      logs.entries.first();

                    if (!log) return;

                    const executor =
                      await role.guild.members.fetch(
                        log.executor.id
                      );
                    if (isTrustedBot(executor)) return;

                    // ✅ BYPASS USERS
                    const allowed =

                      executor.roles.cache.has(
                        ROLES.owner
                      ) ||

                      executor.roles.cache.has(
                        ROLES.admin
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      ) ||

                      executor.roles.cache.has(
                        ROLES.ultimate
                      );

                    // ✅ ALLOWED
                    if (allowed) return;

                    // ♻️ RECREATE ROLE
                    const newRole =
                      await role.guild.roles.create({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        permissions: role.permissions,
                        mentionable: role.mentionable,
                        position: role.position,
                        reason:
                          "Anti Role Delete Protection"
                      });

                    // 🚨 LOG EMBED
                    const embed =
                      new EmbedBuilder()
                        .setTitle(
                          "🚫 Role Delete Prevented"
                        )
                        .setColor(0xff3b3b)
                        .addFields(
                          {
                            name: "👤 Deleted By",
                            value:
                              `<@${executor.id}>`,
                            inline: true
                          },
                          {
                            name: "🛡️ Role",
                            value:
                              `@${role.name}`,
                            inline: true
                          },
                          {
                            name: "♻️ Action",
                            value:
                              `<@&${newRole.id}> recreated`,
                            inline: false
                          }
                        )
                        .setTimestamp();

                    const logChannel =
                      role.guild.channels.cache.get(
                        CHANNELS.adminLogs
                      );

                    if (logChannel) {

                      logChannel.send({
                        embeds: [embed]
                      }).catch(() => {});
                    }

                  } catch (err) {

                    console.log(
                      "Anti Role Delete Error:",
                      err
                    );
                  }
                }
              );

  async function removeUserFromActiveGiveaways(member, blockedRole) {
    if (isBypass(member)) return;

    for (const [messageId, giveaway] of giveaways.entries()) {
      if (!giveaway.users || !giveaway.users.includes(member.id)) continue;

      giveaway.users = giveaway.users.filter(id => id !== member.id);

      if (giveaway.entryMap) {
        delete giveaway.entryMap[member.id];
      }

      giveaways.set(messageId, giveaway);
      saveData();

      const channelId =
        giveaway.channelId ||
        giveaway.channel?.id;

      if (!channelId) continue;

      const channel =
        client.channels.cache.get(channelId) ||
        await client.channels.fetch(channelId).catch(() => null);

      if (!channel || !channel.messages) continue;

      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg || !msg.embeds[0]) continue;

      const entryCount = giveaway.users.length;
      const embed = EmbedBuilder.from(msg.embeds[0]);
      const fields = embed.data.fields || [];

      const entriesIndex = fields.findIndex(field =>
        field.name.includes("Entries") &&
        !field.name.includes("Extra")
      );

      if (entriesIndex !== -1) {
        fields[entriesIndex] = {
          ...fields[entriesIndex],
          value: `${entryCount}`
        };
      }

      embed.setFields(fields);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("enter")
          .setEmoji("🎉")
          .setLabel(`${entryCount}`)
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("participants")
          .setEmoji("👥")
          .setLabel("Participants")
          .setStyle(ButtonStyle.Secondary)
      );

      await msg.edit({
        embeds: [embed],
        components: [row]
      }).catch(() => {});

      const logChannel = member.guild.channels.cache.get(CHANNELS.adminLogs);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle("🚫 Giveaway Entry Removed")
          .setColor(0xff3b3b)
          .addFields(
            {
              name: "👤 User",
              value: `<@${member.id}>`,
              inline: true
            },
            {
              name: "🛡️ Block Role",
              value: `<@&${blockedRole.id}>`,
              inline: true
            },
            {
              name: "🎉 Giveaway",
              value: `[Jump to Giveaway](${msg.url})`,
              inline: false
            }
          )
          .setTimestamp();

        logChannel.send({
          embeds: [logEmbed]
        });
      }
    }
  }
  // ROLE GUARD
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    try {
      const addedRoles = newMember.roles.cache.filter(
        role => !oldMember.roles.cache.has(role.id)
      );

      const removedRoles = oldMember.roles.cache.filter(
        role => !newMember.roles.cache.has(role.id)
      );

      if (!addedRoles.size && !removedRoles.size) return;

      await new Promise(resolve => setTimeout(resolve, 800));

      const logs = await newMember.guild.fetchAuditLogs({
        limit: 5,
        type: 25
      });

      const log = logs.entries.find(entry =>
        entry.target?.id === newMember.id &&
        Date.now() - entry.createdTimestamp < 5000
      );

      if (!log) return;

      const executor = await newMember.guild.members.fetch(log.executor.id).catch(() => null);
      if (!executor || executor.user.bot) return;

      const isBoss =
        executor.roles.cache.has(ROLES.ultimate) ||
        executor.roles.cache.has(ROLES.owner) ||
        executor.roles.cache.has(ROLES.admin) ||
        executor.roles.cache.has(ROLES.ultimate);

      if (isBoss) return;

      const trialAllowedRoles = [
        ROLES.cooldown,
        ROLES.gwyBanned
      ];

      const staffAllowedRoles = [
        ROLES.cooldown,
        ROLES.gwyBanned,
        ROLES.eventBan,
        ROLES.brookArmy,
        ROLES.valorant,
        ROLES.dashRole,
        ROLES.dotRole,
        ROLES.muted
      ];

      const isTrial = executor.roles.cache.has(ROLES.trial);
      const isMod = executor.roles.cache.has(ROLES.mod);
      const isHeadMod = executor.roles.cache.has(ROLES.headmod);

      if (!isTrial && !isMod && !isHeadMod) return;

      const allowedRoles = isTrial ? trialAllowedRoles : staffAllowedRoles;

      const changedRoles = [
        ...addedRoles.values(),
        ...removedRoles.values()
      ];

      const abusedRoles = changedRoles.filter(role =>
        !allowedRoles.includes(role.id)
      );

      if (!abusedRoles.length) {
        for (const role of addedRoles.values()) {
          if (role.id === ROLES.cooldown || role.id === ROLES.gwyBanned) {
            await removeUserFromActiveGiveaways(newMember, role);
          }
        }

        return;
      }

      for (const role of addedRoles.values()) {
        if (abusedRoles.some(abused => abused.id === role.id)) {
          await newMember.roles.remove(role.id).catch(() => {});
        }
      }

      for (const role of removedRoles.values()) {
        if (abusedRoles.some(abused => abused.id === role.id)) {
          await newMember.roles.add(role.id).catch(() => {});
        }
      }

      const current = strikes.get(executor.id) || [];
      const strikeId = current.length + 1;

      current.push({
        id: strikeId,
        reason: "Role abuse prevented",
        by: client.user.id,
        time: Date.now()
      });

      strikes.set(executor.id, current);
      saveData();
      await alertFiveStrikes(
        newMember.guild,
        executor.id,
        current,
        "Role abuse prevented",
        client.user.id
      );

      const roleList = abusedRoles.map(role => `<@&${role.id}>`).join(", ");

      const embed = new EmbedBuilder()
        .setTitle("🚨 Role Abuse Prevented")
        .setColor(0xff3b3b)
        .addFields(
          {
            name: "👤 Staff",
            value: `<@${executor.id}>`,
            inline: true
          },
          {
            name: "🎯 Target",
            value: `<@${newMember.id}>`,
            inline: true
          },
          {
            name: "🛡️ Unauthorized Role(s)",
            value: roleList,
            inline: false
          },
          {
            name: "⚠️ Action Taken",
            value: `Role change reverted and Strike #${strikeId} added.`,
            inline: false
          }
        )
        .setTimestamp();

      const logChannel = newMember.guild.channels.cache.get(CHANNELS.adminLogs);

      if (logChannel) {
        logChannel.send({
          embeds: [embed]
        });
      }
    } catch (err) {
      console.log("Role Guard Error:", err);
    }
  });


              // COMMAND HANDLER (ONLY ONE)
              client.on("messageCreate", async (message) => {
                if (message.author.bot) return;
                // 📊 MESSAGE TRACKER - only count giveaway requirement channel
                const GIVEAWAY_MESSAGE_CHANNEL = "1318168240383594527";

                if (message.channel.id === GIVEAWAY_MESSAGE_CHANNEL) {
                  const stats =
                    messageStats.get(message.author.id) || {
                      daily: 0,
                      weekly: 0,
                      monthly: 0,
                      total: 0
                    };

                  stats.daily++;
                  stats.weekly++;
                  stats.monthly++;
                  stats.total++;

                  messageStats.set(
                    message.author.id,
                    stats
                  );

                  saveData();
                }

                  // 🚨 ANTI EVERYONE PING
                  if (

                    message.content.includes("@everyone") ||
                    message.content.includes("@here")

                  ) {

                    if (message.author.bot && TRUSTED_BOTS.includes(message.author.id)) return;

                    const member =
                      message.member;

                  // ✅ BYPASS
                  if (

                    member.roles.cache.has(
                      ROLES.owner
                    ) ||

                    member.roles.cache.has(
                      ROLES.admin
                    ) ||

                    member.roles.cache.has(
                      ROLES.ultimate
                    ) ||

                    member.roles.cache.has(
                      ROLES.ultimate
                    )

                  ) return;

                  // ❌ DELETE MESSAGE
                  await message.delete()
                    .catch(() => {});

                  // 🚨 WARNING EMBED
                  const embed =
                    new EmbedBuilder()
                      .setTitle(
                        "🚨 Everyone Ping Prevented"
                      )
                      .setColor(0xff3b3b)
                      .addFields(
                        {
                          name: "👤 User",
                          value:
                            `<@${message.author.id}>`,
                          inline: true
                        },
                        {
                          name: "📄 Message",
                          value:
                            message.content.slice(
                              0,
                              1000
                            ),
                          inline: false
                        }
                      )
                      .setTimestamp();

                  await message.channel.send({
                    embeds: [embed]
                  }).catch(() => {});

                  // 📢 LOG CHANNEL
                  const logChannel =
                    message.guild.channels.cache.get(
                      CHANNELS.adminLogs
                    );

                  if (logChannel) {

                    logChannel.send({
                      embeds: [embed]
                    }).catch(() => {});
                  }

                  return;
                }
                const protectedUserPings = message.mentions.users.filter(user =>
                  PROTECTED_PING_USERS.includes(user.id) &&
                  (
                    message.content.includes(`<@${user.id}>`) ||
                    message.content.includes(`<@!${user.id}>`)
                  )
                );

                if (protectedUserPings.size > 0 && !canPingProtected(message.member)) {
                  const pingedUsers = protectedUserPings
                    .map(user => `<@${user.id}>`)
                    .join("\n");

                  const embed = new EmbedBuilder()
                    .setTitle("🔕 Please Avoid Pinging")
                    .setColor(0xffcc00)
                    .setDescription(
                      "Please do not ping Him members unless it is truly required."
                    )
                    .addFields(
                      {
                        name: "Please Avoid Pinging",
                        value: pingedUsers,
                        inline: false
                      },
                      {
                        name: "What to do instead",
                        value: "Open a ticket or contact staff normally.",
                        inline: false
                      }
                    )
                    .setFooter({ text: "Lunar Ping Protection" })
                    .setTimestamp();

                  await message.reply({
                    embeds: [embed],
                    allowedMentions: { repliedUser: false, parse: [] }
                  }).catch(() => {});

                  return;
                }
                if (!message.content.startsWith(PREFIX)) return;
                // 🔐 GLOBAL PREFIX COMMAND PERMISSION GUARD
                const commandName = message.content
                  .slice(PREFIX.length)
                  .trim()
                  .split(/\s+/)[0]
                  .toLowerCase();

                const publicPrefixCommands = ["help", "messages", "messagelb"];

                if (!publicPrefixCommands.includes(commandName)) {
                  const level = getUserLevel(message.member);
                  const level4PrefixCommands = [
                    "gfix",
                    "clearstrikes",
                    "resetdaily",
                    "resetweekly",
                    "resetmonthly",
                    "addmessages",
                    "removemessages",
                    "setmessages"
                  ];

                  if (level4PrefixCommands.includes(commandName) && level < 4) {
                    return message.reply({
                      content: "❌ Level 4 only.",
                      allowedMentions: { repliedUser: false }
                    });
                  }

                  if (level < 1) {
                    return;
                  }
                }

                const member = message.member;
                const level = getUserLevel(member);

                const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
                const cmd = args.shift().toLowerCase();

                if (level === 0 && !["help", "messages", "messagelb"].includes(cmd)) {
                  return;
                }

                // HELP
                if (cmd === "help") {
                  const embed = buildHelpEmbed(level);

                  if (level >= 4) {
                    await message.author.send({
                      embeds: [embed],
                      components: [buildHelpActionRow()]
                    }).catch(() => null);

                    return message.reply({
                      content: "✅ Help menu sent to your DM.",
                      allowedMentions: { repliedUser: false }
                    });
                  }

                  return message.reply({
                    embeds: [embed],
                    components: [buildHelpMenu(level), buildHelpActionRow()],
                    allowedMentions: { repliedUser: false }
                  });
                }

                // 🏆 MESSAGE LEADERBOARD
                if (cmd === "messagelb") {
                  const sorted = [...messageStats.entries()]
                    .map(([userId, stats]) => {
                      const total =
                        stats.total ||
                        (stats.daily || 0) +
                        (stats.weekly || 0) +
                        (stats.monthly || 0);

                      return [userId, { ...stats, total }];
                    })
                    .filter(([, stats]) => stats.total > 0)
                    .sort((a, b) => b[1].total - a[1].total);

                  if (sorted.length === 0) {
                    return message.reply("❌ No message data found");
                  }

                  const pageSize = 10;
                  let page = 0;
                  const maxPage = Math.ceil(sorted.length / pageSize) - 1;

                  const buildMessageLbEmbed = () => {
                    const pageData = sorted.slice(page * pageSize, page * pageSize + pageSize);

                    const text = pageData.map(([userId, stats], index) => {
                      const rank = page * pageSize + index + 1;
                      return `🏆 **#${rank}** • <@${userId}>\n💬 Total Messages: **${stats.total}**`;
                    }).join("\n\n");

                    return new EmbedBuilder()
                      .setTitle("🏆 Message Leaderboard")
                      .setColor(0xffd700)
                      .setDescription(text)
                      .setFooter({ text: `Page ${page + 1}/${maxPage + 1}` })
                      .setTimestamp();
                  };

                  const buildMessageLbRow = () =>
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setCustomId("msg_lb_prev")
                        .setLabel("Previous")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                      new ButtonBuilder()
                        .setCustomId("msg_lb_next")
                        .setLabel("Next")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === maxPage)
                    );

                  const lbMessage = await message.channel.send({
                    embeds: [buildMessageLbEmbed()],
                    components: [buildMessageLbRow()]
                  });

                  const collector = lbMessage.createMessageComponentCollector({
                    time: 5 * 60 * 1000
                  });

                  collector.on("collect", async interaction => {
                    if (interaction.user.id !== message.author.id) {
                      return interaction.reply({
                        content: "❌ This leaderboard menu is not for you.",
                        ephemeral: true
                      });
                    }

                    if (interaction.customId === "msg_lb_prev" && page > 0) page--;
                    if (interaction.customId === "msg_lb_next" && page < maxPage) page++;

                    await interaction.update({
                      embeds: [buildMessageLbEmbed()],
                      components: [buildMessageLbRow()]
                    });
                  });

                  collector.on("end", async () => {
                    await lbMessage.edit({
                      components: []
                    }).catch(() => {});
                  });

                  return;
                }

                // 📊 MESSAGE STATS
                if (cmd === "messages") {

                  const user =
                    message.mentions.users.first()
                    || message.author;

                  const stats =
                    messageStats.get(user.id) || {

                      daily: 0,
                      weekly: 0,
                      monthly: 0,
                      total: 0
                    };

                  const embed =
                    new EmbedBuilder()
                      .setTitle(
                        "📊 Message Statistics"
                      )
                      .setColor(0x5865f2)
                      .addFields(
                        {
                          name: "👤 User",
                          value: `<@${user.id}>`,
                          inline: true
                        },
                        {
                          name: "🌅 Daily",
                          value: `${stats.daily}`,
                          inline: true
                        },
                        {
                          name: "📅 Weekly",
                          value: `${stats.weekly}`,
                          inline: true
                        },
                        {
                          name: "🗓️ Monthly",
                          value: `${stats.monthly}`,
                          inline: true
                        }
                      )
                      .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // ⚙️ MESSAGE MANAGEMENT
                if (
                  cmd === "addmessages" ||
                  cmd === "removemessages" ||
                  cmd === "setmessages"
                ) {

                  if (!isBypass(message.member)) {

                    return message.reply(
                      "❌ Admin only"
                    );
                  }

                  const user =
                    message.mentions.users.first();

                  const type =
                    args[1]?.toLowerCase();

                  const amount =
                    parseInt(args[2]);

                  if (
                    !user ||
                    !type ||
                    isNaN(amount)
                  ) {

                    return message.reply(
                      `❌ Usage:\n` +
                      `.addmessages @user total 500`
                    );
                  }

                  const valid =
                    [
                      "daily",
                      "weekly",
                      "monthly",
                      "total"
                    ];

                  if (!valid.includes(type)) {

                    return message.reply(
                      "❌ Invalid type"
                    );
                  }

                  const stats =
                    messageStats.get(user.id) || {

                      daily: 0,
                      weekly: 0,
                      monthly: 0,
                      total: 0
                    };

                  // ➕ ADD
                  if (cmd === "addmessages") {

                    stats[type] += amount;
                  }

                  // ➖ REMOVE
                  else if (
                    cmd === "removemessages"
                  ) {

                    stats[type] -= amount;

                    if (stats[type] < 0) {
                      stats[type] = 0;
                    }
                  }

                  // ✏️ SET
                  else if (
                    cmd === "setmessages"
                  ) {

                    stats[type] = amount;
                  }

                  messageStats.set(
                    user.id,
                    stats
                  );

                  saveData();

                  const embed =
                    new EmbedBuilder()
                      .setTitle(
                        "⚙️ Message Stats Updated"
                      )
                      .setColor(0x5865f2)
                      .addFields(
                        {
                          name: "👤 User",
                          value:
                            `<@${user.id}>`,
                          inline: true
                        },
                        {
                          name: "📊 Type",
                          value:
                            type,
                          inline: true
                        },
                        {
                          name: "📈 New Value",
                          value:
                            `${stats[type]}`,
                          inline: true
                        }
                      )
                      .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 🔄 RESET MESSAGE STATS
                if (
                  cmd === "resetdaily" ||
                  cmd === "resetweekly" ||
                  cmd === "resetmonthly"
                ) {

                  if (!isBypass(message.member)) {

                    return message.reply(
                      "❌ Admin only"
                    );
                  }

                  const user =
                    message.mentions.users.first();

                  if (!user) {

                    return message.reply(
                      "❌ Mention a user"
                    );
                  }

                  const stats =
                    messageStats.get(user.id) || {

                      daily: 0,
                      weekly: 0,
                      monthly: 0,
                      total: 0
                    };

                  // 🌅 DAILY
                  if (cmd === "resetdaily") {
                    stats.daily = 0;
                  }

                  // 📅 WEEKLY
                  if (cmd === "resetweekly") {
                    stats.weekly = 0;
                  }

                  // 🗓️ MONTHLY
                  if (cmd === "resetmonthly") {
                    stats.monthly = 0;
                  }

                  messageStats.set(
                    user.id,
                    stats
                  );

                  saveData();

                  const embed =
                    new EmbedBuilder()
                      .setTitle(
                        "🔄 Message Stats Reset"
                      )
                      .setColor(0x57f287)
                      .setDescription(
                        `✅ Reset ${cmd.replace(
                          "reset",
                          ""
                        )} messages for <@${user.id}>`
                      )
                      .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // TEST
                if (cmd === "test") {
                  return message.reply(`Working ✅ Level: ${level}`);
                }

                // GIVEAWAY START (ANTI-DUPLICATE FIX)
                if (cmd === "gstart" && level >= 2) {

                  if (activeCommands.has(message.id)) return;
                  activeCommands.add(message.id);
                  setTimeout(() => activeCommands.delete(message.id), 5000);

                  const durationInput = args[0] || "1m";
                  const claimInput = args[1] || "30s";

                  const duration = parseTime(durationInput);
                  const claimTime = parseTime(claimInput);

                  let winnerCount = 1;
                  let prize = "";
                  let sponsor = message.mentions.users.first();

                  if (!isNaN(args[2])) {

                    winnerCount = parseInt(args[2]);

                    prize = args.slice(3).join(" ");

                  } else {

                    prize = args.slice(2).join(" ");
                  }

                  if (!prize) prize = "Prize";
                  if (sponsor) {
                    prize = prize.replace(`<@${sponsor.id}>`, "").replace(`<@!${sponsor.id}>`, "").trim();
                    if (!prize) prize = "Prize";
                  }

                  const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("enter").setLabel("🎉 Enter").setStyle(ButtonStyle.Primary)
                  );

                    const embed = new EmbedBuilder()
                    .setTitle("🎉 Giveaway Started")
                    .setDescription(`## 🎁 ${prize}`)
                    .setColor(0xff4d6d)
                    .addFields(
                      {
                        name: "⏰ Duration",
                        value: durationInput,
                        inline: true
                      },
                      {
                        name: "👑 Hosted By",
                        value: `<@${message.author.id}>`,
                        inline: true
                      },
                      {
                        name: "🎟️ Entries",
                        value: "0",
                        inline: true
                      }
                    )
                    .setFooter({
                      text: "Click the button below to enter"
                    })
                    .setTimestamp();

                  const msg = await message.channel.send({
                    embeds: [embed],
                    components: [row]
                  });

                      giveaways.set(msg.id, {
                        users: [],
                        entryMap: {},
                        winnerCount,
                    claimTime,
                        endAt: Date.now() + duration,
                    prize, // 🔥 ADD THIS
                        channel: message.channel,
                        channelId: message.channel.id,
                    ended: false,
                        lastWinner: null,
                        allWinners: [],
                        claimedUsers: [],
                        failed: [],
                        host: message.author.id,
                        sponsor: sponsor ? sponsor.id : null,
                        messageUrl: msg.url
                  });
                  addPoints(message.author.id, "giveaway");
                  saveData();

                  await sendGiveawayAuditLog(
                    message.guild,
                    "created",
                    msg.id,
                    giveaways.get(msg.id),
                    message.author,
                    { summary: `Prefix giveaway created with **${winnerCount}** winner(s).` }
                  );

                  setTimeout(() => endGiveaway(msg.id), duration);
                }

                // 🎉 GIVEAWAY MESSAGE REQUIREMENTS
                if (cmd === "greq") {

                  if (!isBypass(message.member)) {

                    return message.reply(
                      "❌ Admin only"
                    );
                  }

                  const messageId = args[0];
                  const type = args[1];
                  const amount = parseInt(args[2]);

                  if (
                    !messageId ||
                    !type ||
                    isNaN(amount)
                  ) {

                    return message.reply(
                      "❌ Usage: .greq <messageId> <daily/weekly/monthly> <amount>"
                    );
                  }

                  const g =
                    giveaways.get(messageId);

                  if (!g) {

                    return message.reply(
                      "❌ Giveaway not found"
                    );
                  }

                  if (type === "daily") {
                    g.requiredDaily = amount;
                  }

                  else if (type === "weekly") {
                    g.requiredWeekly = amount;
                  }

                  else if (type === "monthly") {
                    g.requiredMonthly = amount;
                  }

                  else {

                    return message.reply(
                      "❌ Types: daily, weekly, monthly"
                    );
                  }

                  giveaways.set(messageId, g);

                  saveData();
                  // 🔄 UPDATE GIVEAWAY EMBED
                  try {

                    const msg =
                      await g.channel.messages.fetch(
                        messageId
                      );

                    let requirementText = "";

                    // 🌅 DAILY
                    if (g.requiredDaily > 0) {

                      requirementText +=
                        `🌅 Daily: ${g.requiredDaily}\n`;
                    }

                    // 📅 WEEKLY
                    if (g.requiredWeekly > 0) {

                      requirementText +=
                        `📅 Weekly: ${g.requiredWeekly}\n`;
                    }

                    // 🗓️ MONTHLY
                    if (g.requiredMonthly > 0) {

                      requirementText +=
                        `🗓️ Monthly: ${g.requiredMonthly}\n`;
                    }

                    const embed =
                      EmbedBuilder.from(
                        msg.embeds[0]
                      );

                    // REMOVE OLD REQUIREMENTS FIELD
                    embed.data.fields =
                      embed.data.fields.filter(
                        field =>
                          field.name !==
                          "📋 Requirements"
                      );

                    // ADD NEW FIELD ONLY IF REQUIREMENTS EXIST
                    if (requirementText) {

                      embed.addFields({
                        name: "📋 Requirements",
                        value: requirementText,
                        inline: false
                      });
                    }

                    await msg.edit({
                      embeds: [embed]
                    });

                  } catch (err) {

                    console.log(
                      "Requirement Update Error:",
                      err
                    );
                  }

                  return message.reply(
                    `✅ Set ${type} requirement to ${amount}`
                  );
                }

                // FIX WINNER
                if (cmd === "gfix" && level >= 4) {
                  const user = message.mentions.users.first();
                  const id = args[1];

                  if (!user || !id) {
                    return message.reply("Usage: .gfix @user messageId");
                  }

                  const g = giveaways.get(id);

                  if (!g) {
                    return message.reply("❌ Giveaway not found.");
                  }

                  if (g.ended) {
                    return message.reply("❌ This giveaway already ended.");
                  }

                  fixedWinners.set(id, user.id);
                  saveData();

                  return message.reply(`✅ Fixed winner set: <@${user.id}>`);
                }
                if (cmd === "close") {

                  const member = message.member;

                  const isStaff =
                    member.roles.cache.has(ROLES.mod) ||
                    member.roles.cache.has(ROLES.trial) ||
                    member.roles.cache.has(ROLES.headmod);

                  if (!isStaff && !isBypass(member)) {
                    return message.reply("❌ Only staff can close tickets.");
                  }

                  if (message.channel.parentId !== CHANNELS.ticketCategory) {
                    return message.reply("❌ This is not a ticket.");
                  }

                  const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId("close_confirm")
                      .setLabel("✅ Confirm")
                      .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                      .setCustomId("close_cancel")
                      .setLabel("❌ Cancel")
                      .setStyle(ButtonStyle.Danger)
                  );

                  const closePromptEmbed = new EmbedBuilder()
                    .setTitle("⚠️ Confirm Ticket Close?")
                    .setColor(0xffcc00)
                    .setDescription(
                      "Are you sure you want to close this ticket?\n\n" +
                      "After confirmation, transcript and logs will be saved, then the ticket will delete in **5 seconds**."
                    )
                    .setFooter({ text: `Requested by ${message.author.tag}` })
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [closePromptEmbed],
                    components: [row]
                  });
                }

                // 🔥 STRIKE COMMAND
                if (cmd === "strike") {

                  const user = message.mentions.users.first();
                  const targetMember = message.guild.members.cache.get(user.id);
                  if (!targetMember) return message.reply("❌ User not found");

                  // 🔐 HIERARCHY CHECK
                  const author = message.member;

                  const isAuthorUltimate = author.roles.cache.has(ROLES.ultimate);
                  const isAuthorAdmin = isBypass(author); // admin/owner/ultimate
                  const isAuthorHead = author.roles.cache.has(ROLES.headmod);

                  const isTargetUltimate = targetMember.roles.cache.has(ROLES.ultimate);
                  const isTargetAdmin = targetMember.roles.cache.has(ROLES.admin);
                  const isTargetOwner = targetMember.roles.cache.has(ROLES.owner);
                  const isTargetHead = targetMember.roles.cache.has(ROLES.headmod);

                  // ❌ Nobody can strike ultimate
                  if (isTargetUltimate) {
                    return message.reply("❌ You cannot strike your boss");
                  }

                  // ❌ Admin/Owner cannot strike ultimate (extra safety)
                  if (isAuthorAdmin && isTargetUltimate) {
                    return message.reply("❌ You cannot strike ultimate role user");
                  }

                  // ❌ Head mod restrictions
                  if (isAuthorHead) {

                    if (isTargetAdmin || isTargetOwner || isTargetHead) {
                      return message.reply("❌ You cannot strike equal or higher role");
                    }
                  }


                  // ❌ ONLY STAFF CAN BE STRIKED
                  const isTargetStaff =
                    targetMember.roles.cache.has(ROLES.trial) ||
                    targetMember.roles.cache.has(ROLES.mod) ||
                    targetMember.roles.cache.has(ROLES.headmod);

                  if (!isTargetStaff) {
                    return message.reply("❌ We can only strike staff members");
                  }

                  // ❌ Admin/Owner cannot strike each other (optional safety)
                  if (isAuthorAdmin && (isTargetAdmin || isTargetOwner)) {
                    return message.reply("❌ You cannot strike equal level staff");
                  }
                  if (!user) return message.reply("❌ Mention user");

                  const member = message.member;

                  // 🔐 STRICT PERMISSION (FIXED)
                  const isAdmin = isBypass(member);
                  const isHeadMod = member.roles.cache.has(ROLES.headmod);

                  // ❌ block everyone except headmod + admin
                  if (!isAdmin && !isHeadMod) {
                    return message.reply("❌ You are not allowed to use strike command");
                  }

                  const reason = args.slice(1).join(" ") || "No reason";

                  const current = strikes.get(user.id) || [];
                  const strikeId = current.length + 1;

                  current.push({
                    id: strikeId,
                    reason,
                    by: message.author.id,
                    time: Date.now()
                  });

                  strikes.set(user.id, current);

                  saveData();
                  addPoints(message.author.id, "strike");
                  await alertFiveStrikes(
                    message.guild,
                    user.id,
                    current,
                    reason,
                    message.author.id
                  );

                  message.channel.send(
                `⚠️ Strike #${strikeId} added to <@${user.id}>
                Reason: ${reason}`
                  );

                  const logChannel = message.guild.channels.cache.get(CHANNELS.strikeLogs);

                  if (logChannel) {
                    const embed = new EmbedBuilder()
                      .setTitle("📕 Strike Log")
                      .setColor(0xff3b3b)
                      .addFields(
                        { name: "User", value: `<@${user.id}>`, inline: true },
                        { name: "Given By", value: `<@${message.author.id}>`, inline: true },
                        { name: "Strike", value: `#${strikeId}`, inline: true },
                        { name: "Reason", value: reason }
                      )
                      .setTimestamp();

                  logChannel.send({ embeds: [embed] });
                  }
                  }

                  // 🔥 REMOVE STRIKE (NOW SEPARATE ✅)
                  if (cmd === "removestrike") {

                  const user = message.mentions.users.first();
                  const strikeNumber = parseInt(args[1]);

                  if (!user) return message.reply("❌ Mention user");
                  if (isNaN(strikeNumber)) {
                    return message.reply("❌ Usage: .removestrike @user <number>");
                  }

                  const member = message.member;

                  const isAdmin = isBypass(member);
                  const isHeadMod = member.roles.cache.has(ROLES.headmod);

                  // ❌ block headmod
                  if (isHeadMod && !isAdmin) {
                    return message.reply("❌ Contact an admin to remove strikes");
                  }

                  // ❌ block others
                  if (!isAdmin) {
                    return message.reply("❌ Only admins can remove strikes");
                  }

                  const userStrikes = strikes.get(user.id);

                  if (!userStrikes || userStrikes.length === 0) {
                    return message.reply("❌ User has no strikes");
                  }

                  const index = strikeNumber - 1;

                  if (index < 0 || index >= userStrikes.length) {
                    return message.reply("❌ Invalid strike number");
                  }

                  userStrikes.splice(index, 1);

                  userStrikes.forEach((s, i) => {
                    s.id = i + 1;
                  });

                  strikes.set(user.id, userStrikes);

                  saveData();

                  message.channel.send(`✅ Removed strike #${strikeNumber} from <@${user.id}>`);

                  const logChannel = message.guild.channels.cache.get(CHANNELS.strikeLogs);

                  if (logChannel) {

                    const embed = new EmbedBuilder()
                      .setTitle("🧹 Strike Removed")
                      .setColor(0x00c853)
                      .addFields(
                        { name: "User", value: `<@${user.id}>`, inline: true },
                        { name: "Removed By", value: `<@${message.author.id}>`, inline: true },
                        { name: "Strike Removed", value: `#${strikeNumber}`, inline: true }
                      )
                      .setTimestamp();

                        logChannel.send({ embeds: [embed] });
                          }
                        }


                // 🔥 MODLOG COMMAND
                if (cmd === "modlog") {

                  const type = args[0]?.toLowerCase();

                  const validTypes = ["warn", "timeout", "kick", "ban"];

                  if (!validTypes.includes(type)) {
                    return message.reply("❌ Valid types: warn, timeout, kick, ban");
                  }

                  const target = message.mentions.users.first();
                  if (!target) {
                    return message.reply("❌ Mention user");
                  }

                  const member = message.member;

                  const canSubmit =
                    member.roles.cache.has(ROLES.trial) ||
                    member.roles.cache.has(ROLES.mod) ||
                    member.roles.cache.has(ROLES.headmod) ||
                    isBypass(member);

                  if (!canSubmit) {
                    return message.reply("❌ You cannot submit modlogs");
                  }

                  // reason | proof split
                  const full = args.slice(2).join(" ");
                  const split = full.split("|");

                  const reason = split[0]?.trim() || "No reason";
                  // 📎 ATTACHMENT SUPPORT
                  const attachment = message.attachments.first();

                  let proof = "No proof provided";
                  let imageProof = null;
                  let fileAttachment = null;

                  if (attachment) {

                    proof = attachment.url;

                    // image preview
                      if (
                        attachment &&
                        typeof attachment.contentType === "string" &&
                        attachment.contentType.startsWith("image/")
                      ) {
                        imageProof = attachment.url;
                      }

                    // video/file
                    else {
                      fileAttachment = attachment.url;
                    }
                  }

                  const logId = Date.now().toString();

                  caseCounter++;

                  const caseId = caseCounter;

                    punishmentLogs.set(logId, {
                      caseId,
                      target: target.id,
                    type,
                    reason,
                    proof,
                    moderator: message.author.id,
                    status: "Pending"
                  });

                  saveData();

                  const embed = new EmbedBuilder()
                    .setTitle("📋 Punishment Log")
                    .setColor(0xffcc00)
                    .addFields(
                      { name: "🆔 Case ID", value: `#${caseId}`, inline: true },
                      { name: "👤 Punished User", value: `<@${target.id}>`, inline: true },
                      { name: "⚠️ Punishment", value: type, inline: true },
                      { name: "🛡️ Submitted By", value: `<@${message.author.id}>`, inline: true },
                      { name: "📝 Reason", value: reason },
                      { name: "📎 Proof", value: proof },
                      { name: "📌 Status", value: "Pending Review" }
                    );

                  if (imageProof) {
                    embed.setImage(imageProof);
                  }

                      embed.setTimestamp();

                  const row = new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                      .setCustomId(`approve_${logId}`)
                      .setLabel("Approve")
                      .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                      .setCustomId(`reject_${logId}`)
                      .setLabel("Reject")
                      .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                      .setCustomId(`note_${logId}`)
                      .setLabel("Add Note")
                      .setStyle(ButtonStyle.Secondary)
                  );

                  const logChannel = message.guild.channels.cache.get(CHANNELS.modLogs);

                  if (!logChannel) {
                    return message.reply("❌ ModLogs channel not found");
                  }

                  logChannel.send({
                    embeds: [embed],
                    components: [row]
                  });

                  message.reply("✅ Punishment log submitted");
                }

                // 📋 STAFF MODLOGS
                if (cmd === "modlogs") {

                  const user = message.mentions.users.first();

                  if (!user) {
                    return message.reply("❌ Mention staff user");
                  }

                  const logs = [];

                  for (const [id, data] of punishmentLogs.entries()) {

                    if (
                      data.moderator === user.id &&
                      data.status === "Approved"
                    ) {

                      logs.push(
                        `• ${data.type.toUpperCase()} → <@${data.target}>`
                      );
                    }
                  }

                  const embed = new EmbedBuilder()
                    .setTitle("📋 Staff ModLogs")
                    .setColor(0x00b0f4)
                    .addFields(
                      {
                        name: "👤 Staff",
                        value: `<@${user.id}>`,
                        inline: true
                      },
                      {
                        name: "✅ Approved Logs",
                        value: `${logs.length}`,
                        inline: true
                      },
                      {
                        name: "📄 Logs",
                        value: logs.length > 0
                          ? logs.join("\n").slice(0, 1024)
                          : "No approved logs"
                      }
                    )
                    .setTimestamp();

                  message.channel.send({
                    embeds: [embed]
                  });
                }

                // 📂 CASE LOOKUP
                if (cmd === "case") {

                  const id = parseInt(args[0]);

                  if (isNaN(id)) {
                    return message.reply("❌ Give case ID");
                  }

                  let found = null;

                  for (const [logId, data] of punishmentLogs.entries()) {

                    if (data.caseId === id) {
                      found = data;
                      break;
                    }
                  }

                  if (!found) {
                    return message.reply("❌ Case not found");
                  }

                  const embed = new EmbedBuilder()
                    .setTitle(`📂 Case #${found.caseId}`)
                    .setColor(0x5865f2)
                    .addFields(
                      {
                        name: "👤 Punished User",
                        value: `<@${found.target}>`,
                        inline: true
                      },
                      {
                        name: "⚠️ Punishment",
                        value: found.type,
                        inline: true
                      },
                      {
                        name: "🛡️ Submitted By",
                        value: `<@${found.moderator}>`,
                        inline: true
                      },
                      {
                        name: "📌 Status",
                        value: found.status || "Pending"
                      },
                      {
                        name: "📝 Reason",
                        value: found.reason || "No reason"
                      },
                      {
                        name: "📎 Proof",
                        value: found.proof || "No proof"
                      }
                    )
                    .setTimestamp();

                  if (found.reviewedBy) {
                    embed.addFields({
                      name: "✅ Reviewed By",
                      value: `<@${found.reviewedBy}>`
                    });
                  }

                  if (found.rejectReason) {
                    embed.addFields({
                      name: "❌ Rejection Reason",
                      value: found.rejectReason
                    });
                  }

                  message.channel.send({
                    embeds: [embed]
                  });
                }

               // 📊 STAFF STATS
               if (cmd === "staffstats") {

                   const user =
                     message.mentions.users.first() || message.author;

                   const targetMember =
                     await message.guild.members.fetch(user.id).catch(() => null);

                   const isBoss =
                     targetMember &&
                     (
                       targetMember.roles.cache.has(ROLES.ultimate) ||
                       targetMember.roles.cache.has(ROLES.owner) ||
                       targetMember.roles.cache.has(ROLES.admin)
                     );

                 const data = staffPoints.get(user.id) || {
                   total: 0,
                   monthly: 0,
                   modlogs: 0,
                   tickets: 0,
                   giveaways: 0,
                   strikes: 0
                 };

                   const modlogLabel = isBoss
                     ? "✅ Modlogs Approved For Staffs"
                     : "✅ Approved Modlogs";

                   const strikeLabel = isBoss
                     ? "⚠️ Strikes Given"
                     : "⚠️ Strikes Received";

                   const embed = new EmbedBuilder()
                     .setTitle("📊 Staff Statistics")
                   .setColor(0x5865f2)
                   .addFields(
                     {
                       name: "👤 Staff",
                       value: `<@${user.id}>`,
                       inline: true
                     },
                     {
                       name: "🏆 Total Points",
                       value: `${data.total}`,
                       inline: true
                     },
                     {
                       name: "🌟 Monthly Points",
                       value: `${data.monthly || 0}`,
                       inline: true
                     },
                     {
                       name: modlogLabel,
                       value: `${data.modlogs}`,
                       inline: true
                     },
                     {
                       name: "🎫 Tickets Closed",
                       value: `${data.tickets}`,
                       inline: true
                     },
                     {
                       name: "🎉 Giveaways Hosted",
                       value: `${data.giveaways}`,
                       inline: true
                     },
                     {
                       name: strikeLabel,
                       value: `${data.strikes}`,
                       inline: true
                     }
                   )
                   .setTimestamp();

                 return message.channel.send({
                   embeds: [embed]
                 });
               }

                // ➕ ADD STAFF POINTS
                if (cmd === "addpoints") {

                  if (!isBypass(message.member)) {
                    return message.reply("❌ Admin only");
                  }

                  const user = message.mentions.users.first();

                  const amount = parseInt(args[1]);

                  const reason = args.slice(2).join(" ") || "No reason provided";

                  if (!user || isNaN(amount)) {
                    return message.reply(
                      "❌ Usage: .addpoints @user <amount> <reason>"
                    );
                  }

                  const data = staffPoints.get(user.id) || {
                    total: 0,
                    monthly: 0,
                    modlogs: 0,
                    tickets: 0,
                    giveaways: 0,
                    strikes: 0
                  };

                  data.total += amount;
                  data.monthly += amount;

                  staffPoints.set(user.id, data);

                  saveData();

                  const embed = new EmbedBuilder()
                    .setTitle("➕ Staff Points Added")
                    .setColor(0x57f287)
                    .addFields(
                      {
                        name: "👤 User",
                        value: `<@${user.id}>`,
                        inline: true
                      },
                      {
                        name: "⭐ Points Added",
                        value: `${amount}`,
                        inline: true
                      },
                      {
                        name: "📝 Reason",
                        value: reason
                      },
                      {
                        name: "👮 Added By",
                        value: `<@${message.author.id}>`
                      }
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 🏆 STAFF LEADERBOARD
                if (cmd === "stafflb") {

                  const sorted = [...staffPoints.entries()]

                  .filter(([userId]) => {

                    const member =
                      message.guild.members.cache.get(userId);

                    if (!member) return false;

                    return (
                      member.roles.cache.has(ROLES.mod) ||
                      member.roles.cache.has(ROLES.headmod)
                    );
                  })

                  .sort((a, b) =>
                    b[1].monthly - a[1].monthly
                  )

                  .slice(0, 10);

                  if (sorted.length === 0) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription("❌ No staff data found");

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  let text = "";

                  sorted.forEach((entry, index) => {

                    const userId = entry[0];
                    const data = entry[1];

                    text +=
                      `**#${index + 1}** • <@${userId}>\n` +
                      `🏆 Monthly: ${data.monthly}\n` +
                      `⭐ Lifetime: ${data.total}\n\n`;
                  });

                  const embed = new EmbedBuilder()
                    .setTitle("🏆 Monthly Staff Leaderboard")
                    .setColor(0xffd700)
                    .setDescription(text)
                    .setFooter({
                      text: "Top performing staff members"
                    })
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 👑 FORCE MOTM
                if (cmd === "motm") {

                  if (!isBypass(message.member)) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription("❌ Admin only");

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  await assignMOTM(message.guild);

                  const embed = new EmbedBuilder()
                    .setColor(0x00c853)
                    .setDescription("✅ Moderator of the month assigned");

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 🚫 GIVEAWAY BLACKLIST
                if (cmd === "gblacklist") {

                  const canBlacklist =

                    message.member.roles.cache.has(ROLES.trial) ||

                    message.member.roles.cache.has(ROLES.mod) ||

                    message.member.roles.cache.has(ROLES.headmod) ||

                    isBypass(message.member);

                  if (!canBlacklist) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Staff only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const user =
                    message.mentions.users.first();

                  if (!user) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Mention a user"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  // ⏳ 1 DAY BLACKLIST
                  const expires =
                    Date.now() + 24 * 60 * 60 * 1000;

                  giveawayBlacklist.set(
                    user.id,
                    expires
                  );
                  // ❌ REMOVE USER FROM ALL GIVEAWAYS
                  for (const [messageId, giveaway] of giveaways.entries()) {

                    if (
                      giveaway.users.includes(user.id)
                    ) {

                      // ❌ remove user
                      giveaway.users =
                        giveaway.users.filter(
                          id => id !== user.id
                        );

                      // 📦 fetch channel
                      const channel =
                        client.channels.cache.get(
                          giveaway.channelId
                        );

                      if (!channel) continue;

                      try {

                        // 📨 fetch giveaway message
                        const msg =
                          await channel.messages.fetch(
                            messageId
                          );

                        // 🔢 live participant count
                        const entries =
                          giveaway.users.length;

                        // 📝 update embed
                        const embed =
                          EmbedBuilder.from(
                            msg.embeds[0]
                          );

                        embed.setFooter({
                          text:
                            `${entries} participants`
                        });

                        // 💾 save updated giveaway
                        giveaways.set(
                          messageId,
                          giveaway
                        );

                        // 🔄 edit giveaway message
                        await msg.edit({
                          embeds: [embed]
                        });

                      } catch (err) {

                        console.log(
                          "Failed to update giveaway:",
                          err
                        );
                      }
                    }
                  }

                  saveData();

                  const embed = new EmbedBuilder()
                    .setColor(0xff3b3b)
                    .setTitle("🚫 Giveaway Blacklist")
                    .setDescription(
                      `<@${user.id}> has been blacklisted from giveaways for 24 Hours`
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // ✅ REMOVE GIVEAWAY BLACKLIST
                if (cmd === "gunblacklist") {

                  const canUnblacklist =

                    message.member.roles.cache.has(
                      ROLES.mod
                    ) ||

                    message.member.roles.cache.has(
                      ROLES.headmod
                    ) ||

                    isBypass(message.member);

                  if (!canUnblacklist) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Mod+ only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const user =
                    message.mentions.users.first();

                  if (!user) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Mention a user"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  giveawayBlacklist.delete(user.id);

                  saveData();

                  const embed = new EmbedBuilder()
                    .setColor(0x00c853)
                    .setTitle("✅ Giveaway Blacklist Removed")
                    .setDescription(
                      `<@${user.id}> can now join giveaways again`
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 📋 GIVEAWAY BLACKLISTS
                if (cmd === "gblacklists") {

                  if (giveawayBlacklist.size === 0) {

                    const embed = new EmbedBuilder()
                      .setColor(0xffcc00)
                      .setDescription(
                        "✅ No blacklisted users"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  let text = "";

                  giveawayBlacklist.forEach(
                    (expire, id) => {

                      const remaining =
                        Math.ceil(
                          (expire - Date.now()) /
                          3600000
                        );

                      text +=
                        `• <@${id}> → ${remaining}h left\n`;
                    }
                  );

                  const embed = new EmbedBuilder()
                    .setTitle("🚫 Giveaway Blacklist")
                    .setColor(0xff3b3b)
                    .setDescription(text)
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 🔁 GIVEAWAY REROLL
                if (cmd === "greroll") {

                  if (level < 2) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway Managers only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const messageId = args[0];

                  if (!messageId) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Provide giveaway message ID"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const g = giveaways.get(messageId);

                  if (!g) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway not found"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const available = g.users.filter(u =>
                    !g.failed.includes(u) &&
                    !g.claimedUsers.includes(u)
                  );

                  if (available.length === 0) {

                    const embed = new EmbedBuilder()
                      .setColor(0xffcc00)
                      .setDescription(
                        "⚠️ No eligible participants left"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const winner =
                    available[
                      Math.floor(Math.random() * available.length)
                    ];

                  g.lastWinner = winner;

                  if (!g.allWinners.includes(winner)) {
                    g.allWinners.push(winner);
                  }

                  saveData();

                  // 📩 DM WINNER
                  const user =
                    await client.users.fetch(winner)
                      .catch(() => null);

                  if (user) {

                    const dmEmbed = new EmbedBuilder()
                      .setTitle("🎉 Giveaway Rerolled")
                      .setColor(0xffcc00)
                      .addFields(
                        {
                          name: "🎁 Prize",
                          value: g.prize || "Prize"
                        },
                        {
                          name: "⏰ Claim Time",
                          value: formatDuration(g.claimTime)
                        }
                      )
                      .setFooter({
                        text: "Go claim your prize in the server"
                      })
                      .setTimestamp();

                    const jumpRow =
                      new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setLabel("🎉 Go To Giveaway")
                          .setStyle(ButtonStyle.Link)
                          .setURL(g.messageUrl)
                      );

                    user.send({
                      embeds: [dmEmbed],
                      components: [jumpRow]
                    }).catch(() => {});
                  }

                  // 🎉 PUBLIC EMBED
                  const embed = new EmbedBuilder()
                    .setTitle("🔁 Giveaway Rerolled")
                    .setColor(0xffcc00)
                    .addFields(
                      {
                        name: "🏆 New Winner",
                        value: `<@${winner}>`,
                        inline: true
                      },
                      {
                        name: "🎁 Prize",
                        value: g.prize || "Prize",
                        inline: true
                      }
                    )
                    .setTimestamp();

                  message.channel.send({
                    embeds: [embed]
                  });

                  startClaim(g, winner, messageId);
                }

                // ⏹️ FORCE END GIVEAWAY
                if (cmd === "gend") {

                  if (level < 2) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway Managers only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const messageId = args[0];

                  if (!messageId) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Provide giveaway message ID"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const g = giveaways.get(messageId);

                  if (!g) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway not found"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  if (g.ended) {

                    const embed = new EmbedBuilder()
                      .setColor(0xffcc00)
                      .setDescription(
                        "⚠️ Giveaway already ended"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }
                  await endGiveaway(messageId, true);

                  const embed = new EmbedBuilder()
                    .setTitle("⏹️ Giveaway Ended")
                    .setColor(0xff3b3b)
                    .setDescription(
                      `Giveaway \`${messageId}\` ended successfully`
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // ⏸️ PAUSE GIVEAWAY
                if (cmd === "gpause") {

                  if (level < 2) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway Managers only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const messageId = args[0];

                  if (!messageId) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Provide giveaway message ID"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const g = giveaways.get(messageId);

                  if (!g) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway not found"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  if (g.paused) {

                    const embed = new EmbedBuilder()
                      .setColor(0xffcc00)
                      .setDescription(
                        "⚠️ Giveaway already paused"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  if (!g.endAt) {
                    g.endAt = Date.now() + parseTime(g.durationInput || "1m");
                  }

                  g.remainingTime = Math.max(1000, g.endAt - Date.now());
                  g.paused = true;

                  saveData();

                  const msg =
                    await g.channel.messages.fetch(messageId)
                      .catch(() => null);

                  if (msg) {

                    const button =
                      new ButtonBuilder()
                        .setCustomId("giveaway_enter")
                        .setLabel("⏸️ Paused")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    const row =
                      new ActionRowBuilder().addComponents(button);

                    await msg.edit({
                      embeds: [buildGiveawayEmbed(g)],
                      components: [row]
                    }).catch(() => {});
                  }

                  const embed = new EmbedBuilder()
                    .setTitle("⏸️ Giveaway Paused")
                    .setColor(0xffcc00)
                    .setDescription(
                      `Giveaway \`${messageId}\` paused`
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // ▶️ RESUME GIVEAWAY
                if (cmd === "gresume") {

                  if (level < 2) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway Managers only"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const messageId = args[0];

                  if (!messageId) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Provide giveaway message ID"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const g = giveaways.get(messageId);

                  if (!g) {

                    const embed = new EmbedBuilder()
                      .setColor(0xff3b3b)
                      .setDescription(
                        "❌ Giveaway not found"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  if (!g.paused) {

                    const embed = new EmbedBuilder()
                      .setColor(0xffcc00)
                      .setDescription(
                        "⚠️ Giveaway is not paused"
                      );

                    return message.channel.send({
                      embeds: [embed]
                    });
                  }

                  const remainingTime = Math.max(1000, g.remainingTime || 60000);
                  g.endAt = Date.now() + remainingTime;
                  g.remainingTime = null;
                  g.paused = false;

                  setTimeout(() => endGiveaway(messageId), remainingTime);

                  saveData();

                  const msg =
                    await g.channel.messages.fetch(messageId)
                      .catch(() => null);

                  if (msg) {

                    const entryCount = g.users ? g.users.length : 0;

                    const button =
                      new ButtonBuilder()
                        .setCustomId("enter")
                        .setEmoji("🎉")
                        .setLabel(`${entryCount}`)
                        .setStyle(ButtonStyle.Primary);

                    const participantsButton =
                      new ButtonBuilder()
                        .setCustomId("participants")
                        .setEmoji("👥")
                        .setLabel("Participants")
                        .setStyle(ButtonStyle.Secondary);

                    const row =
                      new ActionRowBuilder().addComponents(
                        button,
                        participantsButton
                      );

                    await msg.edit({
                      embeds: [buildGiveawayEmbed(g)],
                      components: [row]
                    }).catch(() => {});
                  }

                  const embed = new EmbedBuilder()
                    .setTitle("▶️ Giveaway Resumed")
                    .setColor(0x00c853)
                    .setDescription(
                      `Giveaway \`${messageId}\` resumed`
                    )
                    .setTimestamp();

                  return message.channel.send({
                    embeds: [embed]
                  });
                }

                // 🔥 VIEW STRIKES
                if (cmd === "strikes") {

                  const user = message.mentions.users.first();
                  if (!user) return message.reply("❌ Mention user");

                  const userStrikes = strikes.get(user.id) || [];

                  if (userStrikes.length === 0) {
                    return message.reply("✅ No strikes");
                  }

                  let text = `⚠️ Strikes for <@${user.id}>:\n\n`;

                  userStrikes.forEach((s, i) => {
                    text += `${i + 1}. ${s.reason} (by <@${s.by}>)\n`;
                  });

                  message.channel.send(text);
                }


                // 🔥 CLEAR STRIKES
                if (cmd === "clearstrikes") {

                  const user = message.mentions.users.first();
                  if (!user) return message.reply("❌ Mention user");

                  const member = message.member;

                  if (!isBypass(member)) {
                    return message.reply("❌ Only admins can clear strikes");
                  }

                  strikes.delete(user.id);

                  saveData();

                  message.channel.send(`✅ Cleared strikes for <@${user.id}>`);
                }
              });


              // BUTTON HANDLER
                client.on("interactionCreate", async (interaction) => {
                  if (!interaction.guild) {
                    if (interaction.isRepliable()) {
                      return interaction.reply({
                        content: "❌ Lunar commands can only be used inside the server.",
                        ephemeral: true
                      }).catch(() => {});
                    }

                    return;
                  }
                  // allow slash + buttons + modals
                  if (
                    !interaction.isButton() &&
                    !interaction.isModalSubmit() &&
                    !interaction.isChatInputCommand() &&
                    !interaction.isStringSelectMenu()
                  ) return;
                  // 🔐 GLOBAL SLASH COMMAND PERMISSION GUARD
                  if (interaction.isChatInputCommand()) {
                    const commandName = interaction.commandName;
                    const subcommandName = interaction.options?.getSubcommand(false);

                    const isPublicStaffProfile =
                      commandName === "staff" &&
                      subcommandName === "profile";

                    const isPublicStaffRate =
                      commandName === "staff" &&
                      subcommandName === "rate";

                    const isPublicCommand =
                      commandName === "help" ||
                      commandName === "profile" ||
                      isPublicStaffProfile ||
                      isPublicStaffRate;

                    const level = getUserLevel(interaction.member);

                    const level4OnlyCommands = ["health"];

                    const isLevel4Only =
                      level4OnlyCommands.includes(commandName) ||
                      (
                        commandName === "staff" &&
                        ["resetmonth", "weeklyreport"].includes(subcommandName)
                      ) ||
                    (
                      commandName === "giveaway" &&
                      subcommandName === "removeuser"
                    );

                    if (isLevel4Only && level < 4) {
                      return interaction.reply({
                        content: "❌ Level 4 only.",
                        ephemeral: true
                      });
                    }

                    if (!isPublicCommand && level < 1) {
                      return interaction.reply({
                        content: "❌ You do not have permission to use this command.",
                        ephemeral: true
                      });
                    }
                  }
                  // 📚 CASES PAGINATION
                  if (
                    interaction.isButton() &&
                    interaction.customId.startsWith("cases_")
                  ) {
                    const parts = interaction.customId.split("_");
                    const action = parts[1];
                    const currentPage = Number(parts[2]);
                    const viewerId = parts[3];
                    const filterUserId = parts[4] === "all" ? null : parts[4];

                    if (interaction.user.id !== viewerId) {
                      return interaction.reply({
                        content: "❌ This case panel is not yours.",
                        ephemeral: true
                      });
                    }

                    const cases = getCases(filterUserId);

                    let nextPage = currentPage;
                    if (action === "next") nextPage++;
                    if (action === "prev") nextPage--;

                    const totalPages = Math.max(1, Math.ceil(cases.length / 3));
                    nextPage = Math.max(0, Math.min(nextPage, totalPages - 1));

                    return interaction.update({
                      embeds: [buildCasesEmbed(cases, nextPage, filterUserId)],
                      components: [
                        buildCasesButtons(
                          nextPage,
                          cases.length,
                          interaction.user.id,
                          filterUserId || "all"
                        )
                      ]
                    });
                  }
                  // 🌙 HELP MENU - keep this near top so Discord gets fast response
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "help"
                  ) {
                    await interaction.deferReply({ ephemeral: true });

                    const level = getUserLevel(interaction.member);

                    const embed = new EmbedBuilder()
                      .setTitle("🌙 Lunar Help Menu")
                      .setColor(0x5865f2)
                      .setDescription(
                        `Select a category from the dropdown below.\n\n` +
                        `Your access level: **${level}**`
                      )
                      .setFooter({ text: "Lunar Help System" })
                      .setTimestamp();

                    return interaction.editReply({
                      embeds: [embed],
                      components: [buildHelpMenu(level), buildHelpActionRow()]
                    });
                  }

                  // 📚 CASES LIST
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "cases"
                  ) {
                    const filterUser = interaction.options.getUser("user");
                    const filterUserId = filterUser ? filterUser.id : null;

                    const cases = getCases(filterUserId);
                    const page = 0;

                    const embed = buildCasesEmbed(cases, page, filterUserId);
                    const row = buildCasesButtons(
                      page,
                      cases.length,
                      interaction.user.id,
                      filterUserId || "all"
                    );

                    return interaction.reply({
                      embeds: [embed],
                      components: [row],
                      ephemeral: true
                    });
                  }
                  // 👤 MEMBER PROFILE
                    if (
                      interaction.isChatInputCommand() &&
                      interaction.commandName === "profile"
                    ) {
                      await interaction.deferReply();

                      const user = interaction.options.getUser("user") || interaction.user;

                    const member =
                      await interaction.guild.members.fetch(user.id).catch(() => null);

                  if (!member) {
                    return interaction.editReply({
                      content: "❌ Member not found in this server."
                    });
                  }

                    const stats = messageStats.get(user.id) || {
                      daily: 0,
                      weekly: 0,
                      monthly: 0,
                      total: 0
                    };

                    const totalMessages =
                      stats.total ||
                      (stats.daily || 0) +
                      (stats.weekly || 0) +
                      (stats.monthly || 0);

                    const sortedMessages = [...messageStats.entries()]
                      .map(([id, data]) => {
                        const total =
                          data.total ||
                          (data.daily || 0) +
                          (data.weekly || 0) +
                          (data.monthly || 0);

                        return [id, total];
                      })
                      .filter(([, total]) => total > 0)
                      .sort((a, b) => b[1] - a[1]);

                    const rankIndex = sortedMessages.findIndex(([id]) => id === user.id);
                    const messageRank = rankIndex === -1 ? "Unranked" : `#${rankIndex + 1}`;

                    const roles = member.roles.cache
                      .filter(role => role.id !== interaction.guild.id)
                      .sort((a, b) => b.position - a.position)
                      .map(role => `<@&${role.id}>`)
                      .slice(0, 10);

                  let roleText =
                    roles.length > 0
                      ? roles.join(" ")
                      : "No roles";

                  if (roleText.length > 1000) {
                    roleText = roleText.slice(0, 1000) + "...";
                  }

                    const joinedAt = member.joinedTimestamp
                      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
                      : "Unknown";

                    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;

                    const embed = new EmbedBuilder()
                      .setTitle("👤 Member Profile")
                      .setColor(0x5865f2)
                      .setThumbnail(user.displayAvatarURL({ size: 256 }))
                      .addFields(
                        {
                          name: "User",
                          value: `<@${user.id}>`,
                          inline: true
                        },
                        {
                          name: "Joined Server",
                          value: joinedAt,
                          inline: true
                        },
                        {
                          name: "Account Created",
                          value: createdAt,
                          inline: true
                        },
                        {
                          name: "Message Rank",
                          value: messageRank,
                          inline: true
                        },
                        {
                          name: "Total Messages",
                          value: `${totalMessages}`,
                          inline: true
                        },
                        {
                          name: "Daily / Weekly / Monthly",
                          value: `${stats.daily || 0} / ${stats.weekly || 0} / ${stats.monthly || 0}`,
                          inline: true
                        },
                        {
                          name: `Roles (${member.roles.cache.size - 1})`,
                          value: roleText,
                          inline: false
                        }
                      )
                      .setFooter({
                        text: `User ID: ${user.id}`
                      })
                      .setTimestamp();

                  return interaction.editReply({
                    embeds: [embed]
                  });
                  }
                  
                          // 🔥 SLASH GSTART
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "gstart"
                  ) {

                    const durationInput =
                      interaction.options.getString("duration");

                    const claimInput =
                      interaction.options.getString("claim");

                    const prize =
                      interaction.options.getString("prize");
                    const sponsor = interaction.options.getUser("sponsor");

                    const duration = parseTime(durationInput);
                    const claimTime = parseTime(claimInput);

                    const row = new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setCustomId("enter")
                        .setLabel("🎉 Enter")
                        .setStyle(ButtonStyle.Primary)
                    );

                      const embed = new EmbedBuilder()
                      .setTitle("🎉 Giveaway Started")
                      .setDescription(`## 🎁 ${prize}`)
                      .setColor(0xff4d6d)
                      .addFields(
                        {
                          name: "⏰ Duration",
                          value: durationInput,
                          inline: true
                        },
                        {
                          name: "👑 Hosted By",
                          value: `<@${interaction.user.id}>`,
                          inline: true
                        },...(sponsor
                          ? [{
                              name: "🎖️ Sponsored By",
                              value: `<@${sponsor.id}>`,
                              inline: true
                            }]
                          : []),
                        {
                          name: "🎟️ Entries",
                          value: "0",
                          inline: true
                        },

                      )
                      .setFooter({
                        text: "Click the button below to enter"
                      })
                      .setTimestamp();

                    const msg = await interaction.channel.send({
                      embeds: [embed],
                      components: [row]
                    });

                    giveaways.set(msg.id, {
                      users: [],
                      entryMap: {},
                      claimTime,
                      endAt: Date.now() + duration,
                      prize,
                      requiredDaily: 0,
                      requiredWeekly: 0,
                      requiredMonthly: 0,
                      channel: interaction.channel,
                      ended: false,
                      lastWinner: null,
                      failed: [],
                      host: interaction.user.id,
                      sponsor: sponsor ? sponsor.id : null,
                      messageUrl: msg.url
                    });

                    saveData();

                    setTimeout(() => endGiveaway(msg.id), duration);

                    await interaction.reply({
                      content: "✅ Giveaway started",
                      ephemeral: true
                    });
                  }

                  // 🔥 SLASH STRIKE
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "strike"
                  ) {
                    const user = interaction.options.getUser("user");
                    const reason = interaction.options.getString("reason") || "No reason";

                    const targetMember = interaction.guild.members.cache.get(user.id);

                    if (!targetMember) {
                      return interaction.reply({
                        content: "❌ User not found",
                        ephemeral: true
                      });
                    }

                    const level = getUserLevel(interaction.member);

                    if (level < 2 && !isBypass(interaction.member)) {
                      return interaction.reply({
                        content: "❌ Head Mod/Admin only.",
                        ephemeral: true
                      });
                    }

                    const isTargetStaff =
                      targetMember.roles.cache.has(ROLES.trial) ||
                      targetMember.roles.cache.has(ROLES.mod) ||
                      targetMember.roles.cache.has(ROLES.headmod);

                    if (!isTargetStaff) {
                      return interaction.reply({
                        content: "❌ We can only strike staff members.",
                        ephemeral: true
                      });
                    }

                    if (isBypass(targetMember)) {
                      return interaction.reply({
                        content: "❌ You cannot strike boss roles.",
                        ephemeral: true
                      });
                    }

                    const current = strikes.get(user.id) || [];
                    const strikeId = current.length + 1;

                    current.push({
                      id: strikeId,
                      reason,
                      by: interaction.user.id,
                      time: Date.now()
                    });

                    strikes.set(user.id, current);
                    saveData();
                    addPoints(interaction.user.id, "strike");

                    await alertFiveStrikes(
                      interaction.guild,
                      user.id,
                      current,
                      reason,
                      interaction.user.id
                    );

                    const embed = new EmbedBuilder()
                      .setTitle("⚠️ Strike Added")
                      .setColor(0xff3b3b)
                      .addFields(
                        {
                          name: "Staff",
                          value: `<@${user.id}>`,
                          inline: true
                        },
                        {
                          name: "Strike",
                          value: `#${strikeId}`,
                          inline: true
                        },
                        {
                          name: "Reason",
                          value: reason,
                          inline: false
                        },
                        {
                          name: "Given By",
                          value: `<@${interaction.user.id}>`,
                          inline: true
                        }
                      )
                      .setTimestamp();

                    const logChannel = interaction.guild.channels.cache.get(CHANNELS.strikeLogs);
                    if (logChannel) {
                      logChannel.send({ embeds: [embed] }).catch(() => null);
                    }

                    return interaction.reply({
                      embeds: [embed],
                      ephemeral: true
                    });
                  }

                    // ➕ SLASH ADDPOINTS
                    if (
                      interaction.isChatInputCommand() &&
                      interaction.commandName === "addpoints"
                    ) {

                      if (!isBypass(interaction.member)) {

                        return interaction.reply({
                          content: "❌ Admin only",
                          ephemeral: true
                        });
                      }

                      const user =
                        interaction.options.getUser("user");

                      const amount =
                        interaction.options.getInteger("amount");

                      const reason =
                        interaction.options.getString("reason")
                        || "No reason provided";

                      const member =
                        interaction.guild.members.cache.get(user.id);

                      if (!member) {

                        return interaction.reply({
                          content: "❌ User not found",
                          ephemeral: true
                        });
                      }

                      // ✅ ONLY STAFF
                      const isStaff =
                        member.roles.cache.has(ROLES.trial) ||
                        member.roles.cache.has(ROLES.mod) ||
                        member.roles.cache.has(ROLES.headmod);

                      if (!isStaff) {

                        return interaction.reply({
                          content:
                            "❌ User is not staff",
                          ephemeral: true
                        });
                      }

                      const data =
                        staffPoints.get(user.id) || {

                          total: 0,
                          monthly: 0,
                          modlogs: 0,
                          tickets: 0,
                          giveaways: 0,
                          strikes: 0
                        };

                      data.total += amount;
                      data.monthly += amount;

                      staffPoints.set(user.id, data);

                      saveData();

                      const embed =
                        new EmbedBuilder()
                          .setTitle("➕ Staff Points Added")
                          .setColor(0x57f287)
                          .addFields(
                            {
                              name: "👤 User",
                              value: `<@${user.id}>`,
                              inline: true
                            },
                            {
                              name: "⭐ Points",
                              value: `${amount}`,
                              inline: true
                            },
                            {
                              name: "📝 Reason",
                              value: reason
                            }
                          )
                          .setTimestamp();
                          return interaction.reply({
                            embeds: [embed]
                          });
                          }

                          // 🎛️ PREMIUM GIVEAWAY EDIT PANEL
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "giveaway" &&
                    interaction.options.getSubcommand() === "edit"
                  ) {
                    if (!isStaffMember(interaction.member)) {
                      return interaction.reply({
                        content: "❌ Staff only. Trial Mod, Mod, Head Mod, Admin, Owner, or Ultimate can edit giveaways.",
                        ephemeral: true
                      });
                    }

                    const messageId = interaction.options.getString("messageid");
                    const g = giveaways.get(messageId);

                    if (!g) {
                      return interaction.reply({
                        content: "❌ Giveaway not found.",
                        ephemeral: true
                      });
                    }

                    if (g.ended) {
                      return interaction.reply({
                        content: "❌ This giveaway already ended.",
                        ephemeral: true
                      });
                    }

                    const expiresAt = Date.now() + 5 * 60 * 1000;

                    const embed = new EmbedBuilder()
                      .setTitle("🎛️ Giveaway Edit Panel")
                      .setColor(0x9b59ff)
                      .setDescription(
                        `Editing giveaway: \`${messageId}\`\n\n` +
                        `🎁 **Prize:** ${g.prize || "Prize"}\n` +
                        `👑 **Winners:** ${g.winnerCount || 1}\n` +
                        `⏳ **Claim Time:** ${formatDuration(g.claimTime || 30000)}\n` +
                        `🌅 **Daily:** ${g.requiredDaily || 0}\n` +
                        `📅 **Weekly:** ${g.requiredWeekly || 0}\n` +
                        `🗓️ **Monthly:** ${g.requiredMonthly || 0}\n` +
                        `🎭 **Required Role:** ${g.requiredRole && g.requiredRole !== "none" ? `<@&${g.requiredRole}>` : "None"}\n\n` +
                        `This panel expires <t:${Math.floor(expiresAt / 1000)}:R>.`
                      )
                      .setFooter({
                        text: "Choose what you want to edit from the menu below"
                      })
                      .setTimestamp();

                    const menu = new StringSelectMenuBuilder()
                      .setCustomId(`gwy_edit_select_${messageId}_${expiresAt}`)
                      .setPlaceholder("Select giveaway setting to edit")
                      .addOptions(
                        {
                          label: "Prize",
                          value: "prize",
                          description: "Change giveaway prize",
                          emoji: "🎁"
                        },
                        {
                          label: "Winners",
                          value: "winners",
                          description: "Change winner count",
                          emoji: "👑"
                        },
                        {
                          label: "Duration",
                          value: "duration",
                          description: "Change ending time from now",
                          emoji: "⏰"
                        },
                        {
                          label: "Claim Time",
                          value: "claimtime",
                          description: "Change claim time in seconds",
                          emoji: "🎟️"
                        },
                        {
                          label: "Daily Requirement",
                          value: "daily",
                          description: "Change required daily messages",
                          emoji: "🌅"
                        },
                        {
                          label: "Weekly Requirement",
                          value: "weekly",
                          description: "Change required weekly messages",
                          emoji: "📅"
                        },
                        {
                          label: "Monthly Requirement",
                          value: "monthly",
                          description: "Change required monthly messages",
                          emoji: "🗓️"
                        },
                        {
                          label: "Required Role",
                          value: "requiredrole",
                          description: "Change required role ID or none",
                          emoji: "🎭"
                        },
                        {
                          label: "Host",
                          value: "host",
                          description: "Change host user ID",
                          emoji: "👤"
                        }
                      );

                    const row = new ActionRowBuilder().addComponents(menu);

                    return interaction.reply({
                      embeds: [embed],
                      components: [row],
                      ephemeral: true
                    });
                  }
                  // 📘 HELP ACTION BUTTONS
                  if (
                    interaction.isButton() &&
                    ["help_all", "help_report"].includes(interaction.customId)
                  ) {
                    const level = getUserLevel(interaction.member);

                    if (interaction.customId === "help_all") {
                      return interaction.update({
                        embeds: [buildHelpEmbed(level)],
                        components: [buildHelpMenu(level), buildHelpActionRow()]
                      });
                    }

                    if (interaction.customId === "help_report") {
                      return interaction.reply({
                        content:
                          "🚨 Please report the issue to server staff with screenshots and command name.",
                        ephemeral: true
                      });
                    }
                  }
                  // 📘 HELP CATEGORY DROPDOWN
                  if (
                    interaction.isStringSelectMenu() &&
                    interaction.customId === "help_category"
                  ) {
                    const level = getUserLevel(interaction.member);
                    const category = interaction.values[0];

                    return interaction.update({
                      embeds: [buildHelpCategoryEmbed(category, level)],
                      components: [buildHelpMenu(level), buildHelpActionRow()]
                    });
                  }
                  // 🎛️ GIVEAWAY EDIT DROPDOWN
                  if (
                    interaction.isStringSelectMenu() &&
                    interaction.customId.startsWith("gwy_edit_select_")
                  ) {
                    const parts = interaction.customId.split("_");
                    const messageId = parts[3];
                    const expiresAt = Number(parts[4]);
                    if (!isStaffMember(interaction.member)) {
                      return interaction.reply({
                        content: "❌ Staff only.",
                        ephemeral: true
                      });
                    }

                    if (Date.now() > expiresAt) {
                      return interaction.update({
                        content: "⏰ This giveaway edit panel expired. Run `/giveaway edit` again.",
                        embeds: [],
                        components: []
                      });
                    }

                    const field = interaction.values[0];
                    const labels = {
                      prize: "Prize",
                      winners: "Winners",
                      duration: "Duration",
                      claimtime: "Claim Time",
                      daily: "Daily Requirement",
                      weekly: "Weekly Requirement",
                      monthly: "Monthly Requirement",
                      requiredrole: "Required Role",
                      host: "Host"
                    };

                    const modal = new ModalBuilder()
                      .setCustomId(`gwy_edit_modal_${messageId}_${field}_${expiresAt}`)
                      .setTitle(`Edit ${labels[field]}`);

                    const input = new TextInputBuilder()
                      .setCustomId("value")
                      .setLabel(`New ${labels[field]}`)
                      .setStyle(TextInputStyle.Short)
                      .setRequired(true);

                    if (field === "duration") {
                      input.setPlaceholder("Example: 10m, 1h, 30s");
                    } else if (field === "claimtime") {
                      input.setPlaceholder("Example: 30s, 2m, 1h");
                    } else if (field === "requiredrole") {
                      input.setPlaceholder("Role ID or none");
                    } else if (field === "host") {
                      input.setPlaceholder("User ID");
                    } else if (["winners", "daily", "weekly", "monthly"].includes(field)) {
                      input.setPlaceholder("Number only");
                    } else {
                      input.setPlaceholder("Enter new value");
                    }

                    const row = new ActionRowBuilder().addComponents(input);

                    modal.addComponents(row);

                    return interaction.showModal(modal);
                  }
                  // 🎉 GIVEAWAY REMOVE USER
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "giveaway" &&
                    interaction.options.getSubcommand() === "removeuser"
                  ) {
                    const level = getUserLevel(interaction.member);

                    if (level < 2) {
                      return interaction.reply({
                        content: "❌ Giveaway Managers only.",
                        ephemeral: true
                      });
                    }

                    const messageId = interaction.options.getString("messageid");
                    const user = interaction.options.getUser("user");
                    const g = giveaways.get(messageId);

                    if (!g) {
                      return interaction.reply({
                        content: "❌ Giveaway not found.",
                        ephemeral: true
                      });
                    }

                    if (!g.users || !g.users.includes(user.id)) {
                      return interaction.reply({
                        content: "❌ User is not in this giveaway.",
                        ephemeral: true
                      });
                    }

                    g.users = g.users.filter(id => id !== user.id);

                    if (g.entryMap) {
                      delete g.entryMap[user.id];
                    }

                      giveaways.set(messageId, g);
                      saveData();

                      await sendGiveawayAuditLog(
                        interaction.guild,
                        "removed",
                        messageId,
                        g,
                        interaction.user,
                        { summary: `Removed <@${user.id}> from the giveaway.` }
                      );

                      return interaction.reply({
                      content: `✅ Removed <@${user.id}> from giveaway \`${messageId}\`.`,
                      ephemeral: true
                    });
                  }

                  // ⭐ STAFF RATING
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "staff" &&
                    interaction.options.getSubcommand() === "rate"
                  ) {
                    const user = interaction.options.getUser("user");
                    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

                    if (!member || !isStaffMember(member)) {
                      return interaction.reply({
                        content: "❌ You can only rate staff members.",
                        ephemeral: true
                      });
                    }

                    if (user.id === interaction.user.id) {
                      return interaction.reply({
                        content: "❌ You cannot rate yourself.",
                        ephemeral: true
                      });
                    }

                    const today = getTodayKey();

                    const ratingData = staffRatings.get(user.id) || {
                      total: 0,
                      daily: {}
                    };

                    if (!ratingData.daily[today]) {
                      ratingData.daily[today] = [];
                    }

                    if (ratingData.daily[today].includes(interaction.user.id)) {
                      return interaction.reply({
                        content: "❌ You already rated this staff member today. Try again tomorrow.",
                        ephemeral: true
                      });
                    }

                    ratingData.total += 1;
                    ratingData.daily[today].push(interaction.user.id);

                    staffRatings.set(user.id, ratingData);
                    saveData();

                    const embed = new EmbedBuilder()
                      .setTitle("⭐ Staff Rated")
                      .setColor(0x57f287)
                      .setDescription(`<@${interaction.user.id}> gave **+1 rating** to <@${user.id}>.`)
                      .addFields(
                        {
                          name: "Total Community Rating",
                          value: `${ratingData.total}`,
                          inline: true
                        },
                        {
                          name: "Today",
                          value: `${ratingData.daily[today].length} rating(s)`,
                          inline: true
                        }
                      )
                      .setFooter({ text: "You can rate the same staff once per day" })
                      .setTimestamp();

                    return interaction.reply({
                      embeds: [embed]
                    });
                  }

                  // 👤 STAFF PROFILE
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "staff" &&
                    interaction.options.getSubcommand() === "profile"
                  ) {
                    const user = interaction.options.getUser("user") || interaction.user;
                    const member =
                      interaction.guild.members.cache.get(user.id);
                    const isStaffProfile =
                      member &&
                      (
                        member.roles.cache.has(ROLES.trial) ||
                        member.roles.cache.has(ROLES.mod) ||
                        member.roles.cache.has(ROLES.headmod) ||
                        member.roles.cache.has(ROLES.admin) ||
                        member.roles.cache.has(ROLES.owner) ||
                        member.roles.cache.has(ROLES.ultimate)
                      );

                    if (!isStaffProfile) {
                      return interaction.reply({
                        content: "❌ This user is not a staff member.",
                        ephemeral: true
                      });
                    }

                    const data = staffPoints.get(user.id) || {
                      total: 0,
                      monthly: 0,
                      modlogs: 0,
                      tickets: 0,
                      giveaways: 0,
                      strikes: 0
                    };

                      const activeStrikes = strikes.get(user.id) || [];
                    const communityRating = staffRatings.get(user.id) || {
                      total: 0,
                      daily: {}
                    };

                      let roleType = "Staff";

                      if (member.roles.cache.has(ROLES.ultimate)) roleType = "Ultimate";
                      else if (member.roles.cache.has(ROLES.owner)) roleType = "Owner";
                      else if (member.roles.cache.has(ROLES.admin)) roleType = "Admin";
                      else if (member.roles.cache.has(ROLES.headmod)) roleType = "Head Mod";
                      else if (member.roles.cache.has(ROLES.mod)) roleType = "Moderator";
                      else if (member.roles.cache.has(ROLES.trial)) roleType = "Trial Mod";

                      const isBossProfile =
                        member.roles.cache.has(ROLES.ultimate) ||
                        member.roles.cache.has(ROLES.owner) ||
                        member.roles.cache.has(ROLES.admin);

                      const strikeProfileField = isBossProfile
                        ? {
                            name: "⚠️ Strikes Given",
                            value: `${data.strikes || 0}`,
                            inline: true
                          }
                        : {
                            name: "⚠️ Active Strikes",
                            value: `${activeStrikes.length}`,
                            inline: true
                          };

                      const ratingScore =
                        (data.monthly || 0) +
                        ((data.modlogs || 0) * 5) +
                        ((data.tickets || 0) * 3) +
                        ((data.giveaways || 0) * 2) -
                        (isBossProfile ? 0 : activeStrikes.length * 10);

                      let rating = "⭐ Rookie";

                      if (ratingScore >= 250) rating = "🌟 Elite";
                      else if (ratingScore >= 150) rating = "💎 Excellent";
                      else if (ratingScore >= 75) rating = "🔥 Active";
                        else if (ratingScore >= 25) rating = "✅ Good";

                        const embed = new EmbedBuilder()
                          .setTitle("✨ Staff Profile")
                      .setColor(0x5865f2)
                      .setThumbnail(user.displayAvatarURL())
                      .addFields(
                        {
                          name: "👤 Staff",
                          value: `<@${user.id}>`,
                          inline: true
                        },
                        {
                          name: "🛡️ Role Type",
                          value: roleType,
                          inline: true
                        },
                        {
                          name: "🏆 Lifetime Points",
                          value: `${data.total}`,
                          inline: true
                        },
                        {
                          name: "🌟 Monthly Points",
                          value: `${data.monthly || 0}`,
                          inline: true
                        },
                        {
                          name: isBossProfile
                            ? "✅ Modlogs Approved For Staffs"
                            : "✅ Approved Modlogs",
                          value: `${data.modlogs}`,
                          inline: true
                        },
                        {
                          name: "🎫 Tickets",
                          value: `${data.tickets}`,
                          inline: true
                        },
                        {
                          name: "🎉 Giveaways",
                          value: `${data.giveaways}`,
                          inline: true
                        },
                        strikeProfileField,
                        {
                          name: "⭐ Staff Rating",
                          value: rating,
                          inline: true
                        },
                        {
                          name: "🌟 Community Rating",
                          value: `${communityRating.total || 0}`,
                          inline: true
                        }
                      )
                      .setFooter({
                        text: "Lunar Staff System"
                      })
                      .setTimestamp();

                    return interaction.reply({
                      embeds: [embed]
                    });
                  }

                  // 🔄 STAFF RESET MONTH
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "staff" &&
                    interaction.options.getSubcommand() === "resetmonth"
                  ) {
                    if (!isBypass(interaction.member)) {
                      return interaction.reply({
                        content: "❌ Level 4 only.",
                        ephemeral: true
                      });
                    }

                    const confirm = interaction.options.getBoolean("confirm");

                    if (!confirm) {
                      return interaction.reply({
                        content: "❌ Set confirm:true to reset monthly points.",
                        ephemeral: true
                      });
                    }

                    for (const [id, data] of staffPoints.entries()) {
                      data.monthly = 0;
                      staffPoints.set(id, data);
                    }

                    saveData();

                    return interaction.reply({
                      content: "✅ Monthly staff points reset.",
                      ephemeral: true
                    });
                  }
                  // 📊 STAFF WEEKLY REPORT
                      if (
                        interaction.isChatInputCommand() &&
                        interaction.commandName === "staff" &&
                        interaction.options.getSubcommand() === "weeklyreport"
                      ) {
                        if (!interaction.deferred && !interaction.replied) {
                          try {
                            await interaction.deferReply({ ephemeral: true });
                          } catch (err) {
                            if (err.code !== 40060) throw err;
                          }
                        }

                        if (!isBypass(interaction.member)) {
                          return interaction.editReply({
                            content: "❌ Level 4 only."
                          });
                    }

                    await interaction.guild.members.fetch();

                    const staffMembers = interaction.guild.members.cache.filter(member =>
                      member.roles.cache.has(ROLES.trial) ||
                      member.roles.cache.has(ROLES.mod) ||
                      member.roles.cache.has(ROLES.headmod)
                    );

                    const trackedStaff = [...staffMembers.values()].map(member => {
                      const data = staffPoints.get(member.id) || {
                        total: 0,
                        monthly: 0,
                        modlogs: 0,
                        tickets: 0,
                        giveaways: 0,
                        strikes: 0
                      };

                      return {
                        member,
                        data
                      };
                    });

                    const topMonthly = trackedStaff
                      .filter(entry => (entry.data.monthly || 0) > 0)
                      .sort((a, b) => (b.data.monthly || 0) - (a.data.monthly || 0))
                      .slice(0, 5)
                      .map((entry, index) =>
                        `**#${index + 1}** <@${entry.member.id}> — ${entry.data.monthly || 0} pts`
                      )
                      .join("\n") || "No monthly activity yet.";

                    const topModlogs = trackedStaff
                      .filter(entry => (entry.data.modlogs || 0) > 0)
                      .sort((a, b) => (b.data.modlogs || 0) - (a.data.modlogs || 0))
                      .slice(0, 5)
                      .map((entry, index) =>
                        `**#${index + 1}** <@${entry.member.id}> — ${entry.data.modlogs || 0} modlogs`
                      )
                      .join("\n") || "No modlogs yet.";

                    const topTickets = trackedStaff
                      .filter(entry => (entry.data.tickets || 0) > 0)
                      .sort((a, b) => (b.data.tickets || 0) - (a.data.tickets || 0))
                      .slice(0, 5)
                      .map((entry, index) =>
                        `**#${index + 1}** <@${entry.member.id}> — ${entry.data.tickets || 0} tickets`
                      )
                      .join("\n") || "No tickets closed yet.";

                    const topGiveaways = trackedStaff
                      .filter(entry => (entry.data.giveaways || 0) > 0)
                      .sort((a, b) => (b.data.giveaways || 0) - (a.data.giveaways || 0))
                      .slice(0, 5)
                      .map((entry, index) =>
                        `**#${index + 1}** <@${entry.member.id}> — ${entry.data.giveaways || 0} giveaways`
                      )
                      .join("\n") || "No giveaways hosted yet.";

                    const inactiveStaff = trackedStaff
                      .filter(entry => (entry.data.monthly || 0) === 0)
                      .slice(0, 15)
                      .map(entry => `<@${entry.member.id}>`)
                      .join(", ") || "No inactive staff.";

                    const totalMonthly = trackedStaff.reduce(
                      (sum, entry) => sum + (entry.data.monthly || 0),
                      0
                    );

                    const embed = new EmbedBuilder()
                      .setTitle("📊 Weekly Staff Activity Report")
                      .setColor(0x5865f2)
                      .setDescription(
                        `Tracked Staff: **${trackedStaff.length}**\n` +
                        `Total Monthly Points: **${totalMonthly}**`
                      )
                      .addFields(
                        {
                          name: "🏆 Top Monthly Points",
                          value: topMonthly,
                          inline: false
                        },
                        {
                          name: "✅ Top Modlogs",
                          value: topModlogs,
                          inline: false
                        },
                        {
                          name: "🎫 Top Tickets",
                          value: topTickets,
                          inline: false
                        },
                        {
                          name: "🎉 Top Giveaways",
                          value: topGiveaways,
                          inline: false
                        },
                        {
                          name: "💤 Inactive Staff",
                          value: inactiveStaff,
                          inline: false
                        }
                      )
                      .setFooter({
                        text: "Inactive = 0 monthly points"
                      })
                      .setTimestamp();

                        return interaction.editReply({
                          embeds: [embed]
                        });
                  }
                  // 🩺 HEALTH CHECK
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "health"
                  ) {
                    await interaction.deferReply({ ephemeral: true });

                    const me =
                      interaction.guild.members.me ||
                      await interaction.guild.members.fetchMe().catch(() => null);

                    if (!me) {
                      return interaction.editReply({
                        content: "❌ Could not fetch bot member data."
                      });
                    }

                    const checks = [
                      `Guild Members Intent: ✅`,
                      `Manage Roles: ${me.permissions.has(PermissionsBitField.Flags.ManageRoles) ? "✅" : "❌"}`,
                      `View Audit Log: ${me.permissions.has(PermissionsBitField.Flags.ViewAuditLog) ? "✅" : "❌"}`,
                      `Admin Logs Channel: ${interaction.guild.channels.cache.has(CHANNELS.adminLogs) ? "✅" : "❌"}`,
                      `Bot Logs Channel: ${interaction.guild.channels.cache.has(CHANNELS.botLogs) ? "✅" : "❌"}`,
                      `Ticket Category: ${interaction.guild.channels.cache.has(CHANNELS.ticketCategory) ? "✅" : "❌"}`
                    ];

                    const embed = new EmbedBuilder()
                      .setTitle("🩺 Lunar Health Check")
                      .setColor(0x57f287)
                      .setDescription(checks.join("\n"))
                      .setTimestamp();

                    return interaction.editReply({
                      embeds: [embed]
                    });
                  }
                  // 🎉 PREMIUM GIVEAWAY CREATE
                    if (
                      interaction.isChatInputCommand() &&
                      interaction.commandName === "giveaway" &&
                      interaction.options.getSubcommand() === "create"
                    ) {await interaction.deferReply({
                        ephemeral: true
                      });


                      const prize =
                        interaction.options.getString(
                          "prize"
                        );

                      const durationInput =
                        interaction.options.getString(
                          "duration"
                        );

                      const winners =
                        interaction.options.getInteger(
                          "winners"
                        );

                       const claimInput =
                         interaction.options.getString("claimtime") || "30s";

                       const claimTime = parseTime(claimInput);

                       if (!claimTime || isNaN(claimTime) || claimTime < 1000) {
                         return interaction.editReply({
                           content: "❌ Claim time must be like `30s`, `2m`, or `1h`."
                         });
                       }

                      const channel =
                        interaction.options.getChannel(
                          "channel"
                        );

                      const host =
                        interaction.options.getUser(
                          "host"
                        ) || interaction.user;

                       const sponsor =
                         interaction.options.getUser("sponsor");

                      const requiredDaily =
                        interaction.options.getInteger(
                          "daily"
                        ) || 0;

                      const requiredWeekly =
                        interaction.options.getInteger(
                          "weekly"
                        ) || 0;

                      const requiredMonthly =
                        interaction.options.getInteger(
                          "monthly"
                        ) || 0;

                      const requiredRole =
                        interaction.options.getRole(
                          "requiredrole"
                        );

                      const duration =
                        parseTime(durationInput);
                      const endAt = Date.now() + duration;

                      let requirementText = "";

                      if (requiredDaily > 0) {

                        requirementText +=
                          `🌅 Daily: ${requiredDaily}\n`;
                      }

                      if (requiredWeekly > 0) {

                        requirementText +=
                          `📅 Weekly: ${requiredWeekly}\n`;
                      }

                      if (requiredMonthly > 0) {

                        requirementText +=
                          `🗓️ Monthly: ${requiredMonthly}\n`;
                      }

                      if (requiredRole) {

                        requirementText +=
                          `🎭 Role: <@&${requiredRole.id}>`;
                      }
                      let extraEntriesText =
                        "";

                      extraEntriesText +=
                        `<@&1358683520578617444> • +3 entries\n`;

                      extraEntriesText +=
                        `<@&1384106733374410843> • +3 entries\n`;

                      extraEntriesText +=
                        `<@&1358681930480226496> • +2 entries`;

                      const row =
                        new ActionRowBuilder()
                          .addComponents(

                            new ButtonBuilder()
                            .setCustomId("enter")
                            .setEmoji("🎉")
                            .setLabel("0")
                            .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                              .setCustomId("participants")
                              .setLabel("Participants")
                              .setEmoji("👥")
                              .setStyle(ButtonStyle.Secondary)
                          );

                        const embed =
                          new EmbedBuilder()
                            .setTitle(
                              "🎉 Giveaway Started"
                            )
                            .setDescription(`## 🎁 ${prize}`)
                            .setColor(0xff4d6d)

                        .addFields(
                          {
                            name: "👑 Winners",
                            value: `${winners}`,
                            inline: true
                          },

                          {
                            name: "⏰ Ends",
                            value: formatGiveawayTime(endAt),
                            inline: true
                          },

                          {
                            name: "👤 Hosted By",
                            value: `<@${host.id}>`,
                            inline: false
                          },

                          ...(sponsor
                            ? [{
                                name: "🎖️ Sponsored By",
                                value: `<@${sponsor.id}>`,
                                inline: false
                              }]
                            : []),

                          {
                            name: "🎟️ Entries",
                            value: "0",
                            inline: false
                          },

                          {
                            name: "🎁 Extra Entries",
                            value: extraEntriesText,
                            inline: false
                          },

                          ...(requirementText
                            ? [{
                                name: "📋 Requirements",
                                value:
                                  requirementText,
                                inline: false
                              }]
                            : [])
                        )

                          .setFooter({
                            text:
                              "Click the button below to enter"
                          })

                          .setTimestamp();

                      const msg =
                        await channel.send({
                          embeds: [embed],
                          components: [row]
                        });

                        giveaways.set(msg.id, {

                        users: [],
                        entryMap: {},

                        winnerCount: winners,

                        claimTime,


                        prize,

                        endAt,
                        durationInput,

                        requiredDaily,
                        requiredWeekly,
                        requiredMonthly,

                        requiredRole:
                          requiredRole
                            ? requiredRole.id
                            : "none",

                          channel,
                          channelId: channel.id,
                          ended: false,
                        lastWinner: null,
                        allWinners: [],
                        claimedUsers: [],
                        failed: [],

                          host: host.id,
                          sponsor: sponsor ? sponsor.id : null,
                          messageUrl: msg.url
                       });

                       addPoints(host.id, "giveaway");
                       saveData();

                       setTimeout(
                         () => endGiveaway(msg.id),
                         duration
                       );

                       await sendGiveawayAuditLog(
                         interaction.guild,
                         "created",
                         msg.id,
                         giveaways.get(msg.id),
                         interaction.user,
                         { summary: `Slash giveaway created with **${winners}** winner(s).` }
                       );
                       return interaction.editReply({
                         content: "✅ Premium giveaway created"
                       });
                    }


                  // 🔥 SLASH MODLOG
                    if (
                      interaction.isChatInputCommand() &&
                      interaction.commandName === "modlog"
                    ) {
                      await interaction.deferReply({
                        ephemeral: true
                      });
                      console.log("MODLOG COMMAND TRIGGERED");

                      const type =
                        interaction.options.getString("type");

                      const target =
                        interaction.options.getUser("user");

                      const reason =
                        interaction.options.getString("reason");

                      const proofAttachment =
                        interaction.options.getAttachment("proof");
                      if (!proofAttachment) {
                        return interaction.reply({
                          content: "❌ Proof attachment missing",
                          ephemeral: true
                        });
                      }

                      const proof =
                        proofAttachment.url;

                      const targetMember =
                        interaction.guild.members.cache.get(target.id);

                      let imageProof = null;

                      if (
                        proofAttachment &&
                        typeof proofAttachment.contentType === "string" &&
                        proofAttachment.contentType.startsWith("image/")
                      ) {
                        imageProof = proof;
                      }

                      const logId =
                        Date.now().toString();

                      punishmentLogs.set(logId, {
                        id: logId,
                        target: target.id,
                        moderator: interaction.user.id,
                        type,
                        reason,
                        proof,
                        status: "Pending",
                        timestamp: Date.now()
                      });

                      saveData();

                      const row = new ActionRowBuilder().addComponents(

                        new ButtonBuilder()
                          .setCustomId(`approve_${logId}`)
                          .setLabel("Approve")
                          .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                          .setCustomId(`reject_${logId}`)
                          .setLabel("Reject")
                          .setStyle(ButtonStyle.Danger),

                        new ButtonBuilder()
                          .setCustomId(`note_${logId}`)
                          .setLabel("Add Note")
                          .setStyle(ButtonStyle.Secondary)
                      );

                      const embed = new EmbedBuilder()
                        .setTitle("📋 Punishment Log")
                        .setColor(0xffcc00)
                        .addFields(
                          {
                            name: "👤 Punished User",
                            value: `<@${target.id}>`,
                            inline: true
                          },
                          {
                            name: "⚠️ Punishment",
                            value: type,
                            inline: true
                          },
                          {
                            name: "🛡️ Submitted By",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                          },
                          {
                            name: "📝 Reason",
                            value: reason
                          },
                          {
                            name: "📎 Proof",
                            value: proof
                          },
                          {
                            name: "📌 Status",
                            value: "Pending Review"
                          }
                        )
                        .setTimestamp();

                      if (imageProof) {
                        embed.setImage(imageProof);
                      }

                      const logChannel =
                        interaction.guild.channels.cache.get(
                          CHANNELS.modLogs
                        );

                      if (logChannel) {

                        await logChannel.send({
                          embeds: [embed],
                          components: [row]
                        });
                      }

                      await interaction.editReply({
                        content: "✅ Modlog submitted"
                      });
                    }




                // 🔥 APPROVE MODLOG
                  if (
                    interaction.isButton() &&
                    interaction.customId.startsWith("approve_")
                  ) {

                  const member = interaction.member;

                  const canApprove =
                    member.roles.cache.has(ROLES.mod) ||
                    member.roles.cache.has(ROLES.headmod) ||
                    isBypass(member);

                  if (!canApprove) {
                    return interaction.reply({
                      content: "❌ You cannot approve modlogs",
                      ephemeral: true
                    });
                  }

                  const logId = interaction.customId.split("_")[1];

                  const data = punishmentLogs.get(logId);

                  if (!data) {
                    return interaction.reply({
                      content: "❌ Modlog not found",
                      ephemeral: true
                    });
                  }

                    data.status = "Approved";
                    addPoints(data.moderator, "modlog");

                    const approverIsBoss =
                      member.roles.cache.has(ROLES.ultimate) ||
                      member.roles.cache.has(ROLES.owner) ||
                      member.roles.cache.has(ROLES.admin);

                    if (approverIsBoss && interaction.user.id !== data.moderator) {
                      addPoints(interaction.user.id, "modlog");
                    }

                    data.reviewedBy = interaction.user.id;

                  punishmentLogs.set(logId, data);

                  saveData();

                  const embed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0x00c853);

                  embed.spliceFields(5, 1, {
                    name: "📌 Status",
                    value: `✅ Approved by <@${interaction.user.id}>`
                  });

                  const disabledRow = new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                      .setCustomId("approved_done")
                      .setLabel("Approved")
                      .setStyle(ButtonStyle.Success)
                      .setDisabled(true),

                    new ButtonBuilder()
                      .setCustomId("reject_done")
                      .setLabel("Rejected")
                      .setStyle(ButtonStyle.Danger)
                      .setDisabled(true),

                    new ButtonBuilder()
                      .setCustomId("note_done")
                      .setLabel("Add Note")
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(true)
                  );

                    await interaction.deferUpdate();
                    await interaction.message.edit({
                      embeds: [embed],
                      components: [disabledRow]
                    });


                }

                // 🔥 REJECT MODLOG
                  if (interaction.isButton() && interaction.customId.startsWith("reject_")) {

                  const member = interaction.member;

                  const canReject =
                    member.roles.cache.has(ROLES.mod) ||
                    member.roles.cache.has(ROLES.headmod) ||
                    isBypass(member);

                  if (!canReject) {
                    return interaction.reply({
                      content: "❌ You cannot reject modlogs",
                      ephemeral: true
                    });
                  }

                  const modal = new ModalBuilder()
                    .setCustomId(interaction.customId)
                    .setTitle("Reject ModLog");

                  const input = new TextInputBuilder()
                    .setCustomId("reject_reason")
                    .setLabel("Rejection Reason")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                          const row = new ActionRowBuilder().addComponents(input);

                          modal.addComponents(row);

                          try {
                            await interaction.showModal(modal);
                          } catch (err) {
                            console.log("Reject modal expired");
                            return;
                          }
                          }

                  // 📝 NOTE MODAL
                  if (interaction.isButton() && interaction.customId.startsWith("note_")) {

                    const modal = new ModalBuilder()
                      .setCustomId(interaction.customId)
                      .setTitle("Add Staff Note");

                    const input = new TextInputBuilder()
                      .setCustomId("staff_note")
                      .setLabel("Staff Note")
                      .setStyle(TextInputStyle.Paragraph)
                      .setRequired(true);

                    const row = new ActionRowBuilder().addComponents(input);

                    modal.addComponents(row);

                    try {
                      await interaction.showModal(modal);
                    } catch (err) {
                        console.log("Note modal expired");
                        return;
                      }
                    }

                  // 🎛️ GIVEAWAY CREATE
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "giveaway"
                  ) {

                    const sub =
                      interaction.options.getSubcommand();

                    // CREATE
                    if (sub === "create") {

                      giveawayDrafts.set(
                        interaction.user.id,
                        {
                          host: interaction.user.id,
                          duration: "10m",
                          winners: 1,
                          prize: "Prize",
                          requiredRole: "none"
                        }
                      );

                      const embed = new EmbedBuilder()
                        .setTitle("🎉 Giveaway Preview")
                        .setColor(0x57f287)
                        .setDescription(
                          `**Prize:** Prize\n` +
                          `**Winners:** 1\n` +
                          `**Duration:** 10m`
                        )
                        .setFooter({
                          text: "Preview giveaway before starting"
                        });

                      const row =
                        new ActionRowBuilder().addComponents(

                          new ButtonBuilder()
                            .setCustomId("g_edit")
                            .setLabel("🔧 Edit")
                            .setStyle(ButtonStyle.Secondary),

                          new ButtonBuilder()
                            .setCustomId("g_start")
                            .setLabel("▶️ Start")
                            .setStyle(ButtonStyle.Success),

                          new ButtonBuilder()
                            .setCustomId("g_cancel")
                            .setLabel("❌ Cancel")
                            .setStyle(ButtonStyle.Danger)
                        );

                      return interaction.reply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: true
                      });
                    }
                  }

                  // 🎛️ GIVEAWAY PANEL BUTTONS
                  if (
                    interaction.isButton()
                  ) {

                    // 📘 HELP BUTTONS
                    if (
                      interaction.customId.startsWith("help_")
                    ) {

                      let embed;

                      // 🎉 GIVEAWAYS
                      if (
                        interaction.customId ===
                        "help_giveaway"
                      ) {

                        embed =
                          new EmbedBuilder()
                            .setTitle(
                              "🎉 Giveaway Commands"
                            )
                            .setColor(0xff73fa)
                            .setDescription(
                              "`/giveaway create` → create giveaway\n" +
                              "`/gstart` → quick giveaway\n" +
                              "`.greroll` → reroll winners\n" +
                              "`.gpause` → pause giveaway\n" +
                              "`.gresume` → resume giveaway\n" +
                              "`.gend` → end giveaway"
                            );
                      }

                      // 🛡️ SECURITY
                      else if (
                        interaction.customId ===
                        "help_security"
                      ) {

                        embed =
                          new EmbedBuilder()
                            .setTitle(
                              "🛡️ Security Systems"
                            )
                            .setColor(0xff3b3b)
                            .setDescription(
                              "✅ Anti Everyone Ping\n" +
                              "✅ Anti Bot Add\n" +
                              "✅ Anti Channel Delete\n" +
                              "✅ Anti Role Delete\n" +
                              "✅ Anti Mass Ban\n" +
                              "✅ Role Abuse Protection"
                            );
                      }

                      // 👮 MODERATION
                      else if (
                        interaction.customId ===
                        "help_mod"
                      ) {

                        embed =
                          new EmbedBuilder()
                            .setTitle(
                              "👮 Moderation Commands"
                            )
                            .setColor(0x5865f2)
                            .setDescription(
                              "`.strike`\n" +
                              "`.removestrike`\n" +
                              "`.modlog`\n" +
                              "`.case`\n" +
                              "`.close`"
                            );
                      }

                      // 👑 STAFF
                      else if (
                        interaction.customId ===
                        "help_staff"
                      ) {

                        embed =
                          new EmbedBuilder()
                            .setTitle(
                              "👑 Staff Systems"
                            )
                            .setColor(0xffd700)
                            .setDescription(
                              "`.staffstats`\n" +
                              "`.stafflb`\n" +
                              "`.motm`\n" +
                              "Staff point tracking\n" +
                              "Moderator of the Month"
                            );
                      }

                      return interaction.update({
                        embeds: [embed],
                        components: [
                          new ActionRowBuilder().addComponents(

                            new ButtonBuilder()
                              .setCustomId("help_giveaway")
                              .setLabel("🎉 Giveaways")
                              .setStyle(ButtonStyle.Primary),

                            new ButtonBuilder()
                              .setCustomId("help_security")
                              .setLabel("🛡️ Security")
                              .setStyle(ButtonStyle.Danger),

                            new ButtonBuilder()
                              .setCustomId("help_mod")
                              .setLabel("👮 Moderation")
                              .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                              .setCustomId("help_staff")
                              .setLabel("👑 Staff")
                              .setStyle(ButtonStyle.Success)
                          )
                        ]
                      });
                    }

                    // ❌ CANCEL
                    if (interaction.customId === "g_cancel") {

                      await sendGiveawayAuditLog(
                        interaction.guild,
                        "created",
                        msg.id,
                        giveaways.get(msg.id),
                        interaction.user,
                        { summary: "Giveaway created from premium draft panel." }
                      );
                      giveawayDrafts.delete(
                        interaction.user.id
                      );

                      return interaction.update({
                        content:
                          "❌ Giveaway creation cancelled",
                        embeds: [],
                        components: []
                      });
                    }

                    // 🔧 EDIT
                    if (interaction.customId === "g_edit") {

                      const draft =
                        giveawayDrafts.get(
                          interaction.user.id
                        );

                      if (!draft) {

                        return interaction.reply({
                          content:
                            "❌ Giveaway draft not found",
                          ephemeral: true
                        });
                      }

                      const modal =
                        new ModalBuilder()
                          .setCustomId("g_edit_modal")
                          .setTitle("Edit Giveaway");

                      const prizeInput =
                        new TextInputBuilder()
                          .setCustomId("prize")
                          .setLabel("Prize")
                          .setStyle(TextInputStyle.Short)
                          .setRequired(true)
                          .setValue(draft.prize);

                      const durationInput =
                        new TextInputBuilder()
                          .setCustomId("duration")
                          .setLabel("Duration")
                          .setStyle(TextInputStyle.Short)
                          .setRequired(true)
                          .setValue(draft.duration);

                      const winnersInput =
                        new TextInputBuilder()
                          .setCustomId("winners")
                          .setLabel("Winners")
                          .setStyle(TextInputStyle.Short)
                          .setRequired(true)
                          .setValue(
                            String(draft.winners)
                          );

                      const roleInput =
                        new TextInputBuilder()
                          .setCustomId("requiredRole")
                          .setLabel("Required Role ID or none")
                          .setStyle(TextInputStyle.Short)
                          .setRequired(true)
                          .setValue(draft.requiredRole);

                      modal.addComponents(

                        new ActionRowBuilder()
                          .addComponents(prizeInput),

                        new ActionRowBuilder()
                          .addComponents(durationInput),

                        new ActionRowBuilder()
                          .addComponents(winnersInput),

                        new ActionRowBuilder()
                          .addComponents(roleInput)
                      );

                      return interaction.showModal(modal);
                    }
                    // ▶️ START GIVEAWAY
                    if (interaction.customId === "g_start") {

                      const draft =
                        giveawayDrafts.get(
                          interaction.user.id
                        );

                      if (!draft) {

                        return interaction.reply({
                          content:
                            "❌ Giveaway draft not found",
                          ephemeral: true
                        });
                      }

                      const duration =
                        parseTime(draft.duration);

                      if (!duration) {

                        return interaction.reply({
                          content:
                            "❌ Invalid duration",
                          ephemeral: true
                        });
                      }

                      const row =
                        new ActionRowBuilder().addComponents(

                          new ButtonBuilder()
                            .setCustomId("enter")
                            .setLabel("🎉 Enter")
                            .setStyle(ButtonStyle.Primary),

                          new ButtonBuilder()
                            .setCustomId("participants")
                            .setLabel("👥 Participants")
                            .setStyle(ButtonStyle.Secondary)
                        );

                      let roleText = "None";

                      if (
                        draft.requiredRole !== "none"
                      ) {

                        const role =
                          interaction.guild.roles.cache.get(
                            draft.requiredRole
                          );

                        if (role) {
                          roleText = `<@&${role.id}>`;
                        }
                      }

                      const embed =
                        new EmbedBuilder()
                          .setTitle(`🎉 ${draft.prize}`)
                          .setColor(0x57f287)
                          .setDescription(
                            `Click 🎉 button to enter!\n` +
                            `Winners: **${draft.winners}**\n` +
                            `Ends: **${draft.duration}**`
                          )
                          .addFields(
                            {
                              name: "🎟️ Entries",
                              value: "0",
                              inline: true
                            },
                            {
                              name: "📋 Requirements",
                              value:
                              `• Required Role: ${roleText}\n` +
                              `• Booster: +3 entries\n` +
                              `• <@&1358683520578617444>: +3 entries\n` +
                              `• <@&1358681930480226496>: +2 entries`,
                              inline: false
                            }
                          )
                          .setFooter({
                            text:
                              `Hosted by ${interaction.user.tag}`
                          })
                          .setTimestamp();

                      const msg =
                        await interaction.channel.send({
                          embeds: [embed],
                          components: [row]
                        });

                      giveaways.set(msg.id, {

                        users: [],
                        entryMap: {},
                        winnerCount: draft.winners,

                        claimTime: 30000,
                        endAt: Date.now() + duration,

                        prize: draft.prize,
                        requiredRole: draft.requiredRole,

                        channel: interaction.channel,

                        ended: false,
                        paused: false,

                        lastWinner: null,

                        allWinners: [],
                        claimedUsers: [],

                        failed: [],

                        host: interaction.user.id,

                        messageUrl: msg.url
                      });

                      addPoints(interaction.user.id, "giveaway");
                      saveData();

                      setTimeout(() => {
                        endGiveaway(msg.id);
                      }, duration);

                      await sendGiveawayAuditLog(
                        interaction.guild,
                        "created",
                        msg.id,
                        giveaways.get(msg.id),
                        interaction.user,
                        { summary: "Giveaway created from premium draft panel." }
                      );
                      giveawayDrafts.delete(
                        interaction.user.id
                      );

                      return interaction.update({
                        content:
                          "✅ Giveaway started",
                        embeds: [],
                        components: []
                      });
                    }
                  }

                  // 👥 PARTICIPANTS BUTTON
                  if (
                    interaction.isButton() &&
                    interaction.customId === "participants"
                  ) {

                    const g =
                      giveaways.get(interaction.message.id);

                    if (!g) return;

                    const users = g.users || [];

                    let list = "No participants yet.";

                    if (users.length > 0) {

                      list = users
                      .slice(0, 20)
                      .map((u, i) => {

                        const amount =
                          g.entryMap[u] || 1;

                        return (
                          `${i + 1}. <@${u}> - ` +
                          `${amount} entries`
                        );
                      })
                      .join("\n");
                    }

                    const embed =
                      new EmbedBuilder()
                        .setTitle("👥 Giveaway Participants")
                        .setColor(0x5865f2)
                        .addFields(
                          {
                            name: "📊 Total Participants",
                            value: `${users.length}`,
                            inline: false
                          },
                          {
                            name: "📝 Participant List",
                            value: list,
                            inline: false
                          }
                        )
                        .setTimestamp();

                    return interaction.reply({
                      embeds: [embed],
                      ephemeral: true
                    });
                  }

                  // ENTER BUTTON
                  if (
                    interaction.isButton() &&
                    interaction.customId === "enter"
                  ) {
                  const g = giveaways.get(interaction.message.id);

                    if (!g) {
                      return interaction.reply({
                        content: "❌ Giveaway not found.",
                        ephemeral: true
                      });
                    }

                    const isGiveawayBoss = isBypass(interaction.member);
                    const hasBoosterBypass = interaction.member.roles.cache.has(ROLES.booster);
                    const bypassRequirements = isGiveawayBoss || hasBoosterBypass;
                    // FIX OLD GIVEAWAYS
                    if (
                      typeof g.requiredDaily !== "number"
                    ) {
                      g.requiredDaily = 0;
                    }

                    if (
                      typeof g.requiredWeekly !== "number"
                    ) {
                      g.requiredWeekly = 0;
                    }

                    if (
                      typeof g.requiredMonthly !== "number"
                    ) {
                      g.requiredMonthly = 0;
                    }
                    // 📊 MESSAGE REQUIREMENTS
                    const stats =
                      messageStats.get(
                        interaction.user.id
                      ) || {

                        daily: 0,
                        weekly: 0,
                        monthly: 0,
                        total: 0
                      };
                    const denyRequirement = (periodText, current, required) => {
                      const embed = new EmbedBuilder()
                        .setColor(0xff4d4d)
                        .setTitle("Entry Denied!")
                        .setDescription(
                          `Your entry for the giveaway of **${g.prize || "this prize"}** is denied as you've only sent **${Number(current).toLocaleString("en-US")} messages** ${periodText}\n` +
                          `but you're required to send **${Number(required).toLocaleString("en-US")} messages**\n\n` +
                          "**✦ Access Locked: Activity Required ✦**\n" +
                          "Stay active, build your message count, and unlock your giveaway entry."
                        )
                        .setFooter({
                          text: interaction.client.user.username
                        })
                        .setTimestamp();

                      return interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                      });
                    };


                    // 🌅 DAILY CHECK
                    if (!bypassRequirements) {
                    if (
                      Number(g.requiredDaily) > 0 &&
                      stats.daily <
                        Number(g.requiredDaily)
                    ) {

                      return denyRequirement(
                        "today",
                        stats.daily,
                        g.requiredDaily
                      );
                    }

                    // 📅 WEEKLY CHECK
                    if (
                      Number(g.requiredWeekly) > 0 &&
                      stats.weekly <
                        Number(g.requiredWeekly)
                    ) {

                      return denyRequirement(
                        "this week",
                        stats.weekly,
                        g.requiredWeekly
                      );
                    }

                    // 🗓️ MONTHLY CHECK
                    if (
                      Number(g.requiredMonthly) > 0 &&
                      stats.monthly <
                        Number(g.requiredMonthly)
                    ) {

                      return denyRequirement(
                        "this month",
                        stats.monthly,
                        g.requiredMonthly
                      );
                    }
                      }
                    if (g.paused) {

                      return interaction.reply({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(0xffcc00)
                            .setDescription(
                              "⏸️ This giveaway is paused"
                            )
                        ],
                        ephemeral: true
                      });
                    }
                    const blacklistExpire =
                      giveawayBlacklist.get(interaction.user.id);

                    if (blacklistExpire) {

                      // ✅ expired
                      if (Date.now() > blacklistExpire) {

                        giveawayBlacklist.delete(
                          interaction.user.id
                        );

                        saveData();
                      }

                      // ❌ still blacklisted
                      else {

                        return interaction.reply({
                          embeds: [
                            new EmbedBuilder()
                              .setColor(0xff3b3b)
                              .setDescription(
                                "❌ You are temporarily blacklisted from giveaways"
                              )
                          ],
                          ephemeral: true
                        });
                      }
                    if (
                      giveawayBlacklist.has(interaction.user.id) &&
                      giveawayBlacklist.get(interaction.user.id) > Date.now()

                    )

                      return interaction.reply({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(0xff3b3b)
                            .setDescription(
                              "❌ You are blacklisted from giveaways"
                            )
                        ],
                        ephemeral: true
                      });
                    }

                    if (!isGiveawayBoss) {
                      if (
                        interaction.member.roles.cache.has(ROLES.cooldown) ||
                        interaction.member.roles.cache.has(ROLES.gwyBanned)
                      ) {
                        return interaction.reply({
                          content: "❌ You are blocked from joining giveaways right now.",
                          ephemeral: true
                        });
                      }
                    }
                      // 🎭 REQUIRED ROLE CHECK
                      if (
                        !bypassRequirements &&
                        g.requiredRole &&
                        g.requiredRole !== "none"
                      ) {

                      if (
                        !interaction.member.roles.cache.has(
                          g.requiredRole
                        )
                      ) {

                        return interaction.reply({
                          content:
                            "❌ You do not have the required role.",
                          ephemeral: true
                        });
                      }
                    }

                  if (g.users.includes(interaction.user.id)) {
                    return interaction.reply({ content: "❌ Already entered", ephemeral: true });
                  }

                    let bonus = 0;

                    // 🚀 BOOSTER
                    if (
                      interaction.member.roles.cache.has(
                        "1384106733374410843"
                      )
                    ) {

                      bonus = Math.max(bonus, 3);
                    }

                    // 💎 3B BOUNTY
                    if (
                      interaction.member.roles.cache.has(
                        "1358683520578617444"
                      )
                    ) {

                      bonus = Math.max(bonus, 3);
                    }

                    // 🛡️ 20M BOUNTY
                    if (
                      interaction.member.roles.cache.has(
                        "1358681930480226496"
                      )
                    ) {

                      bonus = Math.max(bonus, 2);
                    }

                    const totalEntries = 1 + bonus;

                    g.users.push(interaction.user.id);

                    g.entryMap[interaction.user.id] =
                      totalEntries;

                    saveData();

                    const entryCount = g.users.length;

                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

                    const fields = embed.data.fields || [];

                    const entriesIndex = fields.findIndex(field =>
                      field.name.includes("Entries") &&
                      !field.name.includes("Extra")
                    );

                    if (entriesIndex !== -1) {
                      fields[entriesIndex] = {
                        ...fields[entriesIndex],
                        value: `${entryCount}`
                      };
                    }

                    embed.setFields(fields);

                    const row = new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setCustomId("enter")
                        .setEmoji("🎉")
                        .setLabel(`${entryCount}`)
                        .setStyle(ButtonStyle.Primary),

                      new ButtonBuilder()
                        .setCustomId("participants")
                        .setEmoji("👥")
                        .setLabel("Participants")
                        .setStyle(ButtonStyle.Secondary)
                    );

                    await interaction.update({
                      embeds: [embed],
                      components: [row]
                    });
                }

                // 🎟️ CLAIM BUTTON
                  if (
                    interaction.isButton() &&
                    interaction.customId.startsWith("claim_")
                  ) {

                  const id = interaction.customId.split("_")[1];
                  const g = giveaways.get(id);
                  if (!g) return;

                    if (
                      !g.allWinners.includes(interaction.user.id)
                    ) {

                      return interaction.reply({
                        content: "❌ You are not a winner",
                        ephemeral: true
                      });
                    }

                    if (
                      g.claimedUsers.includes(interaction.user.id)
                    ) {

                      return interaction.reply({
                        content: "❌ You already claimed",
                        ephemeral: true
                      });
                    }

                    await interaction.deferReply({ ephemeral: true });

                    const giveawayChannel = await getGiveawayChannel(g);
                    if (giveawayChannel) {
                      await giveawayChannel.send(`✅ <@${interaction.user.id}> claimed in time`);
                    }

                  const guild = interaction.guild;
                  const member = guild.members.cache.get(interaction.user.id);

                  // 🎫 CREATE TICKET
                  const hostId = g.host;
                    const sponsorId = g.sponsor || null;

                  const prize = g.prize || "prize";

                  const safePrize = prize.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
                  const safeUser = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "");
                  // 🎫 CREATE TICKET

                  const channel = await guild.channels.create({
                    name: `claim-${safeUser}-${safePrize}`,
                    parent: CHANNELS.ticketCategory,
                    permissionOverwrites: [
                      {
                        id: guild.roles.everyone.id,
                        deny: ["ViewChannel"]
                      },
                      {
                        id: interaction.user.id,
                        allow: ["ViewChannel", "SendMessages"]
                      },
                      {
                        id: hostId,
                        allow: ["ViewChannel", "SendMessages"]
                      },
                      ...(sponsorId && sponsorId !== hostId
                        ? [{
                            id: sponsorId,
                            allow: ["ViewChannel", "SendMessages"]
                          }]
                        : []),
                      {
                        id: ROLES.mod,
                        allow: ["ViewChannel", "SendMessages"]
                      },
                      {
                        id: ROLES.trial,
                        allow: ["ViewChannel", "SendMessages"]
                      },
                      {
                        id: ROLES.headmod,
                        allow: ["ViewChannel", "SendMessages"]
                      }
                    ]
                      });


                    // ✅ SEND CLAIM PANEL
                    const claimPanelEmbed = new EmbedBuilder()
                      .setTitle("🎁 Prize Claim Ticket")
                      .setColor(0x5865f2)
                      .setDescription(
                        `Welcome <@${interaction.user.id}>.\n\n` +
                        `This ticket is for claiming your giveaway prize.`
                      )
                      .addFields(
                        {
                          name: "👤 Winner",
                          value: `<@${interaction.user.id}>`,
                          inline: true
                        },
                        {
                          name: "🎉 Host",
                          value: `<@${hostId}>`,
                          inline: true
                        },
                        ...(g.sponsor
                          ? [{
                              name: "🎖️ Sponsor",
                              value: `<@${g.sponsor}>`,
                              inline: true
                            }]
                          : []),
                        {
                          name: "🎁 Prize",
                          value: g.prize || "Prize",
                          inline: true
                        },
                        {
                          name: "💰 Host Instructions",
                          value:
                            "Sponsor/host should send the payment, upload proof, then staff can mark the ticket status.",
                          inline: false
                        },
                        {
                          name: "🛡️ Staff Review",
                          value:
                            "Use the buttons below after checking proof and payment status.",
                          inline: false
                        }
                      )
                      .setFooter({
                        text: "Lunar Claim Management"
                      })
                      .setTimestamp();

                    const claimStatusRow = new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setCustomId("claimstatus_paid")
                        .setLabel("Paid")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success),

                      new ButtonBuilder()
                        .setCustomId("claimstatus_rejected")
                        .setLabel("Rejected")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Danger),

                      new ButtonBuilder()
                        .setCustomId("claimstatus_need_proof")
                        .setLabel("Need Proof")
                        .setEmoji("📸")
                        .setStyle(ButtonStyle.Secondary),

                      new ButtonBuilder()
                        .setCustomId(`claimstatus_remind_${interaction.user.id}_${g.host}_${g.sponsor || g.host}`)
                        .setLabel("Remind Both")
                        .setEmoji("🔔")
                        .setStyle(ButtonStyle.Primary)
                    );
                    const staffPing =
                      `<@&${ROLES.trial}> <@&${ROLES.mod}> <@&${ROLES.headmod}>`;
                    await channel.send({
                      content:
                        `${staffPing}\n` +
                        `🎫 New giveaway claim ticket opened by <@${interaction.user.id}>.`,
                      embeds: [claimPanelEmbed],
                      components: [claimStatusRow],
                      allowedMentions: {
                        roles: [ROLES.trial, ROLES.mod, ROLES.headmod],
                        users: [interaction.user.id]
                      }
                    });
                    const ticketUrl = `https://discord.com/channels/${guild.id}/${channel.id}`;

                    const ticketDirectionEmbed = new EmbedBuilder()
                      .setTitle("🎁 Claim Ticket Created")
                      .setColor(0x57f287)
                      .setDescription(
                        `Your prize claim ticket has been created.\n\n` +
                        `Go to ${channel} and follow the instructions there.`
                      )
                      .addFields(
                        {
                          name: "Prize",
                          value: g.prize || "Prize",
                          inline: true
                        },
                        {
                          name: "Host",
                          value: `<@${hostId}>`,
                          inline: true
                        },
                        ...(sponsorId
                          ? [{
                              name: "Sponsor",
                              value: `<@${sponsorId}>`,
                              inline: true
                            }]
                          : [])
                      )
                      .setFooter({ text: "Only you can see this message" })
                      .setTimestamp();

                    const ticketDirectionRow = new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setLabel("Open Claim Ticket")
                        .setStyle(ButtonStyle.Link)
                        .setURL(ticketUrl)
                    );

                    await interaction.editReply({
                      embeds: [ticketDirectionEmbed],
                      components: [ticketDirectionRow]
                    });

                    const logChannel = guild.channels.cache.get(CHANNELS.botLogs);

                    if (logChannel) {
                      const claimLogEmbed = new EmbedBuilder()
                        .setTitle("📜 Giveaway Claim Log")
                        .setColor(0x57f287)
                        .addFields(
                          {
                            name: "👤 Winner",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                          },
                          {
                            name: "🎁 Prize",
                            value: g.prize || "Prize",
                            inline: true
                          },
                          {
                            name: "🎉 Giveaway Host",
                            value: `<@${hostId}>`,
                            inline: true
                          },
                          {
                            name: "🔗 Giveaway",
                            value: g.messageUrl ? `[Jump to Giveaway](${g.messageUrl})` : "No link saved",
                            inline: false
                          },
                          {
                            name: "🎫 Claim Ticket",
                            value: `${channel}`,
                            inline: false
                          },
                          {
                            name: "🕒 Claimed At",
                            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                            inline: false
                          }
                        )
                        .setFooter({
                          text: "Lunar Giveaway Claim System"
                        })
                        .setTimestamp();

                      logChannel.send({
                        embeds: [claimLogEmbed]
                      });
                    }

                    g.claimedUsers.push(interaction.user.id);

                    if (member) {

                      await member.roles.add(ROLES.cooldown)
                        .catch(() => {});

                      removeCooldownLater(member);
                    }

                    saveData();
                }

                  // 🎫 CLAIM STATUS BUTTONS
                  if (
                    interaction.isButton() &&
                    [
                      "claimstatus_paid",
                      "claimstatus_rejected",
                      "claimstatus_need_proof"
                    ].includes(interaction.customId)
                  ) {
                    const member = interaction.member;

                    const isStaff =
                      member.roles.cache.has(ROLES.owner) ||
                      member.roles.cache.has(ROLES.admin) ||
                      member.roles.cache.has(ROLES.headmod) ||
                      member.roles.cache.has(ROLES.mod) ||
                      member.roles.cache.has(ROLES.trial) ||
                      isBypass(member);

                    if (!isStaff) {
                      return interaction.reply({
                        content: "❌ Staff only.",
                        ephemeral: true
                      });
                    }

                    if (interaction.customId === "claimstatus_need_proof") {
                      await interaction.reply({
                        content:
                          "📸 More proof is required. Please upload clearer payment proof or additional screenshots in this ticket."
                      });

                      return;
                    }
                   
                    if (interaction.customId === "claimstatus_rejected") {
                      await interaction.reply({
                        content:
                          "❌ Claim rejected. Please recheck the payment details and provide valid proof."
                      });

                      return;
                    }

                    if (interaction.customId === "claimstatus_paid") {
                      await interaction.deferUpdate();

                      const paidEmbed = new EmbedBuilder()
                        .setTitle("✅ Claim Marked As Paid")
                        .setColor(0x57f287)
                        .addFields(
                          {
                            name: "🛡️ Verified By",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                          },
                          {
                            name: "🎫 Ticket",
                            value: `${interaction.channel}`,
                            inline: true
                          }
                        )
                        .setFooter({
                          text: "Ticket will stay open until staff closes it"
                        })
                        .setTimestamp();

                      await interaction.channel.send({
                        embeds: [paidEmbed]
                      });

                      const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                        .setCustomId("claimstatus_paid")
                          .setLabel("Paid")
                          .setEmoji("✅")
                          .setStyle(ButtonStyle.Success)
                          .setDisabled(true),

                        new ButtonBuilder()
                        .setCustomId("claimstatus_rejected")
                          .setLabel("Rejected")
                          .setEmoji("❌")
                          .setStyle(ButtonStyle.Danger)
                          .setDisabled(true),

                        new ButtonBuilder()
                          .setCustomId("claimstatus_need_proof")
                          .setLabel("Need Proof")
                          .setEmoji("📸")
                          .setStyle(ButtonStyle.Secondary)
                          .setDisabled(true)
                      );

                      await interaction.message.edit({
                        components: [disabledRow]
                      }).catch(() => {});

                      const paidLogChannel =
                        interaction.guild.channels.cache.get(CHANNELS.botLogs) ||
                        interaction.guild.channels.cache.get(CHANNELS.giveawayLogs);

                      if (paidLogChannel) {
                        const paidLogEmbed = new EmbedBuilder()
                          .setTitle("✅ Claim Ticket Marked Paid")
                          .setColor(0x57f287)
                          .addFields(
                            {
                              name: "🎫 Ticket",
                              value: `${interaction.channel}`,
                              inline: true
                            },
                            {
                              name: "🛡️ Verified By",
                              value: `<@${interaction.user.id}>`,
                              inline: true
                            },
                            {
                              name: "📌 Next Step",
                              value: "Waiting for staff confirmation to close the ticket.",
                              inline: false
                            }
                          )
                          .setTimestamp();

                        await paidLogChannel.send({
                          embeds: [paidLogEmbed]
                        }).catch(() => {});
                      }

                      const closeConfirmRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setCustomId("close_confirm")
                          .setLabel("✅ Confirm Ticket Close")
                          .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                          .setCustomId("close_cancel")
                          .setLabel("❌ Cancel")
                          .setStyle(ButtonStyle.Danger)
                      );

                      await interaction.channel.send({
                        content: "✅ **Payment marked as paid.**\n⚠️ **Confirm Ticket Close?**",
                        components: [closeConfirmRow]
                      }).catch(() => {});
                    }
                  }
                  // 🔔 REMIND BOTH BUTTON
                  if (
                    interaction.isButton() &&
                    interaction.customId.startsWith("claimstatus_remind_")
                  ) {
                    const member = interaction.member;

                    const isStaff =
                      member.roles.cache.has(ROLES.owner) ||
                      member.roles.cache.has(ROLES.admin) ||
                      member.roles.cache.has(ROLES.headmod) ||
                      member.roles.cache.has(ROLES.mod) ||
                      member.roles.cache.has(ROLES.trial) ||
                      isBypass(member);

                    if (!isStaff) {
                      return interaction.reply({
                        content: "❌ Staff only.",
                        ephemeral: true
                      });
                    }

                    const parts = interaction.customId.split("_");
                    const winnerId  = parts[2];
                    const hostId    = parts[3];
                    const sponsorId = parts[4];

                    const remindEmbed = new EmbedBuilder()
                      .setTitle("🔔 Action Required!")
                      .setColor(0xff9800)
                      .setDescription(
                        `Both Sponsor and Winner are directed to perform claim and paying task.\n\n` +
                        `Both of you be quick so that ticket can be closed.`
                      )
                      .addFields(
                        {
                          name: "🏆 Winner",
                          value: `<@${winnerId}> — claim your prize quick.`,
                          inline: false
                        },
                        {
                          name: "💰 Sponsor / Host",
                          value: `<@${sponsorId}> — Pay quick and post the proof here.`,
                          inline: false
                        },
                        {
                          name: "🛡️ Reminded By",
                          value: `<@${interaction.user.id}>`,
                          inline: false
                        }
                      )
                      .setFooter({ text: "Lunar Claim System • Pay & Claim Fast!" })
                      .setTimestamp();

                    const mentionContent =
                      sponsorId !== hostId
                        ? `<@${winnerId}> <@${hostId}> <@${sponsorId}>`
                        : `<@${winnerId}> <@${hostId}>`;

                    await interaction.reply({
                      content: mentionContent,
                      embeds: [remindEmbed]
                    });
                  }
                  // 🎫 CLOSE CONFIRM
                  if (
                    interaction.isButton() &&
                    interaction.customId === "close_confirm"
                  ) {
                    const member = interaction.member;

                    const isStaff =
                      member.roles.cache.has(ROLES.owner) ||
                      member.roles.cache.has(ROLES.admin) ||
                      member.roles.cache.has(ROLES.headmod) ||
                      member.roles.cache.has(ROLES.mod) ||
                      member.roles.cache.has(ROLES.trial) ||
                      isBypass(member);

                    if (!isStaff) {
                      return interaction.reply({
                        content: "❌ Not allowed to close tickets.",
                        ephemeral: true
                      });
                    }

                    if (interaction.channel.parentId !== CHANNELS.ticketCategory) {
                      return interaction.reply({
                        content: "❌ This is not a ticket.",
                        ephemeral: true
                      });
                    }

                    // Remove the Confirm/Cancel buttons immediately so they aren't clicked twice
                    await interaction.update({ components: [] }).catch(() => {});

                    // Start the 5-second countdown message
                    await interaction.channel.send({
                      content: "⏳ **Ticket will be closed in 5 seconds...**\n*Saving transcripts and logs...*"
                    });

                    // Generate Transcript
                    const attachment = await transcripts
                      .createTranscript(interaction.channel)
                      .catch(() => null);

                    const logChannel =
                      interaction.guild.channels.cache.get(CHANNELS.botLogs) ||
                      interaction.guild.channels.cache.get(CHANNELS.giveawayLogs);

                    if (logChannel) {
                      const logEmbed = new EmbedBuilder()
                        .setTitle("🗑️ Ticket Closed & Deleted")
                        .setColor(0xff3b3b)
                        .addFields(
                          {
                            name: "🎫 Ticket",
                            value: `${interaction.channel.name}`,
                            inline: true
                          },
                          {
                            name: "🛡️ Closed By",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                          }
                        )
                        .setTimestamp();

                      await logChannel.send({
                        embeds: [logEmbed],
                        files: attachment ? [attachment] : []
                      }).catch(() => {});
                    }

                    // Delete the channel exactly after 5 seconds
                    setTimeout(() => {
                      if (interaction.channel && interaction.channel.deletable) {
                        interaction.channel.delete().catch(() => {});
                      }
                    }, 5000);
                  }
                // ❌ CANCEL CLOSE
                  if (
                    interaction.isButton() &&
                    interaction.customId === "close_cancel"
                  ) {
                    await interaction.update({
                      content: "❌ Ticket close cancelled.",
                      embeds: [],
                      components: []
                    }).catch(() => {});

                    return;
                  }


                  // 🎛️ ONGOING GIVEAWAY EDIT MODAL
                  if (
                    interaction.isModalSubmit() &&
                    interaction.customId.startsWith("gwy_edit_modal_")
                  ) {
                    const parts = interaction.customId.split("_");
                    const messageId = parts[3];
                    const field = parts[4];
                    const expiresAt = Number(parts[5]);
                    if (!isStaffMember(interaction.member)) {
                      return interaction.reply({
                        content: "❌ Staff only.",
                        ephemeral: true
                      });
                    }

                    if (Date.now() > expiresAt) {
                      return interaction.reply({
                        content: "⏰ This giveaway edit panel expired. Run `/giveaway edit` again.",
                        ephemeral: true
                      });
                    }

                    const g = giveaways.get(messageId);

                    if (!g || g.ended) {
                      return interaction.reply({
                        content: "❌ Giveaway not found or already ended.",
                        ephemeral: true
                      });
                    }

                    const value = interaction.fields.getTextInputValue("value").trim();

                    if (field === "prize") {
                      g.prize = value;
                    }

                    if (field === "winners") {
                      const winners = parseInt(value);
                      if (isNaN(winners) || winners < 1) {
                        return interaction.reply({
                          content: "❌ Winners must be a number above 0.",
                          ephemeral: true
                        });
                      }

                      g.winnerCount = winners;
                    }

                    if (field === "duration") {
                      const duration = parseTime(value);
                      if (!duration || duration < 1000) {
                        return interaction.reply({
                          content: "❌ Invalid duration. Use 30s, 10m, 1h.",
                          ephemeral: true
                        });
                      }

                      g.durationInput = value;
                      g.endAt = Date.now() + duration;
                      setTimeout(() => {
                        const latest = giveaways.get(messageId);
                        if (!latest || latest.ended) return;

                        if (latest.endAt && Date.now() < latest.endAt) {
                          return;
                        }

                        endGiveaway(messageId);
                      }, duration);
                    }

                    if (field === "claimtime") {
                      const claimTime = parseTime(value);

                      if (!claimTime || isNaN(claimTime) || claimTime < 1000) {
                        return interaction.reply({
                          content: "❌ Claim time must be like `30s`, `2m`, or `1h`.",
                          ephemeral: true
                        });
                      }

                      g.claimTime = claimTime;
                    }

                    if (field === "daily") {
                      const amount = parseInt(value);
                      if (isNaN(amount) || amount < 0) {
                        return interaction.reply({
                          content: "❌ Daily requirement must be 0 or above.",
                          ephemeral: true
                        });
                      }

                      g.requiredDaily = amount;
                    }

                    if (field === "weekly") {
                      const amount = parseInt(value);
                      if (isNaN(amount) || amount < 0) {
                        return interaction.reply({
                          content: "❌ Weekly requirement must be 0 or above.",
                          ephemeral: true
                        });
                      }

                      g.requiredWeekly = amount;
                    }

                    if (field === "monthly") {
                      const amount = parseInt(value);
                      if (isNaN(amount) || amount < 0) {
                        return interaction.reply({
                          content: "❌ Monthly requirement must be 0 or above.",
                          ephemeral: true
                        });
                      }

                      g.requiredMonthly = amount;
                    }

                    if (field === "requiredrole") {
                      if (value.toLowerCase() === "none") {
                        g.requiredRole = "none";
                      } else {
                        const role = interaction.guild.roles.cache.get(value);
                        if (!role) {
                          return interaction.reply({
                            content: "❌ Role not found. Enter a valid role ID or `none`.",
                            ephemeral: true
                          });
                        }

                        g.requiredRole = role.id;
                      }
                    }

                    if (field === "host") {
                      const member = await interaction.guild.members.fetch(value).catch(() => null);
                      if (!member) {
                        return interaction.reply({
                          content: "❌ User not found. Enter a valid user ID.",
                          ephemeral: true
                        });
                      }

                      g.host = member.id;
                    }

                    giveaways.set(messageId, g);
                    saveData();

                    const channelId =
                      g.channelId ||
                      g.channel?.id;

                    const channel =
                      client.channels.cache.get(channelId) ||
                      await client.channels.fetch(channelId).catch(() => null);

                    if (!channel || !channel.messages) {
                      return interaction.reply({
                        content: "⚠️ Giveaway data updated, but I could not edit the giveaway message.",
                        ephemeral: true
                      });
                    }

                    const msg = await channel.messages.fetch(messageId).catch(() => null);

                    if (!msg) {
                      return interaction.reply({
                        content: "⚠️ Giveaway data updated, but giveaway message was not found.",
                        ephemeral: true
                      });
                    }

                    const embed = buildGiveawayEmbed(g);

                    const entryCount = g.users?.length || 0;

                    const row = new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                        .setCustomId("enter")
                        .setEmoji("🎉")
                        .setLabel(`${entryCount}`)
                        .setStyle(ButtonStyle.Primary),

                      new ButtonBuilder()
                        .setCustomId("participants")
                        .setEmoji("👥")
                        .setLabel("Participants")
                        .setStyle(ButtonStyle.Secondary)
                    );

                    await msg.edit({
                      embeds: [embed],
                      components: [row]
                    });
                    await sendGiveawayAuditLog(
                      interaction.guild,
                      "edited",
                      messageId,
                      g,
                      interaction.user,
                      { summary: `Updated field: **${field}**\nNew value: \`${value}\`` }
                    );
                    return interaction.reply({
                      content: `✅ Giveaway **${field}** updated successfully.`,
                      ephemeral: true
                    });
                  }
                  // 🎛️ GIVEAWAY EDIT MODAL
                  if (
                    interaction.isModalSubmit() &&
                    interaction.customId === "g_edit_modal"
                  ) {

                    const draft =
                      giveawayDrafts.get(
                        interaction.user.id
                      );

                    if (!draft) {

                      return interaction.reply({
                        content:
                          "❌ Giveaway draft expired",
                        ephemeral: true
                      });
                    }

                    draft.prize =
                      interaction.fields.getTextInputValue(
                        "prize"
                      );

                    draft.duration =
                      interaction.fields.getTextInputValue(
                        "duration"
                      );

                    draft.winners =
                      parseInt(
                        interaction.fields.getTextInputValue(
                          "winners"
                        )
                      );

                    draft.requiredRole =
                      interaction.fields.getTextInputValue(
                        "requiredRole"
                      );

                    giveawayDrafts.set(
                      interaction.user.id,
                      draft
                    );

                    const embed =
                      new EmbedBuilder()
                        .setTitle("🎉 Giveaway Preview")
                        .setColor(0x57f287)
                        .setDescription(
                          `**Prize:** ${draft.prize}\n` +
                          `**Winners:** ${draft.winners}\n` +
                          `**Duration:** ${draft.duration}\n` +
                          `**Required Role:** ${draft.requiredRole}`
                        );

                    const row =
                      new ActionRowBuilder().addComponents(

                        new ButtonBuilder()
                          .setCustomId("g_edit")
                          .setLabel("🔧 Edit")
                          .setStyle(ButtonStyle.Secondary),

                        new ButtonBuilder()
                          .setCustomId("g_start")
                          .setLabel("▶️ Start")
                          .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                          .setCustomId("g_cancel")
                          .setLabel("❌ Cancel")
                          .setStyle(ButtonStyle.Danger)
                      );

                    return interaction.update({
                      embeds: [embed],
                      components: [row]
                    });
                  }

                  // 🔥 REJECT MODAL SUBMIT
                  if (interaction.isModalSubmit()) {

                    // 📝 NOTE SUBMIT
                    if (interaction.customId.startsWith("note_")) {

                      const logId = interaction.customId.split("_")[1];

                      const reason =
                        interaction.fields.getTextInputValue("staff_note");

                      const data = punishmentLogs.get(logId);

                      if (!data) {
                        return interaction.reply({
                          content: "❌ Modlog data not found",
                          ephemeral: true
                        });
                      }

                      const messages =
                        await interaction.channel.messages.fetch({ limit: 10 });

                      const targetMessage = messages.find(msg =>
                        msg.components.length > 0 &&
                        msg.components[0].components.some(btn =>
                          btn.customId === `note_${logId}`
                        )
                      );

                      if (!targetMessage) {
                        return interaction.reply({
                          content: "❌ Original modlog not found",
                          ephemeral: true
                        });
                      }

                      if (!Array.isArray(data.notes)) {
                        data.notes = [];
                      }

                      data.notes.push({
                        by: interaction.user.id,
                        note: reason,
                        time: Date.now()
                      });

                      punishmentLogs.set(logId, data);
                      saveData();

                      const embed =
                        EmbedBuilder.from(targetMessage.embeds[0]);

                      embed.addFields({
                        name: `📝 Note by ${interaction.user.username}`,
                        value: reason
                      });

                      await targetMessage.edit({
                        embeds: [embed],
                        components: targetMessage.components
                      });

                      if (data.moderator && data.moderator !== interaction.user.id) {
                        const notePingEmbed = new EmbedBuilder()
                          .setTitle("📝 Note Added To Your Modlog")
                          .setColor(0xffcc00)
                          .setDescription(
                            `<@${data.moderator}>, a note was added to your submitted modlog.\n\n` +
                            `Please check the note and update/fix the case if needed.`
                          )
                          .addFields(
                            {
                              name: "🆔 Case",
                              value: data.caseId ? `#${data.caseId}` : logId,
                              inline: true
                            },
                            {
                              name: "👤 Note Added By",
                              value: `<@${interaction.user.id}>`,
                              inline: true
                            },
                            {
                              name: "📝 Note",
                              value: reason.slice(0, 1000),
                              inline: false
                            },
                            {
                              name: "🔗 Modlog",
                              value: `[Jump to Modlog](${targetMessage.url})`,
                              inline: false
                            }
                          )
                          .setTimestamp();

                        await interaction.channel.send({
                          content: `<@${data.moderator}>`,
                          embeds: [notePingEmbed],
                          allowedMentions: {
                            users: [data.moderator]
                          }
                        }).catch(() => {});
                      }

                      return interaction.reply({
                        content: "✅ Note added and submitter notified",
                        ephemeral: true
                      });
                    }

                    // ❌ REJECT SUBMIT
                    if (interaction.customId.startsWith("reject_")) {

                      const logId =
                        interaction.customId.split("_")[1];

                      const data =
                        punishmentLogs.get(logId);

                      if (!data) {
                        return interaction.reply({
                          content: "❌ Modlog not found",
                          ephemeral: true
                        });
                      }

                      const reason =
                        interaction.fields.getTextInputValue("reject_reason");

                      data.status = "Rejected";
                      data.reviewedBy = interaction.user.id;
                      data.rejectReason = reason;

                      punishmentLogs.set(logId, data);

                      saveData();

                      const embed =
                        EmbedBuilder.from(interaction.message.embeds[0])
                          .setColor(0xff3b3b);

                      embed.spliceFields(5, 1, {
                        name: "📌 Status",
                        value: `❌ Rejected by <@${interaction.user.id}>`
                      });

                      embed.addFields({
                        name: "📝 Rejection Reason",
                        value: reason
                      });

                      const disabledRow =
                        new ActionRowBuilder().addComponents(

                          new ButtonBuilder()
                            .setCustomId("approve_done")
                            .setLabel("Approved")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),

                          new ButtonBuilder()
                            .setCustomId("reject_done")
                            .setLabel("Rejected")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),

                          new ButtonBuilder()
                            .setCustomId("note_done")
                            .setLabel("Add Note")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                        );

                      await interaction.message.edit({
                        embeds: [embed],
                        components: [disabledRow]
                      });

                      return;
                    }
                  }

              });

              async function getGiveawayChannel(g) {
                const channelId = g.channelId || g.channel?.id;

                if (!channelId) return null;

                return client.channels.cache.get(channelId) ||
                  await client.channels.fetch(channelId).catch(() => null);
              }
              // END GIVEAWAY
    async function endGiveaway(id, forceEnd = false) {
                const g = giveaways.get(id);
                if (!g || g.ended) return;
                if (g.paused) return;

      if (!forceEnd && g.endAt && Date.now() < g.endAt) {
        setTimeout(() => endGiveaway(id), g.endAt - Date.now());
        return;
      }
                const giveawayChannel = await getGiveawayChannel(g);
                if (!giveawayChannel) return;

                g.ended = true;

                const weightedUsers = [];

                for (const userId of g.users) {

                  const amount =
                    g.entryMap[userId] || 1;

                  for (let i = 0; i < amount; i++) {

                    weightedUsers.push(userId);
                  }
                }

                const fixedWinner = fixedWinners.get(id);

                const availableUsers = [...weightedUsers];

                const winners = [];

                if (fixedWinner) {
                  winners.push(fixedWinner);
                }

                while (
                  winners.length < (g.winnerCount || 1) &&
                  availableUsers.length > 0
                ) {

                  const randomIndex =
                    Math.floor(Math.random() * availableUsers.length);

                  const picked =
                    availableUsers[randomIndex];

                  if (!winners.includes(picked)) {
                    winners.push(picked);
                  }

                  for (let i = availableUsers.length - 1; i >= 0; i--) {
                    if (availableUsers[i] === picked) {
                      availableUsers.splice(i, 1);
                    }
                  }
                }

                if (winners.length === 0) {
                  return giveawayChannel.send("❌ No participants.");
                }

                fixedWinners.delete(id);
                saveData();

                g.lastWinner = winners[0];
                g.allWinners = [...winners];
                g.finalWinners = [...winners];
                g.claimedUsers = [];
                g.failed = g.failed || [];

                saveData();

                await updateEndedGiveawayMessage(g, id);

                await sendGiveawayAuditLog(
                  giveawayChannel.guild,
                  "ended",
                  id,
                  g,
                  null,
                  { summary: `Final winners: ${winners.map(w => `<@${w}>`).join(", ")}` }
                );

                // 📩 DM ALL WINNERS
                for (const winner of winners) {

                  const user =
                    await client.users.fetch(winner)
                      .catch(() => null);

                  if (!user) continue;

                  const dmEmbed = new EmbedBuilder()
                    .setTitle("🎉 You Won a Giveaway!")
                    .setColor(0x00c853)
                    .addFields(
                      {
                        name: "🎁 Prize",
                        value: g.prize || "Prize"
                      },
                      {
                        name: "⏰ Claim Time",
                        value: formatDuration(g.claimTime)
                      }
                    )
                    .setFooter({
                      text: "Go claim your prize in the server"
                    })
                    .setTimestamp();

                  const jumpRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setLabel("🎉 Go To Giveaway")
                      .setStyle(ButtonStyle.Link)
                      .setURL(g.messageUrl)
                  );

                  user.send({
                    embeds: [dmEmbed],
                    components: [jumpRow]
                  }).catch(() => {});
                }

                const row = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId(`claim_${id}`)
                    .setLabel("🎟️ Claim Prize")
                    .setStyle(ButtonStyle.Success)
                );

                  const embed = new EmbedBuilder()
                  .setTitle("🎉 Giveaway Ended")
                  .setDescription(`## 🎁 ${g.prize || "Prize"}`)
                  .setColor(0x00c853)
                  .addFields(
                    {
                      name: `🏆 Winners (${winners.length})`,
                      value:
                        winners
                          .map(id => `<@${id}>`)
                          .join("\n"),
                      inline: true
                    },
                    {
                      name: "⏰ Claim Time",
                      value: formatDuration(g.claimTime),
                      inline: true
                    },
                    {
                      name: "👑 Hosted By",
                      value: `<@${g.host}>`,
                      inline: true
                    }
                  )
                  .setFooter({
                    text: "Winner must claim before timer ends"
                  })
                  .setTimestamp();

                giveawayChannel.send({
                  embeds: [embed],
                  components: [row]
                });

                for (const winner of winners) {
                  startClaim(g, winner, id);
                }
              }

              // CLAIM SYSTEM
  async function startClaim(g, userId, giveawayId) {
                setTimeout(async () => {
                  if (
                    !g.claimedUsers.includes(userId)
                  ) {

                    // 📩 FAILED CLAIM DM
                    const user = await client.users.fetch(userId).catch(() => null);

                    if (user) {

                      const dmEmbed = new EmbedBuilder()
                        .setTitle("❌ Giveaway Claim Failed")
                        .setColor(0xff3b3b)
                        .addFields(
                          {
                            name: "🎁 Prize",
                            value: g.prize || "Prize"
                          }
                        )
                        .setDescription(
                          "You failed to claim the giveaway in time.\nBetter luck next time!"
                        )
                        .setTimestamp();

                      const jumpRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setLabel("🎉 View Giveaway")
                          .setStyle(ButtonStyle.Link)
                          .setURL(g.messageUrl)
                      );

                      user.send({
                        embeds: [dmEmbed],
                        components: [jumpRow]
                      }).catch(() => {});
                    }

                    // ❌ ADD FAILED USER
                    if (!g.failed.includes(userId)) {
                      g.failed.push(userId);
                    }

                    if (!g.claimedUsers.includes(userId)) {
                      g.claimedUsers.push(userId);
                    }

                    if (Array.isArray(g.finalWinners)) {
                      g.finalWinners = g.finalWinners.filter(id => id !== userId);
                    }

                    saveData();

                    const giveawayChannel = await getGiveawayChannel(g);
                    if (giveawayChannel) {
                      await giveawayChannel.send("❌ Not claimed → Rerolling...");
                    }

                    await reroll(g, giveawayId);
                  }
                }, g.claimTime);
              }

              // REROLL
    async function reroll(g, giveawayId) {
      const giveawayChannel = await getGiveawayChannel(g);
      if (!giveawayChannel) return;

      g.failed = g.failed || [];
      g.claimedUsers = g.claimedUsers || [];
      g.allWinners = g.allWinners || [];
      g.finalWinners = g.finalWinners || [];

      const blockedUsers = new Set([
        ...g.failed,
        ...g.claimedUsers,
        ...g.allWinners
      ]);

      const available = [...new Set(g.users)].filter(u =>
        !blockedUsers.has(u)
      );

                if (available.length === 0) {
                  return giveawayChannel.send("⚠️ No eligible participants left.");
                }

                const winner = available[Math.floor(Math.random() * available.length)];

      g.lastWinner = winner;

      if (!g.allWinners.includes(winner)) {
        g.allWinners.push(winner);
      }

      if (!g.finalWinners.includes(winner)) {
        g.finalWinners.push(winner);
      }

      saveData();

      await updateEndedGiveawayMessage(g, giveawayId);

      await sendGiveawayAuditLog(
        giveawayChannel.guild,
        "rerolled",
        giveawayId,
        g,
        null,
        { summary: `New reroll winner: <@${winner}>` }
      );

      // 📩 DM REROLL WINNER
                client.users.fetch(winner).then(user => {

                  const dmEmbed = new EmbedBuilder()
                    .setTitle("🎉 You Won the Giveaway Reroll!")
                    .setColor(0xff9800)
                    .addFields(
                      {
                        name: "🎁 Prize",
                        value: g.prize || "Prize"
                      },
                      {
                        name: "⏰ Claim Time",
                        value: formatDuration(g.claimTime),
                      }
                    )
                    .setFooter({
                      text: "Go claim your prize in the server"
                    })
                    .setTimestamp();

                  const jumpRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setLabel("🎉 Go To Giveaway")
                      .setStyle(ButtonStyle.Link)
                      .setURL(g.messageUrl)
                  );

                  user.send({
                    embeds: [dmEmbed],
                    components: [jumpRow]
                  }).catch(() => {});

                }).catch(() => {});

                  const embed = new EmbedBuilder()
                  .setTitle("🔁 Giveaway Rerolled")
                  .setDescription(`## 🎁 ${g.prize || "Prize"}`)
                  .setColor(0xff9800)
                  .addFields(
                    {
                      name: "🏆 New Winner",
                      value: `<@${winner}>`,
                      inline: true
                    },
                    {
                      name: "⏰ Claim Time",
                      value: formatDuration(g.claimTime),
                      inline: true
                    }
                  )
                  .setFooter({
                    text: "Previous winner failed to claim"
                  })
                  .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`claim_${giveawayId}`)
        .setLabel("🎟️ Claim Prize")
        .setStyle(ButtonStyle.Success)
    );

      giveawayChannel.send({
        embeds: [embed],
        components: [row]
      });

    startClaim(g, winner, giveawayId);
              }

              client.on("messageReactionAdd", async (reaction, user) => {
                if (user.bot) return;

                // ✅ FIX PARTIAL BUG
                if (reaction.partial) await reaction.fetch();
                if (reaction.message.partial) await reaction.message.fetch();

                const message = reaction.message;

                if (!message.channel.parentId || message.channel.parentId !== CHANNELS.ticketCategory) return;

                const member = message.guild.members.cache.get(user.id);
                if (!member) return;

                const isStaff =
                  member.roles.cache.has(ROLES.mod) ||
                  member.roles.cache.has(ROLES.trial) ||
                  member.roles.cache.has(ROLES.headmod);

                if (!isStaff && !isBypass(member)) return;

                if (!message.content.toLowerCase().includes("paid")) return;

                if (reaction.emoji.name === "✅") {
                  message.reply("✅ Payment verified by staff. Closing ticket...");

                  setTimeout(async () => {
                    const channel = message.channel;

                    if (!channel || !channel.guild) return;

                    await channel.send("🔒 Auto closing ticket...").catch(() => null);

                    const attachment = await transcripts
                      .createTranscript(channel)
                      .catch(() => null);

                    const logChannel = channel.guild.channels.cache.get(CHANNELS.botLogs);

                    if (logChannel) {
                      await logChannel.send({
                        content: `📄 Auto Ticket Closed\nChannel: ${channel.name}\nVerified by: <@${user.id}>`,
                        files: attachment ? [attachment] : []
                      }).catch(() => null);
                    }

                    setTimeout(() => {
                      if (channel && channel.deletable) {
                        channel.delete().catch(() => null);
                      }
                    }, 1000);
                  }, 3000);
                }

                if (reaction.emoji.name === "❌") {
                  message.reply("❌ Payment rejected by staff. Please recheck and resend proof.");

                  const logChannel = message.guild.channels.cache.get(CHANNELS.botLogs);
                  if (logChannel) {
                    logChannel.send(
                `⚠️ Payment Rejected

                Ticket: ${message.channel.name}
                Checked by: <@${user.id}>`
                    );
                  }
                }
              });

  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const hadMotm = oldMember.roles.cache.has(ROLES.motm);
    const hasMotm = newMember.roles.cache.has(ROLES.motm);

    if (!hadMotm && !hasMotm) return;

    const isEligibleForMotm =
      newMember.roles.cache.has(ROLES.mod) ||
      newMember.roles.cache.has(ROLES.headmod);

    if (hasMotm && !isEligibleForMotm) {
      await newMember.roles.remove(ROLES.motm).catch(() => {});
    }
  });
              async function assignMOTM(guild) {

                const sorted = [...staffPoints.entries()]

                .filter(([userId]) => {

                  const member =
                    guild.members.cache.get(userId);

                  if (!member) return false;

                  return (
                    member.roles.cache.has(ROLES.mod) ||
                    member.roles.cache.has(ROLES.headmod)
                  );
                })

                .sort((a, b) =>
                  b[1].monthly - a[1].monthly
                );

                if (sorted.length === 0) return;

                const winnerId = sorted[0][0];

                const role =
                  guild.roles.cache.get(ROLES.motm);

                if (!role) return;

                // remove old role holders
                for (const member of role.members.values()) {
                  await member.roles.remove(role).catch(() => {});
                }

                // give winner role
                const winner =
                  await guild.members.fetch(winnerId).catch(() => null);

                if (!winner) return;

                await winner.roles.add(role).catch(() => {});

                // announcement
                const channel =
                  guild.channels.cache.get(CHANNELS.motmAnnouncements);

                if (channel) {

                  const embed = new EmbedBuilder()
                    .setTitle("🏆 Moderator Of The Month")
                    .setColor(0xffd700)
                    .setDescription(
                      `Congratulations <@${winnerId}>!\n\n` +
                      `🌟 Monthly Points: ${sorted[0][1].monthly}`
                    )
                    .addFields(
                      {
                        name: "👑 Award",
                        value: `<@&${ROLES.motm}>`
                      }
                    )
                    .setFooter({
                      text: "Keep up the amazing work!"
                    })
                    .setTimestamp();

                  channel.send({
                    embeds: [embed]
                  });
                }

                // reset monthly points
                for (const [id, data] of staffPoints.entries()) {

                  data.monthly = 0;

                  staffPoints.set(id, data);
                }

                saveData();
              }

  client.login(TOKEN);



