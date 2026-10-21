import { expect } from 'chai';
import { makeGrabCommand } from '../../src/helpers/experimentalGrabs.js';

describe('experimental screen grab admission', () => {
	it('blocks a saved action after the connection gate is disabled', () => {
		expect(() => makeGrabCommand(false, true, 'menu', 'capture')).to.throw('disabled');
	});
	it('blocks disconnected commands', () => {
		expect(() => makeGrabCommand(true, false, 'menu', 'capture')).to.throw('disconnected');
	});
	it('rejects addresses outside the audited command list', () => {
		expect(() => makeGrabCommand(true, true, '/shutdown', 'capture')).to.throw('target');
	});
	it('rejects arbitrary payloads', () => {
		expect(() => makeGrabCommand(true, true, 'menu', '/tmp/file')).to.throw('capture name');
	});
	it('rejects empty names, traversal, separators, and oversized names', () => {
		for (const payload of ['', '../capture', 'dir/capture', 'a'.repeat(65), 1, null]) {
			expect(() => makeGrabCommand(true, true, 'menu', payload)).to.throw('capture name');
		}
	});
	it('encodes a bounded string argument', () => {
		expect(makeGrabCommand(true, true, 'menu', 'capture')).to.deep.equal({
			address: '/actionMenuGrab',
			args: ['capture'],
		});
		expect(makeGrabCommand(true, true, 'multiview', 'capture2')).to.deep.equal({
			address: '/actionMultiviewGrab',
			args: ['capture2'],
		});
	});
});
