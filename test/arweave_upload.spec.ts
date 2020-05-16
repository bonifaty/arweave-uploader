import {createFileTransactions, initArweave, uploadTransaction} from "../src";
import { resolve } from 'path';

const TEST_ASSETS = [
    'index.html',
    'styles.css',
    'images/unicorn_llama.jpg',
];

/*

describe('arweave upload fixtures', () => {
    it('should create transactions and upload', async () => {
        const arweave = initArweave();
        const arweaveKey = JSON.parse(process.env.TEST_KEYFILE_CONTENT);
        const rootDirectory = 'fixtures';
        const filesAbsolutePathsArray = TEST_ASSETS.map((filePath) => resolve(__dirname, rootDirectory, filePath));
        const rootDirectoryAbsolutePath = resolve(__dirname, rootDirectory);
        const transactions = await createFileTransactions(filesAbsolutePathsArray, rootDirectoryAbsolutePath, arweave, arweaveKey);

        for (const transaction of transactions) {
            await uploadTransaction(transaction, arweave);
        }
    });
});

*/
