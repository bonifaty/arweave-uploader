import { Compiler } from 'webpack';
import {createFileTransactions, initArweave, uploadTransaction} from "./index";
const KEY_FILE_PATH = '/Users/andrew/Dropbox/arweave-keyfile-ghcQTA5S8nm-bKEZ0Z4Z9zP4HeME3D3kG-XPs1r--Vg.json';
const fs = require('fs').promises;

type Asset = {
    existsAt: string;
};

export const getKeyFromFile = async (keyFilePath) => {
    try {
        const keyFile = await fs.readFile(keyFilePath, 'utf-8');
        return JSON.parse(keyFile);
    } catch (e) {
        console.error('Failed to read the key file');
        throw new Error(e);
    }

};

class ArweaveUploaderPlugin {
    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap('Plugin Name', async (compilation) => {
            const arweaveKey = await getKeyFromFile(KEY_FILE_PATH);
            const arweave = initArweave();
            console.log('Here are the compiled files');
            const assets: string[] = [];
            for (const assetName in compilation.assets) {
                const asset: Asset = compilation.assets[assetName];
                console.log(assetName);
                console.log(asset);
                assets.push(asset.existsAt);
            }
            console.log(assets);
            console.log('output options');
            console.log(compilation.outputOptions.path);

            const transactions = await createFileTransactions(assets, compilation.outputOptions.path, arweave, arweaveKey);

            for (const transaction of transactions) {
                await uploadTransaction(transaction, arweave);
            }
        });
    }
}

module.exports = ArweaveUploaderPlugin;
