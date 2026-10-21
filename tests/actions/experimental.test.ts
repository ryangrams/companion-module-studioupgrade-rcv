import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('experimental screen grab action', () => {
	async function fixture() {
		const sendOSCCommand = sinon.stub().resolves();
		const mod = await esmock('../../src/actions/experimental.js', {
			'../../src/modules/oscController.js': { sendOSCCommand },
		});
		const instance: any = {
			config: { enableExperimentalGrabs: true, enableComs: true },
			globalSettings: { oscConnected: true },
			setVariableValues: sinon.spy(),
			log: sinon.spy(),
		};
		return { instance, sendOSCCommand, actions: mod.GetExperimentalActions(instance) };
	}
	it('reports transport submission without claiming capture confirmation', async () => {
		const f = await fixture();
		await f.actions.su_experimental_grab.callback({ options: { target: 'multiview', payload: 'capture' } });
		expect(f.sendOSCCommand.calledOnceWithExactly(f.instance, '/actionMultiviewGrab', 'capture')).to.equal(true);
		expect(f.instance.setVariableValues.lastCall.args[0].experimental_grab_status).to.equal('sent_capture_unconfirmed');
	});
	it('blocks a previously registered action after opt-out', async () => {
		const f = await fixture();
		f.instance.config.enableExperimentalGrabs = false;
		await f.actions.su_experimental_grab.callback({ options: { target: 'menu', payload: 'capture' } });
		expect(f.sendOSCCommand.called).to.equal(false);
		expect(f.instance.setVariableValues.lastCall.args[0].experimental_grab_status).to.equal('failed');
	});
	it('reports transport errors without successful submission', async () => {
		const f = await fixture();
		f.sendOSCCommand.rejects(new Error('socket closed'));
		await f.actions.su_experimental_grab.callback({ options: { target: 'menu', payload: 'capture' } });
		expect(f.instance.setVariableValues.lastCall.args[0].experimental_grab_status).to.equal('failed');
		expect(f.instance.log.lastCall.args).to.deep.equal(['error', 'socket closed']);
	});
});
