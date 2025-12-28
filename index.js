require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const OWNER_ID = "1140247742451556485";

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= SLASH COMMAND ================= */

client.on("interactionCreate", async (interaction) => {
  try {
    /* ---------- /ticket command ---------- */
    if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {
      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 Create a Ticket")
        .setColor(0x5865f2)
        .setDescription(
          "**<:purchase:1454767621823270946> Purchasing**\n" +
            "Use this category if you want to buy something or need info before purchasing.\n\n" +
            "**<a:claiming:1454767248576090203> Claiming**\n" +
            "Use this category if you won a giveaway or event and want to claim your prize.\n\n" +
            "**<a:CustomerSupport:1454767471402684478> Support**\n" +
            "Use this category if you have questions, doubts, or need help.\n\n" +
            "<a:DownArrow:1423890160667332690> **Select a category from the dropdown below**"
        );

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("Select a ticket category")
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

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    }

    /* ---------- Dropdown handler ---------- */
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {
      // IMPORTANT: ACKNOWLEDGE IMMEDIATELY
      await interaction.deferReply({ ephemeral: true });

      const category = interaction.values[0];
      const guild = interaction.guild;

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
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
        .setTitle("🎫 Ticket Created")
        .setDescription(
          `Category: **${category}**\n\nPlease describe your issue clearly.`
        )
        .setColor(0x57f287);

      await channel.send({ embeds: [ticketEmbed] });

      await interaction.editReply({
        content: `✅ Your ticket has been created: ${channel}`,
      });
    }
  } catch (err) {
    console.error("❌ ERROR:", err);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: "❌ Something went wrong." });
    }
  }
});

client.login(process.env.TOKEN);
