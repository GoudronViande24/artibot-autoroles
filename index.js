import Artibot, { Button, Command, Global, Module } from "artibot";
import Localizer from "artibot-localizer";
import { CommandInteraction, GatewayIntentBits } from "discord.js";
import { ReactionRole } from "discordjs-reaction-role";
import { createRolePicker, createRolePickerInit } from "./createRolePicker.js";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

/**
 * Autoroles module for Artibot
 * Partly based on Node.js module discordjs-reaction-role
 * @author GoudronViande24
 * @param {Artibot} artibot
 * @returns {Module}
 */
export default ({ config: { lang } }) => {
	localizer.setLocale(lang);

	return new Module({
		id: "autoroles",
		name: "Auto roles",
		version,
		langs: [
			"en",
			"fr"
		],
		repo: "GoudronViande24/artibot-autoroles",
		intents: [
			GatewayIntentBits.GuildMessageReactions
		],
		parts: [
			new Global({
				id: "reactionrole",
				mainFunction: ({ client, config, log }) => {
					try {
						new ReactionRole(client, config.autoroles.reactionRoles);
					} catch {
						log("Auto Roles", localizer._("Configuration not found or invalid. Reaction roles deactivated."), "log");
					}
				}
			}),
			new Button({
				id: "autorole-*",
				mainFunction: autoroleButton
			}),
			new Command({
				id: "createrolepicker",
				name: "createrolepicker",
				description: localizer._("Create a role picker."),
				usage: localizer._("<list of buttons to create (following the text:mode:id format) (ex.: Sample role:toggle:796899707045543946, Add-only role:addonly:796899707045543946)>"),
				guildOnly: true,
				requiresArgs: true,
				initFunction: createRolePickerInit,
				mainFunction: createRolePicker
			})
		]
	})
}

export const localizer = new Localizer({
	filePath: path.join(__dirname, "locales.json")
});

/**
 * Give or remove role to user when button clicked
 * @since 2.0.0
 * @param {CommandInteraction} interaction 
 * @param {Artibot} artibot
 */
async function autoroleButton(interaction, { createEmbed }) {
	const roleId = interaction.customId.split("-")[2],
		mode = interaction.customId.split("-")[1];

	const embed = createEmbed().setTitle("Autorole");

	const role = await interaction.guild.roles.fetch(roleId);

	switch (mode) {
		case "toggle":
			if (interaction.member.roles.cache.has(roleId)) {
				await interaction.member.roles.remove(roleId);
				embed.setDescription(localizer.__("You no longer have the [[0]] role.", { placeholders: [role.name] }));
			} else {
				await interaction.member.roles.add(roleId);
				embed.setDescription(localizer.__("You now have the [[0]] role.", { placeholders: [role.name] }));
			};
			break;

		case "addonly":
			await interaction.member.roles.add(roleId);
			embed.setDescription(localizer.__("You now have the [[0]] role.", { placeholders: [role.name] }));
			break;

		case "removeonly":
			await interaction.member.roles.remove(roleId);
			embed.setDescription(localizer.__("You no longer have the [[0]] role.", { placeholders: [role.name] }));
			break;

		default:
			throw new Error(localizer._("Requested mode is not valid!"));
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});
}