require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

// Define the slash command
const commands = [
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a support ticket")
].map(command => command.toJSON());

// Connect to Discord API
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Registering slash command...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash command registered successfully!");
  } catch (error) {
    console.error(error);
  }
})();
