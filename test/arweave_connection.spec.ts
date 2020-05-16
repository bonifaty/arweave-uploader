import {initArweave} from "../src";

describe('arweave check connection', () => {
    it('fetch network info', async () => {
        const arweave = initArweave();
        const networkInfo = await arweave.network.getInfo();
        const keys = Object.keys(networkInfo);
        const expected = ['network', 'version'];
        expect(keys).toEqual(expect.arrayContaining(expected));
    });

    it('should show arweave address', async () => {
        const arweave = initArweave();
        const arweaveKey = JSON.parse(process.env.TEST_KEYFILE_CONTENT);
        const address = await arweave.wallets.jwkToAddress(arweaveKey);
        expect(address.length).toBe(43);
    });
});
