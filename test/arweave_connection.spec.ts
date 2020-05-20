import { ArweaveUploader } from '../src';

describe('arweave check connection', () => {
    it('fetch network info', async () => {
        const arweaveUploader = new ArweaveUploader();
        const arweave = await arweaveUploader.init('/tmp/key.json');
        const networkInfo = await arweave.network.getInfo();
        const keys = Object.keys(networkInfo);
        const expected = ['network', 'version'];
        expect(keys).toEqual(expect.arrayContaining(expected));
    });
});
