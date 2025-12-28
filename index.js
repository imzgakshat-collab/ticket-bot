require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

/* 🔒 YOUR USER ID */
const OWNER_ID = "1140247742451556485";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

  /* =======================
     SLASH COMMAND: /ticket
     ======================= */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ticket") {

      /* 🔒 Only YOU can use /ticket */
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 Create Ticket")
        .setDescription("Click the button below to create a support ticket.")
        .setColor(0x5865F2);

      const createButton = new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Create Ticket")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(createButton);

      /* 👀 Visible to everyone */
      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    }
  }

  /* =======================
     BUTTON: CREATE TICKET
     ======================= */
  if (interaction.isButton() && interaction.customId === "create_ticket") {
    const guild = interaction.guild;
    const member = interaction.member;

    const channel = await guild.channels.create({
      name: `ticket-${member.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription(
        "Please explain your issue below.\n\n" +
        "🔒 Click **Close Ticket** when your issue is resolved."
      )
      .setColor(0x5865F2);

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Close Ticket")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      embeds: [ticketEmbed],
      components: [row],
    });

    await interaction.reply({
      content: `✅ Ticket created: ${channel}`,
      ephemeral: true,
    });
  }

  /* =======================
     BUTTON: CLOSE TICKET
     ======================= */
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.reply({
      content: "🔒 Closing this ticket in **5 seconds**...",
      ephemeral: true,
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

client.login(process.env.TOKEN);
