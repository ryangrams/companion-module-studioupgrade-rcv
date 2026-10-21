import type { CompanionActionDefinitions } from '@companion-module/base';
import type { RCVInstance } from '../index.js';
import { makeGrabCommand } from '../helpers/experimentalGrabs.js';
import { sendOSCCommand } from '../modules/oscController.js';

export function GetExperimentalActions(instance: RCVInstance): CompanionActionDefinitions {
	if (!instance.config.enableExperimentalGrabs) return {};
	return {
		su_experimental_grab: {
			name: 'Experimental: Request screen grab',
			description: 'Sends an undocumented firmware command. A successful send does not confirm a captured image.',
			options: [
				{
					type: 'dropdown',
					id: 'target',
					label: 'Screen',
					default: 'menu',
					choices: [
						{ id: 'menu', label: 'Menu' },
						{ id: 'multiview', label: 'Multiview' },
					],
				},
				{
					type: 'textinput',
					id: 'payload',
					label: 'Capture filename stem',
					default: 'companion_grab',
					tooltip: 'Saves under the device ScreenGrabs directory. This action reports transport completion only.',
				},
			],
			callback: async ({ options }) => {
				try {
					const command = makeGrabCommand(
						instance.config.enableExperimentalGrabs === true,
						instance.config.enableComs && instance.globalSettings.oscConnected === true,
						options.target,
						options.payload,
					);
					await sendOSCCommand(instance, command.address, ...command.args);
					instance.setVariableValues({
						experimental_grab_status: 'sent_capture_unconfirmed',
						experimental_grab_address: command.address,
					});
				} catch (error) {
					instance.setVariableValues({ experimental_grab_status: 'failed' });
					instance.log('error', error instanceof Error ? error.message : String(error));
				}
			},
		},
	};
}
