export const GRAB_COMMANDS = {
	menu: '/actionMenuGrab',
	multiview: '/actionMultiviewGrab',
} as const;

export function makeGrabCommand(enabled: boolean, connected: boolean, target: unknown, payload: unknown) {
	if (!enabled) throw new Error('Experimental screen grabs are disabled in connection settings');
	if (!connected) throw new Error('RCV is disconnected');
	if (target !== 'menu' && target !== 'multiview') throw new Error('Unknown screen grab target');
	if (typeof payload !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(payload)) {
		throw new Error('Use a capture name of 1 to 64 letters, numbers, underscores, or hyphens');
	}
	return { address: GRAB_COMMANDS[target], args: [payload] };
}
