// init arweave

// upload Files
// USAGE:
// ArweaveUploader.upload(filesArray, configuration)

import Arweave from "arweave/node";
import {JWKInterface} from "arweave/node/lib/wallet";
import mime from 'mime';
const fs = require('fs').promises;
import path from 'path';
import Transaction from "arweave/node/lib/transaction";

type ArweaveConfig = {
    host: string;
    port: number;
    protocol: 'https' | 'http',
    timeout: number;
    logging: boolean;
}

const DEFAULT_CONFIG: ArweaveConfig = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
};

export const initArweave = (config?: Partial<ArweaveConfig>): Arweave => {
    const configuration: ArweaveConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };

    return Arweave.init(configuration);
};

export const uploadTransaction = async (transaction, arweave) => {
    const response = await arweave.transactions.post(transaction);

    if ([200, 208].includes(response.status)) {
        console.log('we have successfully got the file');
        console.log('here comes the transaction response status', response.status);
        console.log(`https://arweave.net/${transaction.id}`);
    }

    return response;
};

type ManifestPaths = {
    [index: string]: { id: string };
}

type Manifest = {
    manifest: string;
    version: string;
    index?: {
        path: string;
    }
    paths: ManifestPaths;
}

export const createFileTransactions = async (filePathsArray: string[], rootDirectoryPath: string, arweave: Arweave, arweaveKey: JWKInterface): Promise<Transaction[]> => {
    if (!filePathsArray.length) {
        console.error('empty array :(');
        throw new Error('Empty array');
    }

    const transactionsPromises = filePathsArray.map(async filePath => ({
        filePath,
        transaction: await createTransactionFromFile(filePath, arweave, arweaveKey)
    }));
    const filesTransactions = await Promise.all(transactionsPromises);
    const transactions = filesTransactions.map((fileTransaction) => fileTransaction.transaction);

    const paths: ManifestPaths = {};

    filesTransactions.forEach((file) => {
        const relativePath = path.relative(rootDirectoryPath, file.filePath);
        paths[relativePath] = {
            id: file.transaction.id,
        };
    });

    const manifest: Manifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        index: {
            path: 'index.html', // move to settings, check if the file is among the files listed
        },
        paths,
    };

    const data = Buffer.from(JSON.stringify(manifest), 'utf8');

    const manifestTransaction = await arweave.createTransaction(
        {
            data,
        },
        arweaveKey,
    );

    console.log('here comes the manifest', manifest);

    manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');
    await arweave.transactions.sign(manifestTransaction, arweaveKey);

    return [...transactions, manifestTransaction];
};

export const createTransactionFromFile = async (filePath: string, arweave: Arweave, arweaveKey: JWKInterface) => {
    try {
        const data = await fs.readFile(filePath);
        const transaction = await arweave.createTransaction({
            data,
        }, arweaveKey);
        transaction.addTag('Content-Type', mime.getType(filePath));

        await arweave.transactions.sign(transaction, arweaveKey);

        return transaction;
    } catch (e) {
        // Better way of handling the errors?
        console.error('Failed to read the file', filePath);
        throw new Error(e);
    }
};
