require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

/* 🔒 Only YOU can use /ticket */
const OWNER_ID = "1140247742451556485";

/* 🔹 SERVER EMOJIS */
const EMOJIS = {
  purchasing: "<:purchase:1454767621823270946>",
  claiming: "<a:claiming:1454767248576090203>",
  support: "<a:CustomerSupport:1454767471402684478>"
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

  /* =======================
     /ticket COMMAND
     ======================= */
  if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {

    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ You are not allowed to use this command.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Create a Ticket")
      .setDescription(
        `${EMOJIS.purchasing} **Purchasing**\n` +
        "Use this category if you want to buy something or need information before purchasing.\n\n" +

        `${EMOJIS.claiming} **Claiming**\n` +
        "Use this category if you won a giveaway or event and want to claim your prize.\n\n" +

        `${EMOJIS.support} **Support**\n` +
        "Use this category if you have questions, doubts, or need help with features or services.\n\n" +
        "<a:DownArrow:1423890160667332690> **Select a category from the dropdown below**"
      )
      .setColor(0x5865F2);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Select a ticket category")
      .addOptions([
        {
          label: "Purchasing",
          value: "purchasing",
          emoji: { id: "1454767621823270946" }
        },
        {
          label: "Claiming",
          value: "claiming",
          emoji: { id: "1454767248576090203" }
        },
        {
          label: "Support",
          value: "support",
          emoji: { id: "1454767471402684478" }
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }

  /* =======================
     DROPDOWN SELECTION
     ======================= */
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_category") {

    const category = interaction.values[0];
    const guild = interaction.guild;
    const member = interaction.member;

    let ticketName = "";
    let ticketText = "";

    if (category === "purchasing") {
      ticketName = `purchase-${member.user.username}`;
      ticketText =
        `${EMOJIS.purchasing} **Purchasing Ticket**\n` +
        "Please tell us what you want to purchase.";
    }

    if (category === "claiming") {
      ticketName = `claim-${member.user.username}`;
      ticketText =
        `${EMOJIS.claiming} **Claiming Ticket**\n` +
        "Please provide proof or details to claim your prize.";
    }

    if (category === "support") {
      ticketName = `support-${member.user.username}`;
      ticketText =
        `${EMOJIS.support} **Support Ticket**\n` +
        "Please explain your issue or question.";
    }

    const channel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger);

    const closeRow = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      content: `<@${member.id}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Ticket Opened")
          .setDescription(ticketText)
          .setColor(0x5865F2)
      ],
      components: [closeRow]
    });

    await interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true
    });
  }

  /* =======================
     CLOSE TICKET BUTTON
     ======================= */
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.reply({
      content: "🔒 Closing this ticket in **5 seconds**...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(process.env.TOKEN);
