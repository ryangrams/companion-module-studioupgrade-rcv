import { Regex, type SomeCompanionConfigField } from '@companion-module/base';

export interface ModuleConfig {
	ipAddress: string;
	enableComs: boolean;
	enableExperimentalGrabs?: boolean;
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'checkbox',
			id: 'enableExperimentalGrabs',
			label: 'Enable experimental screen grab commands',
			width: 12,
			default: false,
			tooltip: 'Menu and multiview capture verified on production 1549. File retrieval requires separate verification.',
		},
		{
			type: 'textinput',
			id: 'ipAddress',
			label: 'IP Address',
			width: 6,
			default: '127.0.0.1',
			required: true,
			regex: Regex.IP,
		},
		{
			type: 'checkbox',
			id: 'enableComs',
			label: 'Enable Communications',
			width: 6,
			default: false,
		},
	];
}
