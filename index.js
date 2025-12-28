require("dotenv").config();
const express = require("express");
const app = express();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

/* -------- EXPRESS (FOR RENDER FREE) -------- */
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`🌐 Web server running on ${PORT}`));

/* -------- CATEGORY IDS -------- */
const CATEGORY_IDS = {
  purchase: "1454812266959601715",
  claim: "1454812462728740884",
  support: "1454812630429728933",
};

const OWNER_ID = "1140247742451556485";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* -------- INTERACTIONS -------- */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== /ticket ===== */
    if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Support Panel")
        .setColor(0x5865f2)
        .setDescription(
          "Welcome to our **Support Ticket System**.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "**<:purchase:1454767621823270946> Purchasing**\n" +
          "- Buy products, ask pricing, or get purchasing help.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "**<a:claiming:1454767248576090203> Claiming**\n" +
          "- Claim giveaway or event rewards.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "**<a:CustomerSupport:1454767471402684478> Support**\n" +
          "- Ask questions or get help.\n\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "<a:DownArrow:1423890160667332690> **Select a category below**"
        )
        .setFooter({ text: "Our team will assist you as soon as possible" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("Select ticket category")
        .addOptions([
          { label: "Purchasing", value: "purchase", emoji: "<:purchase:1454767621823270946>" },
          { label: "Claiming", value: "claim", emoji: "<a:claiming:1454767248576090203>" },
          { label: "Support", value: "support", emoji: "<a:CustomerSupport:1454767471402684478>" },
        ]);

      await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    /* ===== DROPDOWN ===== */
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {
      await interaction.deferReply({ ephemeral: true });

      const type = interaction.values[0];
      const guild = interaction.guild;

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_IDS[type],
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle("🎟 Ticket Opened")
        .setDescription("Please explain your issue clearly.")
        .setColor(0x57f287);

      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        embeds: [ticketEmbed],
        components: [closeBtn],
      });

      await interaction.editReply({
        content: `✅ Ticket created: ${channel}`,
      });
    }

    /* ===== CLOSE TICKET (ASK CONFIRMATION) ===== */
    if (interaction.isButton() && interaction.customId === "close_ticket") {
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_close")
          .setLabel("Confirm Close")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel_close")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        content: "⚠️ Are you sure you want to close this ticket?",
        components: [confirmRow],
        ephemeral: true,
      });
    }

    /* ===== CONFIRM CLOSE ===== */
    if (interaction.isButton() && interaction.customId === "confirm_close") {
      await interaction.reply({
        content: "🔒 Ticket will be closed in 5 seconds...",
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }

    /* ===== CANCEL CLOSE ===== */
    if (interaction.isButton() && interaction.customId === "cancel_close") {
      await interaction.reply({
        content: "❌ Ticket close cancelled.",
        ephemeral: true,
      });
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
