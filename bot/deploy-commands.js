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
      .addIntegerOption(option =>
        option
          .setName("claimtime")
          .setDescription(
            "Claim time in seconds"
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