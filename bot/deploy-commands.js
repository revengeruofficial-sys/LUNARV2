require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [

  new SlashCommandBuilder()
    .setName("gstart")
    .setDescription("Start a giveaway")
    .addStringOption(option =>
      option
        .setName("duration")
        .setDescription("Example: 1m")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("claim")
        .setDescription("Example: 30s")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("prize")
        .setDescription("Giveaway prize")
        .setRequired(true)
    )
  .addUserOption(option =>
    option
      .setName("sponsor")
      .setDescription("Giveaway sponsor")
      .setRequired(false)
  ),
  new SlashCommandBuilder()
  .setName("giveaway")
  .setDescription("Advanced giveaway system")

  .addSubcommand(sub =>
    sub
      .setName("create")
      .setDescription(
        "Create a premium giveaway"
      )

      // 🎁 PRIZE
      .addStringOption(option =>
        option
          .setName("prize")
          .setDescription(
            "Giveaway prize"
          )
          .setRequired(true)
      )

      // ⏰ DURATION
      .addStringOption(option =>
        option
          .setName("duration")
          .setDescription(
            "Example: 1m, 1h"
          )
          .setRequired(true)
      )

      // 👑 WINNERS
      .addIntegerOption(option =>
        option
          .setName("winners")
          .setDescription(
            "Number of winners"
          )
          .setRequired(true)
      )

      // 📢 CHANNEL
      .addChannelOption(option =>
        option
          .setName("channel")
          .setDescription(
            "Giveaway channel"
          )
          .setRequired(true)
      )

    // ⏳ CLAIM TIME
    .addStringOption(option =>
      option
        .setName("claimtime")
        .setDescription(
          "Claim time: 30s, 2m, 1h"
        )
        .setRequired(false)
    )

      // 👤 HOST
      .addUserOption(option =>
        option
          .setName("host")
          .setDescription(
            "Giveaway host"
          )
          .setRequired(false)
      )
    // 🎖️ SPONSOR
    .addUserOption(option =>
      option
        .setName("sponsor")
        .setDescription("Giveaway sponsor")
        .setRequired(false)
    )

      // 🌅 DAILY
      .addIntegerOption(option =>
        option
          .setName("daily")
          .setDescription(
            "Required daily messages"
          )
          .setRequired(false)
      )

      // 📅 WEEKLY
      .addIntegerOption(option =>
        option
          .setName("weekly")
          .setDescription(
            "Required weekly messages"
          )
          .setRequired(false)
      )

      // 🗓️ MONTHLY
      .addIntegerOption(option =>
        option
          .setName("monthly")
          .setDescription(
            "Required monthly messages"
          )
          .setRequired(false)
      )

      // 🎭 REQUIRED ROLE
  .addRoleOption(option =>
    option
      .setName("requiredrole")
      .setDescription(
        "Required role to join"
      )
      .setRequired(false)
  )
  )

                 .addSubcommand(sub =>
                   sub
                     .setName("edit")
                     .setDescription("Edit an ongoing giveaway")
                     .addStringOption(option =>
                       option
                         .setName("messageid")
                         .setDescription("Giveaway message ID")
                         .setRequired(true)
                     )
                 )

                 .addSubcommand(sub =>
                   sub
                     .setName("removeuser")
                     .setDescription("Remove a user from an active giveaway")
                     .addStringOption(option =>
                       option
                         .setName("messageid")
                         .setDescription("Giveaway message ID")
                         .setRequired(true)
                     )
                     .addUserOption(option =>
                       option
                         .setName("user")
                         .setDescription("User to remove")
                         .setRequired(true)
                     )
                 ),
  new SlashCommandBuilder()
  .setName("strike")
  .setDescription("Strike a staff member")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Staff member")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Strike reason")
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName("modlog")
  .setDescription("Submit a moderation log")

  .addStringOption(option =>
    option
      .setName("type")
      .setDescription("Punishment type")
      .setRequired(true)

      .addChoices(
        { name: "Warn", value: "Warn" },
        { name: "Timeout", value: "Timeout" },
        { name: "Kick", value: "Kick" },
        { name: "Ban", value: "Ban" }
      )
  )

  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Punished user")
      .setRequired(true)
  )

  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Punishment reason")
      .setRequired(true)
  )

  .addAttachmentOption(option =>
    option
      .setName("proof")
      .setDescription("Proof image/video")
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName("addpoints")
  .setDescription("Add staff points")

  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("Staff member")
      .setRequired(true)
  )

  .addIntegerOption(option =>
    option
      .setName("amount")
      .setDescription("Points amount")
      .setRequired(true)
  )

  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Reason")
      .setRequired(false)
  ),
  new SlashCommandBuilder()
  .setName("staff")
  .setDescription("Staff profile and management")
  .addSubcommand(sub =>
    sub
      .setName("profile")
      .setDescription("View a staff profile")
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("Staff user")
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("rate")
      .setDescription("Give +1 daily rating to a staff member")
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("Staff member to rate")
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("resetmonth")
      .setDescription("Reset monthly staff points")
      .addBooleanOption(option =>
        option
          .setName("confirm")
          .setDescription("Confirm monthly reset")
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("weeklyreport")
      .setDescription("View weekly staff activity report")
  )
  .addSubcommand(sub =>
    sub
      .setName("inactivity")
      .setDescription("Request approved inactivity leave")
      .addIntegerOption(option =>
        option
          .setName("days")
          .setDescription("How many days you will be inactive")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("reason")
          .setDescription("Why you will be inactive")
          .setRequired(true)
      )
  ),
  new SlashCommandBuilder()
    .setName("cases")
    .setDescription("View moderation cases")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Filter cases for a specific user")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your or another member's profile")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Member to view")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
  .setName("appeal")
  .setDescription("Submit a giveaway ban appeal"),
  new SlashCommandBuilder()
    .setName("event")
    .setDescription("Blox Fruits event announcement system")
    .addSubcommand(sub =>
      sub
        .setName("announce")
        .setDescription("Announce a Blox Fruits event")
        .addStringOption(option =>
          option
            .setName("type")
            .setDescription("Event type")
            .setRequired(true)
            .addChoices(
              { name: "Leviathan - Hydra", value: "levi_hydra" },
              { name: "Leviathan - Tiki", value: "levi_tiki" },
              { name: "Mirage Hunt", value: "mirage" },
              { name: "Sea Beast", value: "sea_beast" },
              { name: "Fools Gold", value: "fools_gold" },
              { name: "Indra", value: "indra" },
              { name: "Dough King", value: "dough_king" },
              { name: "Prehistoric Island", value: "prehistoric" },
              { name: "Kitsune Shrine", value: "kitsune" },
              { name: "CD Removal", value: "cd_removal" },
              { name: "Custom Event", value: "custom" }
            )
        )
        .addStringOption(option =>
          option
            .setName("private_server")
            .setDescription("Roblox private server link")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("time")
            .setDescription("Event time, example: Now / 5 PM / after 10m")
            .setRequired(true)
        )
        .addUserOption(option =>
          option
            .setName("host")
            .setDescription("Event host")
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName("slots")
            .setDescription("Slots, example: 8/12")
            .setRequired(false)
        )
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("Announcement channel")
            .setRequired(false)
        )
    )
  .addSubcommand(sub =>
    sub
      .setName("edit")
      .setDescription("Edit an active event announcement")
      .addStringOption(option =>
        option
          .setName("messageid")
          .setDescription("Event message ID")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("time")
          .setDescription("New event time")
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName("private_server")
          .setDescription("New Roblox private server link")
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName("slots")
          .setDescription("New slots, example: 8/12")
          .setRequired(false)
      )
      .addUserOption(option =>
        option
          .setName("host")
          .setDescription("New event host")
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("end")
      .setDescription("End an active event announcement")
      .addStringOption(option =>
        option
          .setName("messageid")
          .setDescription("Event message ID")
          .setRequired(true)
      )
  ),
  new SlashCommandBuilder()
    .setName("health")
    .setDescription("Check bot health and configuration"),
  new SlashCommandBuilder()
  .setName("help")
  .setDescription("View Lunar bot commands")

].map(cmd => cmd.toJSON());

const rest = new REST({
  version: "10"
}).setToken(process.env.DISCORD_TOKEN);

(async () => {

  try {

    console.log("Deploying slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands deployed!");

  } catch (err) {
    console.error(err);
  }

})();