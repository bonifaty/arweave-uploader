import {initArweave} from "../src";

describe('arweave set config', () => {
    it('config should have default values', () => {
        const arweave = initArweave();
        const arweaveConfig = arweave.api.getConfig();
        expect(arweaveConfig.protocol).toBe('https');
        expect(arweaveConfig.host).toBe('arweave.net');
        expect(arweaveConfig.port).toBe(443);
    });

    it('config should set arweave values', () => {
        const arweave = initArweave({
            protocol: 'http',
            host: '127.0.0.1',
            port: 1984
        });
        const arweaveConfig = arweave.api.getConfig();
        expect(arweaveConfig.protocol).toBe('http');
        expect(arweaveConfig.host).toBe('127.0.0.1');
        expect(arweaveConfig.port).toBe(1984);
    });
});

describe('arweave check connection', () => {
    it('fetch network info', () => {
        const arweave = initArweave();
        return arweave.network.getInfo().then((networkInfo) => {
            const keys = Object.keys(networkInfo);
            const expected = ['network', 'version'];
            expect(keys).toEqual(expect.arrayContaining(expected));
        })
    });

    it('should show arweave address', async () => {
        const arweave = initArweave();
        console.dir(process.env)
        const arweaveKey = JSON.parse(process.env.TEST_KEYFILE_CONTENT);
        const address = await arweave.wallets.jwkToAddress(arweaveKey);
        expect(address.length).toBe(43);
    });
});
