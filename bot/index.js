            console.log("BOT FILE STARTED");

            const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, EmbedBuilder, ModalBuilder,
                  TextInputBuilder,
                  TextInputStyle } = require("discord.js");
            const transcripts = require("discord-html-transcripts");
            const fs = require("fs");
            const strikes = new Map();
            const staffPoints = new Map();
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
              ultimate: "1500366242140258420",
              owner: "1500366242140258419",
              admin: "1500366242140258418",
              whitelist: "1500366242140258417",
              headmod: "1500366242123485196",
              mod: "1500366242123485195",
              trial: "1500366242123485194",
              cooldown: "1500366242022686845",
              motm: "1500366242123485197",
            };

            // CHANNELS
            const CHANNELS = {
              adminLogs: "1500366245399367818",
              botLogs: "1500366245399367816",
              ticketCategory: "1500366244145135660",
              ticketPanel: "1500366244145135661",
              strikeLogs: "1500366245399367818",
              modLogs: "1500370378307141762",
              motmAnnouncements: "1501905305544425532",
            };

            // STORAGE
            const giveaways = new Map();
            const fixedWinners = new Map();
            const activeCommands = new Set();
            const punishmentLogs = new Map();
            const banTracker = new Map();
            const giveawayDrafts = new Map();
            const messageStats = new Map();

            let caseCounter = 1000;


            // 💾 SAVE DATA
            function saveData() {

              const data = {
                strikes: Object.fromEntries(strikes),
                punishmentLogs: Object.fromEntries(punishmentLogs),
                staffPoints: Object.fromEntries(staffPoints),
                giveawayBlacklist:
                Object.fromEntries(giveawayBlacklist),
                giveaways: Object.fromEntries(giveaways),
                messageStats: Object.fromEntries(messageStats),
                caseCounter
              };

              fs.writeFileSync(
                "./data.json",
                JSON.stringify(data, null, 2)
              );
            }


            // 📂 LOAD DATA
            function loadData() {

              if (!fs.existsSync("./data.json")) return;

              const raw = fs.readFileSync("./data.json");

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
              }
            loadData();

            // LEVEL SYSTEM
            function getUserLevel(member) {
              if (!member) return 0;
              if (member.roles.cache.has(ROLES.owner) || member.roles.cache.has(ROLES.admin)) return 4;
              if (member.roles.cache.has(ROLES.whitelist)) return 3;
              if (member.roles.cache.has(ROLES.mod) || member.roles.cache.has(ROLES.headmod)) return 2;
              if (member.roles.cache.has(ROLES.trial)) return 1;
              return 0;
            }
            function isBypass(member) {
              if (!member) return false;

              return (
                member.roles.cache.has(ROLES.ultimate) ||
                member.roles.cache.has(ROLES.owner) ||
                member.roles.cache.has(ROLES.admin)
              );
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

              }, 3 * 24 * 60 * 60 * 1000); // 3 days
            }

            // READY
            client.on("ready", () => {
              console.log(`Logged in as ${client.user.tag}`);
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
                      "1500366242085732495"
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
                      "1500366242085732495"
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
                      "1500366242085732495"
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
                      "1500366242085732495"
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

            // ROLE GUARD
            client.on(
              "guildMemberUpdate",
              async (oldMember, newMember) => {

                try {

                  const addedRoles =
                    newMember.roles.cache.filter(
                      r =>
                        !oldMember.roles.cache.has(r.id)
                    );

                  if (!addedRoles.size) return;

                  const logs =
                    await newMember.guild.fetchAuditLogs({
                      limit: 1,
                      type: 25
                    });

                  const log =
                    logs.entries.first();

                  if (!log) return;

                  const executor =
                    await newMember.guild.members.fetch(
                      log.executor.id
                    );

                  // ✅ ALLOWED USERS
                    let allowed = false;

                    // 👑 OWNER / ADMIN / ULTIMATE
                    if (

                      executor.roles.cache.has(
                        ROLES.ultimate
                      ) ||

                      executor.roles.cache.has(
                        ROLES.owner
                      ) ||

                      executor.roles.cache.has(
                        ROLES.admin
                      ) ||

                      executor.roles.cache.has(
                        "1500366242085732495"
                      )

                    ) {

                      allowed = true;
                    }

                    // 🛡️ HEAD MOD LIMITED ROLES
                    else if (

                      executor.roles.cache.has(
                        "1500366242123485196"
                      )

                    ) {

                      const allowedRoles = [

                        "1500366242022686845", // Gwy Cooldown
                        "1500366242022686844", // Gwy Banned
                        "1500366242022686843", // Event Ban
                        "1500366242022686846", // BROOK ARMY
                        "1500366242052313120", // VALORANT
                        "1500366242110767138", // -
                        "1500366242110767137", // .
                        "1500366242123485198"  // Muted
                      ];

                      allowed = true;

                      for (
                        const role of addedRoles.values()
                      ) {

                        if (
                          !allowedRoles.includes(
                            role.id
                          )
                        ) {

                          allowed = false;
                          break;
                        }
                      }
                    }

                  // 🛡️ HEAD MOD
                  else if (

                    executor.roles.cache.has(
                      "1500366242123485196"
                    )

                  ) {

                    allowed = true;

                    for (
                      const role of addedRoles.values()
                    ) {

                      // ❌ ABOVE SEPARATOR
                      if (

                        role.position >=
                        separatorRole.position

                      ) {

                        allowed = false;
                        break;
                      }
                    }
                  }

                  // ✅ ALLOWED
                  if (allowed) return;

                  // ❌ REMOVE ALL ADDED ROLES
                  for (const role of addedRoles.values()) {

                    await newMember.roles.remove(
                      role.id
                    ).catch(() => {});
                  }

                  // 📋 ROLE LIST
                  const roleList =
                    addedRoles.map(r =>
                      `<@&${r.id}>`
                    ).join(", ");

                  // 📢 LOG EMBED
                  const embed =
                    new EmbedBuilder()
                      .setTitle(
                        "🚨 Role Abuse Prevented"
                      )
                      .setColor(0xff3b3b)
                      .addFields(
                        {
                          name: "👤 Abuser",
                          value:
                            `<@${executor.id}>`,
                          inline: true
                        },
                        {
                          name: "🎯 Target",
                          value:
                            `<@${newMember.id}>`,
                          inline: true
                        },
                        {
                          name: "🛡️ Roles Added",
                          value:
                            roleList,
                          inline: false
                        }
                      )
                      .setTimestamp();

                  const logChannel =
                    newMember.guild.channels.cache.get(
                      CHANNELS.adminLogs
                    );

                  if (logChannel) {

                    logChannel.send({
                      embeds: [embed]
                    });
                  }

                } catch (err) {

                  console.log(
                    "Role Guard Error:",
                    err
                  );
                }
              }
            );


            // COMMAND HANDLER (ONLY ONE)
            client.on("messageCreate", async (message) => {
              if (message.author.bot) return;
              // 📊 MESSAGE TRACKER
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

              // 🚨 ANTI EVERYONE PING
              if (

                message.content.includes("@everyone") ||
                message.content.includes("@here")

              ) {

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
                    "1500366242085732495"
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
              if (!message.content.startsWith(PREFIX)) return;

              const member = message.member;
              const level = getUserLevel(member);
              if (level === 0) return message.reply("❌ No permission");

              const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
              const cmd = args.shift().toLowerCase();

              // HELP
              // 🌙 HELP COMMAND
              if (cmd === "help") {
                const isPrivileged =

                message.member.permissions.has(
                  PermissionsBitField.Flags.Administrator
                )

                ||

                  message.member.roles.cache.has(
                    ROLES.owner
                  )

                ||

                  message.member.roles.cache.has(
                    ROLES.ultimate
                  );

                const embed =
                  new EmbedBuilder()
                    .setTitle("🌙 Lunar Help Menu")
                    .setColor(0x5865f2)

                    .setDescription(
                      "Advanced Moderation & Giveaway System"
                    )

                  .addFields(

                    {
                      name: "🎉 Giveaway Commands",
                      value:
                        "`.gstart` → Start quick giveaway\n" +
                        "`.greroll` → Reroll giveaway winners\n" +
                        "`.gend` → End giveaway instantly\n" +
                        "`.gpause` → Pause giveaway\n" +
                        "`.gresume` → Resume paused giveaway\n" +
                        "`.greq` → Set giveaway requirements\n" +
                        "`.gblacklist` → Blacklist user from giveaways\n" +
                        "`.gunblacklist` → Remove giveaway blacklist\n" +
                        "`.gblacklists` → View blacklisted users",
                      inline: false
                    },

                    {
                      name: "👮 Moderation Commands",
                      value:
                        "`.strike` → Strike a user\n" +
                        "`.removestrike` → Remove strike\n" +
                        "`.strikes` → View strikes\n" +
                        "`.clearstrikes` → Clear all strikes\n" +
                        "`.modlog` → View moderation logs\n" +
                        "`.modlogs` → View all moderation cases\n" +
                        "`.case` → View specific case\n" +
                        "`.close` → Close tickets/channels",
                      inline: false
                    },

                    {
                      name: "📊 Message Commands",
                      value:
                        "`.messages` → View message stats\n" +
                        "`.messagelb` → View message leaderboard\n" +
                        "`.addmessages` → Add messages\n" +
                        "`.removemessages` → Remove messages\n" +
                        "`.setmessages` → Set message count\n" +
                        "`.resetdaily` → Reset daily messages\n" +
                        "`.resetweekly` → Reset weekly messages\n" +
                        "`.resetmonthly` → Reset monthly messages",
                      inline: false
                    },

                    {
                      name: "👑 Staff Commands",
                      value:
                        "`.staffstats` → Staff activity stats\n" +
                        "`.stafflb` → Staff leaderboard\n" +
                        "`.motm` → Moderator of the month",
                      inline: false
                    },

                    {
                      name: "🛡️ Security Systems",
                      value:
                        "`Anti Bot Add` → Prevent bot abuse\n" +
                        "`Anti Channel Delete` → Protect channels\n" +
                        "`Anti Role Delete` → Protect roles\n" +
                        "`Anti Mass Ban` → Prevent mass bans\n" +
                        "`Anti Everyone Ping` → Prevent ping abuse\n" +
                        "`Role Guard` → Prevent role abuse",
                      inline: false
                    },

                    {
                      name: "⚙️ Utility",
                      value:
                        "`.help` → Show help menu\n" +
                        "`.test` → Test bot response",
                      inline: false
                    }
                  )

                    .setFooter({
                      text:
                        "Lunar • Advanced Discord System"
                    })

                    .setTimestamp();

                const row =
                  new ActionRowBuilder()
                    .addComponents(

                      new ButtonBuilder()
                        .setLabel("Support Server")
                        .setStyle(ButtonStyle.Link)
                      .setURL("https://discord.gg/YQCSFBhyyV")

                    );

                return message.channel.send({
                  embeds: [embed],
                  components: [row]
                });
              }

              // 🏆 MESSAGE LEADERBOARD
              if (cmd === "messagelb") {

                const sorted =
                  [...messageStats.entries()]
                    .sort(
                      (a, b) =>
                      b[1].total -
                      a[1].total
                    )
                    .slice(0, 10);

                if (sorted.length === 0) {

                  return message.reply(
                    "❌ No message data found"
                  );
                }

                let text = "";

                sorted.forEach(
                  (entry, index) => {

                    const userId = entry[0];
                    const stats = entry[1];
                    if (!stats.total) {

                      stats.total =
                        (stats.daily || 0) +
                        (stats.weekly || 0) +
                        (stats.monthly || 0);
                    }

                    text +=
                      `🏆 **#${index + 1}** • <@${userId}>\n` +
                      `💬 Total Messages: ${stats.total}\n\n`;
                  }
                );

                const embed =
                  new EmbedBuilder()
                    .setTitle(
                      "🏆 Message Leaderboard"
                    )
                    .setColor(0xffd700)
                    .setDescription(text)
                    .setTimestamp();

                return message.channel.send({
                  embeds: [embed]
                });
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

                if (!isNaN(args[2])) {

                  winnerCount = parseInt(args[2]);

                  prize = args.slice(3).join(" ");

                } else {

                  prize = args.slice(2).join(" ");
                }

                if (!prize) prize = "Prize";

                const row = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId("enter").setLabel("🎉 Enter").setStyle(ButtonStyle.Primary)
                );

                const embed = new EmbedBuilder()
                  .setTitle("🎉 Giveaway Started")
                  .setColor(0xff4d6d)
                  .addFields(
                    {
                      name: "🎁 Prize",
                      value: prize,
                      inline: true
                    },
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
                  prize, // 🔥 ADD THIS
                  channel: message.channel,
                  ended: false,
                      ended: false,
                      lastWinner: null,
                      allWinners: [],
                      claimedUsers: [],
                      failed: [],
                  host: message.author.id,
                  messageUrl: msg.url
                });
                addPoints(message.author.id, "giveaway");
                saveData();
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
                if (!user || !id) return message.reply("Usage: .gfix @user messageId");

                fixedWinners.set(id, user.id);
                message.reply("Winner fixed 😈");
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

                message.channel.send({
                  content: "⚠️ **Confirm Ticket Close?**",
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

                if (current.length >= 5) {

                  const targetMember = message.guild.members.cache.get(user.id);
                  if (!targetMember) return;

                  if (targetMember.roles.cache.has(ROLES.trial)) {
                    targetMember.roles.remove(ROLES.trial);
                    message.channel.send(`🚫 Trial Mod role removed from <@${user.id}>`);
                  }

                  else if (targetMember.roles.cache.has(ROLES.mod)) {
                    targetMember.roles.remove(ROLES.mod);
                    message.channel.send(`🚫 Mod role removed from <@${user.id}>`);
                  }

                  else if (targetMember.roles.cache.has(ROLES.headmod)) {
                    message.channel.send(
              `⚠️ Head Mod reached 5 strikes!

              <@&${ROLES.admin}> please review this situation.`
                    );
                  }
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

               const data = staffPoints.get(user.id) || {
                 total: 0,
                 modlogs: 0,
                 tickets: 0,
                 giveaways: 0,
                 strikes: 0
               };

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
                     name: "✅ Approved Modlogs",
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
                     name: "⚠️ Strikes Given",
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
                        value: `${g.claimTime / 1000}s`
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

                startClaim(g, winner);
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
                endGiveaway(messageId);

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

                g.paused = false;

                saveData();

                const msg =
                  await g.channel.messages.fetch(messageId)
                    .catch(() => null);

                if (msg) {

                  const button =
                    new ButtonBuilder()
                      .setCustomId("giveaway_enter")
                      .setLabel("🎉 Enter")
                      .setStyle(ButtonStyle.Primary);

                  const row =
                    new ActionRowBuilder().addComponents(button);

                  await msg.edit({
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
                // allow slash + buttons + modals
                if (
                  !interaction.isButton() &&
                  !interaction.isModalSubmit() &&
                  !interaction.isChatInputCommand()
                ) return;
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
                    .setColor(0xff4d6d)
                    .addFields(
                      {
                        name: "🎁 Prize",
                        value: prize,
                        inline: true
                      },
                      {
                        name: "⏰ Duration",
                        value: durationInput,
                        inline: true
                      },
                      {
                        name: "👑 Hosted By",
                        value: `<@${interaction.user.id}>`,
                        inline: true
                      },
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
                    prize,
                    requiredDaily: 0,
                    requiredWeekly: 0,
                    requiredMonthly: 0,
                    channel: interaction.channel,
                    ended: false,
                    lastWinner: null,
                    failed: [],
                    host: interaction.user.id,
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

                  const user =
                    interaction.options.getUser("user");

                  const reason =
                    interaction.options.getString("reason");

                  const targetMember =
                    interaction.guild.members.cache.get(user.id);

                  if (!targetMember) {
                    return interaction.reply({
                      content: "❌ User not found",
                      ephemeral: true
                    });
                  }
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
                
                // 🌙 SLASH HELP
                if (
                  interaction.isChatInputCommand() &&
                  interaction.commandName === "help"
                ) {

                  const embed =
                    new EmbedBuilder()
                      .setTitle("🌙 Lunar Help Menu")
                      .setColor(0x5865f2)

                      .setDescription(
                        "Advanced Moderation & Giveaway System"
                      )

                      .addFields(

                        {
                          name: "🎉 Giveaway Commands",
                          value:
                            "`.gstart` → Start giveaway\n" +
                            "`.greroll` → Reroll giveaway\n" +
                            "`.gend` → End giveaway\n" +
                            "`.gpause` → Pause giveaway\n" +
                            "`.gresume` → Resume giveaway",
                          inline: false
                        },

                        {
                          name: "👮 Moderation Commands",
                          value:
                            "`.strike` → Strike staff\n" +
                            "`.modlog` → Submit modlog\n" +
                            "`.close` → Close ticket",
                          inline: false
                        },

                        {
                          name: "📊 Staff Commands",
                          value:
                            "`.staffstats` → Staff stats\n" +
                            "`.stafflb` → Staff leaderboard\n" +
                            "`.motm` → Moderator of month\n" +
                            "`.addpoints` → Add staff points",
                          inline: false
                        },

                        {
                          name: "⚙️ Utility",
                          value:
                            "`.messages`\n" +
                            "`.messagelb`\n" +
                            "`.help`",
                          inline: false
                        }
                      )

                      .setFooter({
                        text:
                          "Lunar • Advanced Discord System"
                      })

                      .setTimestamp();

                  const row =
                    new ActionRowBuilder()
                      .addComponents(

                        new ButtonBuilder()
                          .setLabel("Support Server")
                          .setStyle(ButtonStyle.Link)
                          .setURL(
                            "https://discord.gg/YQCSFBhyyV"
                          )
                      );

                  return interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: true
                  });
                }
                
                // 🎉 PREMIUM GIVEAWAY CREATE
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "giveaway" &&
                    interaction.options.getSubcommand() === "create"
                  ) {

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

                    const claimTime =
                      (
                        interaction.options.getInteger(
                          "claimtime"
                        ) || 30
                      ) * 1000;

                    const channel =
                      interaction.options.getChannel(
                        "channel"
                      );

                    const host =
                      interaction.options.getUser(
                        "host"
                      ) || interaction.user;

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
                      `<@&1500366242052313120> • +3 entries\n`;

                    extraEntriesText +=
                      `<@&1500366242110767134> • +3 entries\n`;

                    extraEntriesText +=
                      `<@&1500366242085732500> • +2 entries`;

                    const row =
                      new ActionRowBuilder()
                        .addComponents(

                          new ButtonBuilder()
                            .setCustomId("enter")
                            .setLabel("🎉 0")
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
                        .setColor(0xff4d6d)

                      .addFields(

                        {
                          name: "🎁 Prize",
                          value: prize,
                          inline: true
                        },

                        {
                          name: "👑 Winners",
                          value: `${winners}`,
                          inline: true
                        },

                        {
                          name: "⏰ Duration",
                          value: durationInput,
                          inline: true
                        },

                        {
                          name: "👤 Hosted By",
                          value: `<@${host.id}>`,
                          inline: false
                        },

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

                      requiredDaily,
                      requiredWeekly,
                      requiredMonthly,

                      requiredRole:
                        requiredRole
                          ? requiredRole.id
                          : "none",

                      channel,
                      ended: false,
                      lastWinner: null,
                      allWinners: [],
                      claimedUsers: [],
                      failed: [],

                      host: host.id,

                      messageUrl: msg.url
                    });

                    saveData();

                    setTimeout(
                      () => endGiveaway(msg.id),
                      duration
                    );

                    return interaction.reply({

                      content:
                        "✅ Premium giveaway created",

                      ephemeral: true
                    });
                  }

                // 📘 HELP COMMAND
                  if (
                    interaction.isChatInputCommand() &&
                    interaction.commandName === "help"
                  ) {

                    const embed =
                      new EmbedBuilder()
                        .setTitle("🌙 Lunar Help Menu")
                        .setColor(0x5865f2)
                        .setDescription(
                          "Select a category below to view commands and systems."
                        )
                      .addFields(

                        {
                          name: "🎉 Giveaway Commands",
                          value:
                            "`/giveaway create` → Create premium giveaways\n" +
                            "`.gstart` → Start quick giveaway\n" +
                            "`.greroll` → Reroll giveaway winners\n" +
                            "`.gend` → End giveaway instantly\n" +
                            "`.gpause` → Pause giveaway\n" +
                            "`.gresume` → Resume paused giveaway\n" +
                            "`.greq` → Set giveaway requirements\n" +
                            "`.gblacklist` → Blacklist user from giveaways\n" +
                            "`.gunblacklist` → Remove giveaway blacklist\n" +
                            "`.gblacklists` → View blacklisted users",
                          inline: false
                        },

                        {
                          name: "👮 Moderation Commands",
                          value:
                            "`/strike` → Give strike to user\n" +
                            "`.strike` → Strike a member\n" +
                            "`.removestrike` → Remove strike\n" +
                            "`.strikes` → View user strikes\n" +
                            "`.clearstrikes` → Clear all strikes\n" +
                            "`.modlog` → View moderation logs\n" +
                            "`.modlogs` → Show all mod cases\n" +
                            "`.case` → View specific case\n" +
                            "`.close` → Close ticket/channel",
                          inline: false
                        },

                        {
                          name: "📊 Message Commands",
                          value:
                            "`.messages` → View message stats\n" +
                            "`.messagelb` → Message leaderboard\n" +
                            "`.addmessages` → Add messages to user\n" +
                            "`.removemessages` → Remove messages\n" +
                            "`.setmessages` → Set exact message count\n" +
                            "`.resetdaily` → Reset daily messages\n" +
                            "`.resetweekly` → Reset weekly messages\n" +
                            "`.resetmonthly` → Reset monthly messages",
                          inline: false
                        },

                        {
                          name: "🎉 Giveaway Commands",
                          value:
                            "`.gstart` → Start quick giveaway\n" +
                            "`.greroll` → Reroll giveaway winners\n" +
                            "`.gend` → End giveaway instantly\n" +
                            "`.gpause` → Pause giveaway\n" +
                            "`.gresume` → Resume paused giveaway\n" +
                            "`.greq` → Set giveaway requirements\n" +
                            "`.gblacklist` → Blacklist user from giveaways\n" +
                            "`.gunblacklist` → Remove giveaway blacklist\n" +
                            "`.gblacklists` → View blacklisted users",
                          inline: false
                        },

                          {
                            name: "🛡️ Security Systems",
                          value:
                            "`Anti Bot Add` → Prevent unauthorized bots\n" +
                            "`Anti Channel Delete` → Protect channels\n" +
                            "`Anti Role Delete` → Protect roles\n" +
                            "`Anti Mass Ban` → Prevent ban nukes\n" +
                            "`Anti Everyone Ping` → Stop ping abuse\n" +
                            "`Role Guard` → Prevent role abuse",
                          inline: false
                        },

                        {
                          name: "⚙️ Utility",
                          value:
                            "`.help` → Show help menu\n" +
                            "`.test` → Test bot response",
                          inline: false
                        }
                      )
                        .setFooter({
                          text:
                            "Lunar • Advanced Moderation System"
                        })
                        .setTimestamp();

                    const row =
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
                      );

                    return interaction.reply({
                      embeds: [embed],
                      components: [row],
                      ephemeral: true
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
                            `• <@&1500366242110767134>: +3 entries\n` +
                            `• <@&1500366242085732500>: +2 entries`,
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

                    saveData();

                    setTimeout(() => {
                      endGiveaway(msg.id);
                    }, duration);

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

                // 🎉 ENTER BUTTON
                if (
                  interaction.isButton() &&
                  interaction.customId === "enter"
                ) {
                const g = giveaways.get(interaction.message.id);
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


                  // 🌅 DAILY CHECK
                  if (
                    Number(g.requiredDaily) > 0 &&
                    stats.daily <
                      Number(g.requiredDaily)
                  ) {

                    return interaction.reply({
                      content:
                        `❌ You need ${g.requiredDaily} daily messages to enter.`,
                      ephemeral: true
                    });
                  }

                  // 📅 WEEKLY CHECK
                  if (
                    Number(g.requiredWeekly) > 0 &&
                    stats.weekly <
                      Number(g.requiredWeekly)
                  ) {

                    return interaction.reply({
                      content:
                        `❌ You need ${g.requiredWeekly} weekly messages to enter.`,
                      ephemeral: true
                    });
                  }

                  // 🗓️ MONTHLY CHECK
                  if (
                    Number(g.requiredMonthly) > 0 &&
                    stats.monthly <
                      Number(g.requiredMonthly)
                  ) {

                    return interaction.reply({
                      content:
                        `❌ You need ${g.requiredMonthly} monthly messages to enter.`,
                      ephemeral: true
                    });
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
                  } {

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
                if (!g) return;
                  // 🎭 REQUIRED ROLE CHECK
                  if (
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
                      "1500366242140258415"
                    )
                  ) {

                    bonus = Math.max(bonus, 3);
                  }

                  // 💎 3B BOUNTY
                  if (
                    interaction.member.roles.cache.has(
                      "1500366242110767134"
                    )
                  ) {

                    bonus = Math.max(bonus, 3);
                  }

                  // 🛡️ 20M BOUNTY
                  if (
                    interaction.member.roles.cache.has(
                      "1500366242085732500"
                    )
                  ) {

                    bonus = Math.max(bonus, 2);
                  }

                  const totalEntries = 1 + bonus;

                  g.users.push(interaction.user.id);

                  g.entryMap[interaction.user.id] =
                    totalEntries;

                saveData();

                const embed = EmbedBuilder.from(interaction.message.embeds[0]);

                  embed.data.fields[0] = {
                    name: "🎟️ Entries",
                    value: `${g.users.length}`,
                    inline: true
                  };

                await interaction.update({
                  embeds: [embed],
                  components: interaction.message.components
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
                g.channel.send(`✅ <@${interaction.user.id}> claimed in time`);

                const guild = interaction.guild;
                const member = guild.members.cache.get(interaction.user.id);

                // 🎫 CREATE TICKET
                const hostId = g.host;

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


                // ✅ SEND MESSAGES
                channel.send(
                `👋 **Welcome <@${interaction.user.id}>**

                🎁 **Prize Claim Ticket**

                👤 Host: <@${hostId}>

                ━━━━━━━━━━━━━━━

                💰 **Payment Process**

                **Host:**
                • Send payment to winner  
                • Upload screenshot  
                • Type **paid**

                **Staff:**
                • Verify screenshot  
                • React with:
                ✅ = Paid  
                ❌ = Not Paid

                ━━━━━━━━━━━━━━━`
                );

                const logChannel = guild.channels.cache.get(CHANNELS.botLogs);
                if (logChannel) {
                  logChannel.send(
                `📜 Claim Log

                User: <@${interaction.user.id}>
                Host: <@${hostId}>
                Ticket: ${channel}`
                  );
                }

                  g.claimedUsers.push(interaction.user.id);

                  if (member) {

                    await member.roles.add(ROLES.cooldown)
                      .catch(() => {});

                    removeCooldownLater(member);
                  }

                  saveData();
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
                  member.roles.cache.has(ROLES.trial);

                if (!isStaff && !isBypass(member)) {
                  return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
                }

                await interaction.deferUpdate(); // ⭐ fixes error

                  addPoints(interaction.user.id, "ticket");
                  interaction.channel.send("🔒 Closing ticket in 3 seconds...");

                const logChannel = interaction.guild.channels.cache.get(CHANNELS.botLogs);
                if (logChannel) {
                  logChannel.send(
              `📕 Ticket Closed

              Channel: ${interaction.channel}
              Closed by: <@${interaction.user.id}>`
                  );
                }

                setTimeout(async () => {

                  const channel = interaction.channel;
                  const attachment = await transcripts.createTranscript(channel);

                  const logChannel = interaction.guild.channels.cache.get(CHANNELS.botLogs);

                  if (logChannel) {
                    logChannel.send({
                      content: `📄 Ticket Closed: ${channel.name}`,
                      files: [attachment]
                    });
                  }

                  await channel.delete().catch(() => {});

                }, 3000);
              }


              // ❌ CANCEL CLOSE
                if (
                  interaction.isButton() &&
                  interaction.customId === "close_cancel"
                ) {
              return interaction.reply({ content: "❌ Ticket close cancelled", ephemeral: true });
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

                    return interaction.reply({
                      content: "✅ Note added",
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

            // END GIVEAWAY
            async function endGiveaway(id) {
              const g = giveaways.get(id);
              if (!g || g.ended) return;

              g.ended = true;

              const weightedUsers = [];

              for (const userId of g.users) {

                const amount =
                  g.entryMap[userId] || 1;

                for (let i = 0; i < amount; i++) {

                  weightedUsers.push(userId);
                }
              }

              const availableUsers = [...weightedUsers];

              const winners = [];

              while (
                winners.length < (g.winnerCount || 1) &&
                availableUsers.length > 0
              ) {

                const randomIndex =
                  Math.floor(Math.random() * availableUsers.length);

                const picked =
                  availableUsers[randomIndex];

                winners.push(picked);

                availableUsers.splice(randomIndex, 1);
              }
              if (winners.length === 0) {
                return g.channel.send("❌ No participants.");
              }

              g.lastWinner = winners[0];
              g.allWinners = winners;
              g.claimedUsers = [];

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
                      value: `${g.claimTime / 1000}s`
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
                    name: "🎁 Prize",
                    value: g.prize || "Prize",
                    inline: true
                  },
                  {
                    name: "⏰ Claim Time",
                    value: `${g.claimTime / 1000}s`,
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

              g.channel.send({
                embeds: [embed],
                components: [row]
              });

              for (const winner of winners) {
                startClaim(g, winner);
              }
            }

            // CLAIM SYSTEM
            async function startClaim(g, userId) {
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
                  g.failed.push(userId);
                  g.claimedUsers.push(userId);

                  saveData();

                  g.channel.send("❌ Not claimed → Rerolling...");

                  reroll(g);
                }
              }, g.claimTime);
            }

            // REROLL
            function reroll(g) {

              const available = g.users.filter(u =>
                !g.failed.includes(u) &&
                !g.claimedUsers.includes(u)
              );

              if (available.length === 0) {
                return g.channel.send("⚠️ No eligible participants left.");
              }

              const winner = available[Math.floor(Math.random() * available.length)];

              g.lastWinner = winner;

              if (!g.allWinners.includes(winner)) {
                g.allWinners.push(winner);
              }

              saveData();
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
                      value: `${g.claimTime / 1000}s`
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
                .setColor(0xff9800)
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
                  },
                  {
                    name: "⏰ Claim Time",
                    value: `${g.claimTime / 1000}s`,
                    inline: true
                  }
                )
                .setFooter({
                  text: "Previous winner failed to claim"
                })
                .setTimestamp();

              g.channel.send({
                embeds: [embed]
              });
              startClaim(g, winner);
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

                  // send message safely
                  await channel.send("🔒 Auto closing ticket...").catch(() => {});
                  const attachment = await transcripts.createTranscript(channel);

                  const logChannel = message.guild.channels.cache.get(CHANNELS.botLogs);
                  if (logChannel) {
                    logChannel.send({
                      content: `📄 Auto Ticket Closed\nChannel: ${channel.name}\nVerified by: <@${user.id}>`,
                      files: [attachment]
                    });
                  }

                  // small delay before delete
                  setTimeout(() => {
                    channel.delete().catch(() => {});
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