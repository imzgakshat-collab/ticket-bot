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

/* ================= EXPRESS (RENDER FREE FIX) ================= */
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running 24/7"));
app.listen(PORT, () => console.log(`🌐 Web server running on ${PORT}`));

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

    /* ================= /ticket ================= */
    if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      /* 🔥 LARGE PANEL EMBED (UNCHANGED) */
      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Support Panel")
        .setColor(0x5865f2)
        .setDescription(
          "Welcome to our **Support Ticket System**.\n\n" +

          "━━━━━━━━━━━━━━━━━━\n" +
          "**<:purchase:1454767621823270946>  Purchasing**\n" +
          "- Use this category if you want to **buy something**, ask about **pricing**, or need help **before purchasing**.\n\n" +

          "━━━━━━━━━━━━━━━━━━\n" +
          "**<a:claiming:1454767248576090203>  Claiming**\n" +
          "- Use this category if you **won a giveaway or event** and want to **claim your prize**.\n\n" +

          "━━━━━━━━━━━━━━━━━━\n" +
          "**<a:CustomerSupport:1454767471402684478>  Support**\n" +
          "- Use this category if you have **questions**, **doubts**, or need help with **features or services**.\n\n" +

          "━━━━━━━━━━━━━━━━━━\n" +
          "<a:DownArrow:1423890160667332690> **Please select a category from the dropdown menu below**"
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

    /* ================= DROPDOWN ================= */
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {
      await interaction.deferReply({ ephemeral: true });

      const type = interaction.values[0];
      const guild = interaction.guild;

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_IDS[type],
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      });

      /* 🔥 LARGE TICKET EMBED (UNCHANGED) */
      const ticketEmbed = new EmbedBuilder()
        .setTitle("🎟 Ticket Opened")
        .setColor(0x57f287)
        .setDescription(
          "Please explain your issue clearly.\n\n" +
          "Use the **Close Ticket** button once your issue is resolved."
        );

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
        content: `✅ Ticket created: ${channel}`,
      });
    }

    /* ================= CLOSE CONFIRMATION ================= */
    if (interaction.isButton() && interaction.customId === "close_ticket") {
      await interaction.deferUpdate();

      const confirmEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle("Close Confirmation")
        .setDescription("Please confirm that you want to close this ticket")
        .setColor(0xed4245)
        .setFooter({ text: "Powered by Flexy's Ticket System" });

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_close")
          .setLabel("Close")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("✅"),
        new ButtonBuilder()
          .setCustomId("cancel_close")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("❌")
      );

      await interaction.channel.send({
        embeds: [confirmEmbed],
        components: [confirmRow],
      });
    }

    /* ================= CONFIRM CLOSE ================= */
    if (interaction.isButton() && interaction.customId === "confirm_close") {
      await interaction.deferUpdate();

      await interaction.channel.send(
        "🔒 **This ticket will be closed in 5 seconds...**"
      );

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }

    /* ================= CANCEL CLOSE ================= */
    if (interaction.isButton() && interaction.customId === "cancel_close") {
      await interaction.deferUpdate();
      await interaction.message.delete().catch(() => {});
    }

  } catch (err) {
    console.error("ERROR:", err);
  }
});

/* ================= LOGIN ================= */
client.login(process.env.TOKEN);
