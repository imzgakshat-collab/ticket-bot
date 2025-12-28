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

/* ================= EXPRESS (RENDER FIX) ================= */
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running 24/7"));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

/* ================= CONFIG ================= */
const OWNER_ID = "1140247742451556485";

const CATEGORY_IDS = {
  purchase: "1454812266959601715",
  claim: "1454812462728740884",
  support: "1454812630429728933",
};

/* ================= CLIENT ================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= INTERACTIONS ================= */
client.on("interactionCreate", async (interaction) => {
  try {

    /* ===== /ticket COMMAND ===== */
    if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 SUPPORT TICKET PANEL")
        .setColor(0x5865f2)
        .setDescription(
          "Welcome to **Flexy's Support Ticket System**.\n\n" +

          "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "**<:purchase:1454767621823270946>  PURCHASING**\n" +
          "Use this option if you want to:\n" +
          "• Buy any product or service\n" +
          "• Ask pricing & payment details\n" +
          "• Get help *before purchasing*\n\n" +

          "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "**<a:claiming:1454767248576090203>  CLAIMING**\n" +
          "Use this option if you:\n" +
          "• Won a giveaway or event\n" +
          "• Need to claim your reward\n\n" +

          "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "**<a:CustomerSupport:1454767471402684478>  SUPPORT**\n" +
          "Use this option if you:\n" +
          "• Have questions or doubts\n" +
          "• Need help with features or services\n\n" +

          "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "<a:DownArrow:1423890160667332690> **Select a ticket category from the dropdown below**"
        )
        .setFooter({
          text: "Our team will respond as soon as possible",
        });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("📂 Select ticket category")
        .addOptions([
          {
            label: "Purchasing",
            value: "purchase",
            emoji: "<:purchase:1454767621823270946>",
          },
          {
            label: "Claiming",
            value: "claim",
            emoji: "<a:claiming:1454767248576090203>",
          },
          {
            label: "Support",
            value: "support",
            emoji: "<a:CustomerSupport:1454767471402684478>",
          },
        ]);

      await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    /* ===== DROPDOWN SELECT ===== */
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
        .setTitle("🎟 TICKET OPENED")
        .setColor(0x57f287)
        .setDescription(
          `Hello ${interaction.user}, 👋\n\n` +
          "Your ticket has been successfully created.\n\n" +
          "📌 **Please describe your issue clearly** so our team can help you faster.\n\n" +
          "🔒 Use the **Close Ticket** button when your issue is resolved."
        )
        .setFooter({ text: "Thank you for contacting support" });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        embeds: [ticketEmbed],
        components: [closeRow],
      });

      await interaction.editReply({
        content: `✅ Ticket created successfully: ${channel}`,
      });
    }

    /* ===== CLOSE BUTTON ===== */
    if (interaction.isButton() && interaction.customId === "close_ticket") {
      await interaction.deferUpdate();

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

      await interaction.channel.send({
        content: `⚠️ **${interaction.user} wants to close this ticket.**\nAre you sure?`,
        components: [confirmRow],
      });
    }

    /* ===== CONFIRM CLOSE ===== */
    if (interaction.isButton() && interaction.customId === "confirm_close") {
      await interaction.deferUpdate();

      await interaction.channel.send(
        "🔒 **Ticket is closing in 5 seconds...**"
      );

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }

    /* ===== CANCEL CLOSE ===== */
    if (interaction.isButton() && interaction.customId === "cancel_close") {
      await interaction.deferUpdate();
      await interaction.channel.send("❌ **Ticket close cancelled.**");
    }

  } catch (error) {
    console.error("ERROR:", error);
  }
});

/* ================= LOGIN ================= */
client.login(process.env.TOKEN);
