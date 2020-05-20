import { ArweaveUploader } from '../src';

describe('arweave init', () => {
    it('config should have default values', async () => {
        const arweaveUploader = new ArweaveUploader();
        const arweave = await arweaveUploader.init('/tmp/key.json');
        const arweaveConfig = arweave.api.getConfig();
        expect(arweaveConfig.protocol).toBe('https');
        expect(arweaveConfig.host).toBe('arweave.net');
        expect(arweaveConfig.port).toBe(443);
    });

    it('init should set relevant config values', async () => {
        const arweaveUploader = new ArweaveUploader();
        const arweave = await arweaveUploader.init('/tmp/key.json', {
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
