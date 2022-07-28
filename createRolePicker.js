import Artibot from "artibot";
import { ActionRowBuilder, ButtonBuilder, PermissionsBitField, Message, ButtonStyle } from "discord.js";
import { localizer } from "./index.js";

const allowedModes = [
	"toggle",
	"addonly",
	"removeonly"
];

/**
 * Command to create a role picker
 * @author GoudronViande24
 * @since 2.0.0
 * @param {Message} message
 * @param {string[]} args
 * @param {Artibot} artibot
 */
export async function createRolePicker(message, args, { config, createEmbed }) {
	// Check if user has admin permissions
	if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await message.channel.send({
		embeds: [
			createEmbed()
				.setColor("Red")
				.setTitle("Autorole")
				.setDescription(localizer._("You must be an administrator to use this command."))
		]
	});

	// Check if there is an argument
	if (!args.length) return await message.channel.send({
		embeds: [
			createEmbed()
				.setColor("Red")
				.setTitle("Autorole")
				.setDescription(localizer._("No arguments! Use the `help createrolepicker` command to learn more."))
		]
	});

	const row = new ActionRowBuilder();
	args = args.join(" ").split(", ");

	args.slice(0, 5).forEach(arg => {
		const settings = arg.split(":");

		if (settings.length != 3 || !message.guild.roles.cache.get(settings[2]) || !allowedModes.includes(settings[1])) {
			return sendErrorMessage(
				message.channel,
				config,
				localizer.__("[[0]] is not valid.", { placeholders: [arg] })
			);
		}

		row.addComponents(
			new ButtonBuilder()
				.setLabel(settings[0])
				.setStyle(ButtonStyle.Primary)
				.setCustomId(`autorole-${settings[1]}-${settings[2]}`)
		);
	});

	await message.channel.send({
		components: [row]
	});

	await message.delete();
}
