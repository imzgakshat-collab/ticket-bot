const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

require("dotenv").config();

const OWNER_ID = "1140247742451556485"; // YOUR USER ID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ---------------- SLASH COMMAND HANDLER ---------------- */
client.on("interactionCreate", async (interaction) => {
  try {
    /* ===== SLASH COMMAND: /ticketpanel ===== */
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "ticketpanel") {
        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: "❌ You are not allowed to use this command.",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("<a:DownArrow:1423890160667332690> Select a category from the dropdown below")
          .setDescription(
            "**<:purchase:1454767621823270946> Purchasing**\nBuy products or services\n\n" +
            "**<a:claiming:1454767248576090203> Claiming**\nClaim giveaway or event rewards\n\n" +
            "**<a:CustomerSupport:1454767471402684478> Support**\nAsk questions or get help"
          );

        const menu = new StringSelectMenuBuilder()
          .setCustomId("ticket_select")
          .setPlaceholder("Choose a ticket category")
          .addOptions([
            {
              label: "Purchasing",
              value: "purchase",
              emoji: "<:purchase:1454767621823270946>"
            },
            {
              label: "Claiming",
              value: "claim",
              emoji: "<a:claiming:1454767248576090203>"
            },
            {
              label: "Support",
              value: "support",
              emoji: "<a:CustomerSupport:1454767471402684478>"
            }
          ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    }

    /* ===== DROPDOWN HANDLER ===== */
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "ticket_select") return;

      // 🔴 IMPORTANT FIX (prevents Unknown interaction)
      await interaction.deferReply({ ephemeral: true });

      const type = interaction.values[0];
      const guild = interaction.guild;
      const member = interaction.member;

      const channel = await guild.channels.create({
        name: `ticket-${member.user.username}`,
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

      const ticketEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("🎫 Ticket Created")
        .setDescription(
          `**User:** ${member}\n**Category:** ${type}\n\nPlease wait for staff response.`
        );

      await channel.send({ embeds: [ticketEmbed] });

      await interaction.editReply({
        content: `✅ Your ticket has been created: ${channel}`
      });
    }
  } catch (err) {
    console.error(err);
  }
});

/* ---------------- LOGIN ---------------- */
client.login(process.env.TOKEN);
