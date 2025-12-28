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

/* 🔒 ONLY YOU CAN USE /ticket */
const OWNER_ID = "1140247742451556485";

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

    // Only YOU can run /ticket
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ You are not allowed to use this command.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Create a Ticket")
      .setDescription(
        "**🛒 Purchasing**\n" +
        "Use this category if you want to buy something or need information before purchasing.\n\n" +
        "**🎁 Claiming**\n" +
        "Use this category if you won a giveaway or event and want to claim your prize.\n\n" +
        "**🛠 Support**\n" +
        "Use this category if you have questions, doubts, or need help with features or services.\n\n" +
        "⬇️ **Select a category from the dropdown below to continue.**"
      )
      .setColor(0x5865F2);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Select a ticket category")
      .addOptions([
        {
          label: "Purchasing",
          value: "purchasing",
          emoji: "🛒"
        },
        {
          label: "Claiming",
          value: "claiming",
          emoji: "🎁"
        },
        {
          label: "Support",
          value: "support",
          emoji: "🛠"
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
    let ticketMessage = "";

    if (category === "purchasing") {
      ticketName = `purchase-${member.user.username}`;
      ticketMessage = "🛒 **Purchasing Ticket**\nPlease tell us what you want to purchase.";
    }

    if (category === "claiming") {
      ticketName = `claim-${member.user.username}`;
      ticketMessage = "🎁 **Claiming Ticket**\nPlease provide proof/details to claim your prize.";
    }

    if (category === "support") {
      ticketName = `support-${member.user.username}`;
      ticketMessage = "🛠 **Support Ticket**\nPlease explain your issue or question.";
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
          .setDescription(ticketMessage)
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
