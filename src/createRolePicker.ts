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
 */
export async function createRolePicker(message: Message, args: string[], { createEmbed }: Artibot): Promise<void> {
	// Check if user has admin permissions
	if (!message.member!.permissions.has(PermissionsBitField.Flags.Administrator)) {
		await message.channel.send({
			embeds: [
				createEmbed()
					.setColor("Red")
					.setTitle("Autorole")
					.setDescription(localizer._("You must be an administrator to use this command."))
			]
		});
		return;
	}

	// Check if there is an argument
	if (!args.length) {
		await message.channel.send({
			embeds: [
				createEmbed()
					.setColor("Red")
					.setTitle("Autorole")
					.setDescription(localizer._("No arguments! Use the `help createrolepicker` command to learn more."))
			]
		});
		return;
	}

	const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
	args = args.join(" ").split(", ");

	for (const arg of args.slice(0, 5)) {
		const settings = arg.split(":");

		if (settings.length != 3 || !message.guild!.roles.cache.get(settings[2]) || !allowedModes.includes(settings[1])) {
			await message.reply({
				embeds: [
					createEmbed()
						.setTitle("Autorole")
						.setColor("Red")
						.setDescription(localizer.__("[[0]] is not valid.", { placeholders: [arg] }))
				]
			});
			return;
		}

		row.addComponents(
			new ButtonBuilder()
				.setLabel(settings[0])
				.setStyle(ButtonStyle.Primary)
				.setCustomId(`autorole-${settings[1]}-${settings[2]}`)
		);
	}

	await message.channel.send({
		components: [row]
	});

	await message.delete();
}
