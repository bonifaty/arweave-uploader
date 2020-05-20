import Arweave from "arweave/node";
import mime from 'mime';
import colors from 'colors';
const fs = require('fs').promises;
import path from 'path';

import Transaction from "arweave/node/lib/transaction";

colors.setTheme({
    info: 'bgGreen',
    help: 'cyan',
    warn: 'yellow',
    success: 'bgBlue',
    error: 'red'
});

export type ArweaveApiConfig = {
    host: string;
    port: number;
    protocol: 'https' | 'http',
    timeout: number;
    logging: boolean;
}

const DEFAULT_CONFIG: ArweaveApiConfig = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
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

type AssetTransaction = {
    file: string;
    transaction: Transaction;
}

export class ArweaveUploader {
    private arweave!: Arweave;
    private arweaveKey: any;
    private initialized: boolean = false;

    private async getKeyFromFile (keyFilePath: string) {
        const keyFile = await fs.readFile(keyFilePath, 'utf-8');
        try {
            return JSON.parse(keyFile);
        } catch (e) {
            throw new Error(`Failed to parse wallet key file: ${e}`);
        }
    };

    async init(keyFilePath: string, arweaveApiConfig?: Partial<ArweaveApiConfig>) {
        const configuration: ArweaveApiConfig = {
            ...DEFAULT_CONFIG,
            ...arweaveApiConfig,
        };

        this.arweave = Arweave.init(configuration);
        this.arweaveKey = await this.getKeyFromFile(keyFilePath);
        this.initialized = true;
        return this.arweave;
    }

    private async createTransactionFromFile (filePath: string) {
        try {
            const data = await fs.readFile(filePath);
            const transaction = await this.arweave.createTransaction({
                data,
            }, this.arweaveKey);
            const contentType = mime.getType(filePath);
            if (contentType) {
                transaction.addTag('Content-Type', contentType);
            }

            await this.arweave.transactions.sign(transaction, this.arweaveKey);

            return transaction;
        } catch (e) {
            throw new Error(`Failed to read the file at ${filePath}`);
        }
    };

    private async createManifestTransaction(assetTransactions: AssetTransaction[], indexFile?: string): Promise<Transaction> {
        const paths: ManifestPaths = {};
        assetTransactions.forEach((assetTransaction) => {
            paths[assetTransaction.file] = {
                id: assetTransaction.transaction.id,
            };
        });

        const manifest: Manifest = {
            manifest: 'arweave/paths',
            version: '0.1.0',
            paths,
        };

        if (indexFile && assetTransactions.find((assetTransaction) => assetTransaction.file === indexFile)) {
            manifest.index = {
                path: indexFile,
            };
        }

        const data = Buffer.from(JSON.stringify(manifest), 'utf8');

        const manifestTransaction = await this.arweave.createTransaction(
            {
                data,
            },
            this.arweaveKey,
        );

        manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');
        await this.arweave.transactions.sign(manifestTransaction, this.arweaveKey);
        return manifestTransaction;
    }

    private async uploadTransaction(transaction: Transaction) {
        const response = await this.arweave.transactions.post(transaction);

        if (![200, 208].includes(response.status)) {
            throw new Error(`Failed to upload transaction with ID: ${transaction.id}`);
        }

        return response;
    }

    private async createAssetsTransactions(assets: string[], rootPath: string): Promise<AssetTransaction[]> {
        const transactionsPromises = assets.map(async filePath => ({
            file: path.relative(rootPath, filePath),
            transaction: await this.createTransactionFromFile(filePath),
        }));
        return await Promise.all(transactionsPromises);
    }

    async uploadAssets(assets: string[], rootPath: string, indexFile?: string, verbose = true): Promise<Transaction[]> {
        if (!this.initialized) {
            throw new Error('Uploader not initialized, please call init method');
        }

        if (!assets.length) {
            throw new Error('Assets array is empty. Please provide list of assets for uploading.')
        }

        if (verbose) {
            console.log(`
------------------------------------------
  __ _ _ ____      _____  __ ___   _____ 
 / _\` | '__\\ \\ /\\ / / _ \\/ _\` \\ \\ / / _ \\
| (_| | |   \\ V  V /  __/ (_| |\\ V /  __/
 \\__,_|_|    \\_/\\_/ \\___|\\__,_| \\_/ \\___|
------------------------------------------`);
            console.log(`Uploading assets from folder ${rootPath.green}\n`);
        }

        const assetTransactions = await this.createAssetsTransactions(assets, rootPath);
        if (verbose) {
            console.log('Transaction ID                              | File');
            console.log('-----------------------------------------------------------------------------------------');
            assetTransactions.forEach((assetTransaction) => {
                console.log(`${assetTransaction.transaction.id} | ${assetTransaction.file.green} ${indexFile === assetTransaction.file ? '[INDEX FILE]' : ''}`);
            });
        }

        const transactions = assetTransactions.map((assetTransaction) => assetTransaction.transaction);

        for (const transaction of transactions) {
            await this.uploadTransaction(transaction);
        }

        const manifestTransaction = await this.createManifestTransaction(assetTransactions);
        await this.uploadTransaction(manifestTransaction);

        if (verbose) {
            console.log(`\nSuccessfully uploaded ${assets.length} asset${assets.length > 1 ? 's' : ''}`.green);
            console.log(`When transactions are confirmed, you will be able to access uploaded assets at https://arweave.net/${manifestTransaction.id}`);
        }

        return [manifestTransaction, ...transactions];
    }

}
