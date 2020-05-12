import { Compiler } from 'webpack';
import Arweave from 'arweave/node';
const fs = require('fs').promises;

const API_CONFIG = {
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
};

const arweave = Arweave.init(API_CONFIG);

export const uploadFile = async (filePath: string, encoding: string = 'utf-8', arweaveKey) => {
    try {
        const data = await fs.readFile(filePath, encoding);


        const transaction = await arweave.createTransaction({
            data,
        }, arweaveKey);
        transaction.addTag('Content-Type', 'text/html');
        transaction.addTag('User-Agent', 'ArweaveWebpackPlugin');

        await arweave.transactions.sign(transaction, arweaveKey);

        console.log('here is your balance');

        const address = await arweave.wallets.jwkToAddress(arweaveKey);
        const balance = await arweave.wallets.getBalance(address);

        console.log('here comes your balance', balance);

        return transaction;
    } catch (e) {
        console.error('Failed to read the file');
        throw new Error(e);
    }
};

export const getKey = async (keyFilePath) => {
    try {
        const keyFile = await fs.readFile(keyFilePath, 'utf-8');
        return JSON.parse(keyFile);
    } catch (e) {
        console.error('Failed to read the key file');
        throw new Error(e);
    }

};


const KEY_FILE_PATH = '/Users/andrew/Dropbox/arweave-keyfile-ghcQTA5S8nm-bKEZ0Z4Z9zP4HeME3D3kG-XPs1r--Vg.json';

type Asset = {
    existsAt: string;
};

type ManifestPaths = {
    [index: string]: { id: string };
}

type Manifest = {
    manifest: string;
    version: string;
    paths: ManifestPaths;
}

/*async function processArray(filesArray, arweaveKey) {
    const txs = [];
    for (const item of filesArray) {
        const tx = await uploadFile(item, 'utf-8', arweaveKey)
        txs.push(tx);
    }
    return txs;
}*/

const uploadTransaction = async (transaction) => {
    const response = await arweave.transactions.post(transaction);

    if ([200, 208].includes(response.status)) {
        console.log('we have successfully got the file');
        console.log('here comes the transaction response status', response.status);
        console.log(`https://arweave.net/${transaction.id}`);
    }

    return response;
};

class ArweaveUploaderPlugin {
    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap('Plugin Name', async (compilation) => {
            const arweaveKey = await getKey(KEY_FILE_PATH);
            console.log('Here are the compiled files');
            const assets: string[] = [];
            for (const assetName in compilation.assets) {
                const asset: Asset = compilation.assets[assetName];
                assets.push(asset.existsAt);
            }
            console.log(assets);
            console.log('output options');
            console.log(compilation.outputOptions.path);

            const txsPromises = assets.map(async filePath => ({
                filePath,
                transaction: await uploadFile(filePath, 'utf-8', arweaveKey)
            }));
            const txs = await Promise.all(txsPromises)
            console.log('created transactions for all files', txs.map(tx => `${tx.filePath}:::${tx.transaction.id}`));

            const paths: ManifestPaths = {};

            txs.forEach((file) => {
                const relativePath = file.filePath.replace(`${compilation.outputOptions.path}/`, '');
                paths[relativePath] = {
                    id: file.transaction.id,
                };
            });

            console.log('uploading transactions');

            for (const item of txs) {
                await uploadTransaction(item.transaction)
            }

            const manifest: Manifest = {
                manifest: 'arweave/paths',
                version: '0.1.0',
                paths,
            };

            console.log('here comes the manifest', manifest);

            const data = Buffer.from(JSON.stringify(manifest), 'utf8');

            const manifestTransaction = await arweave.createTransaction(
                {
                    data,
                },
                arweaveKey,
            );

            manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');

            await arweave.transactions.sign(manifestTransaction, arweaveKey);

            const manifestResponse = await uploadTransaction(manifestTransaction);

            console.log('here is the manifest response', manifestResponse.status)

        });
    }
}

module.exports = ArweaveUploaderPlugin;
