require("dotenv").config();
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const OWNER_ID = "1140247742451556485";

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= INTERACTIONS ================= */
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
            "Use this category if you have questions or need help.\n\n" +
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

      await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    /* ---------- Dropdown ---------- */
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_menu") {
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
        .setTitle("🎟 Ticket Opened")
        .setDescription(
          `**Category:** ${category}\n\nPlease explain your issue clearly.`
        )
        .setColor(0x57f287);

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        embeds: [ticketEmbed],
        components: [closeButton],
      });

      await interaction.editReply({
        content: `✅ Your ticket has been created: ${channel}`,
      });
    }

    /* ---------- Close Ticket Button ---------- */
    if (interaction.isButton() && interaction.customId === "close_ticket") {
      await interaction.deferReply({ ephemeral: true });

      await interaction.editReply("🛑 Closing ticket in 5 seconds...");

      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch (err) {
          console.error(err);
        }
      }, 5000);
    }
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
});

/* ================= LOGIN ================= */
client.login(process.env.TOKEN);
