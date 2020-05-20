import { resolve } from 'path';
import { ArweaveUploader } from "../src";

const TEST_ASSETS = [
    'index.html',
    'styles.css',
    'images/unicorn_llama.jpg',
];


describe('arweave upload fixtures', () => {
    it('should create transactions and upload', async () => {
        const rootDirectory = 'fixtures';
        const filesAbsolutePathsArray = TEST_ASSETS.map((filePath) => resolve(__dirname, rootDirectory, filePath));
        const rootDirectoryAbsolutePath = resolve(__dirname, rootDirectory);
        const arweaveUploader = new ArweaveUploader();

        await arweaveUploader.init('/tmp/key.json');
        return;
        await arweaveUploader.uploadAssets(filesAbsolutePathsArray, rootDirectoryAbsolutePath, 'index.html');
    });
});

