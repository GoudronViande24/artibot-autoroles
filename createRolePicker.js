import Artibot from "artibot";
import { MessageActionRow, MessageButton, TextChannel, Permissions, Message } from "discord.js";
import { localizer } from "./index.js";

/** @type {Boolean} */
let enabled;

const allowedModes = [
	"toggle",
	"addonly",
	"removeonly"
];

/**
 * Initialize createRolePicker command
 * @param {Artibot} artibot 
 */
export async function createRolePickerInit({ log, config }) {
	try {
		enabled = config.autoroles.allowNewPickers;
	} catch {
		enabled = true;
		log("Auto roles", localizer._("Configuration not found or invalid. The createrolepicker command is enabled by default."), "log");
	}
}

/**
 * Command to create a role picker
 * @author GoudronViande24
 * @since 2.0.0
 * @param {Message} message
 * @param {string[]} args
 * @param {Artibot} artibot
 */
export async function createRolePicker(message, args, { config, createEmbed }) {
	// Check if command is enabled
	if (!enabled) return message.channel.send({
		embeds: [
			createEmbed()
				.setColor("RED")
				.setTitle("Autorole")
				.setDescription(localizer._("This command is disabled."))
		]
	});

	// Check if user has admin permissions
	if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send({
		embeds: [
			createEmbed()
				.setColor("RED")
				.setTitle("Autorole")
				.setDescription(localizer._("You must be an administrator to use this command."))
		]
	});

	// Check if there is an argument
	if (!args.length) return message.channel.send({
		embeds: [
			createEmbed()
				.setColor("RED")
				.setTitle("Autorole")
				.setDescription(localizer._("No arguments! Use the `help createrolepicker` command to learn more."))
		]
	});

	const row = new MessageActionRow();
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
			new MessageButton()
				.setLabel(settings[0])
				.setStyle("PRIMARY")
				.setCustomId(`autorole-${settings[1]}-${settings[2]}`)
		);
	});

	await message.channel.send({
		components: [row]
	});

	await message.delete();
}