// init arweave
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "arweave/node", "mime", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ArweaveUploader = exports.createTransactionFromFile = exports.createFileTransactions = exports.uploadTransaction = exports.initArweave = exports.getKeyFromFile = void 0;
    // upload Files
    // USAGE:
    // ArweaveUploader.upload(filesArray, configuration)
    const node_1 = __importDefault(require("arweave/node"));
    const mime_1 = __importDefault(require("mime"));
    const fs = require('fs').promises;
    const path_1 = __importDefault(require("path"));
    exports.getKeyFromFile = async (keyFilePath) => {
        try {
            const keyFile = await fs.readFile(keyFilePath, 'utf-8');
            return JSON.parse(keyFile);
        }
        catch (e) {
            console.error('Failed to read the key file');
            throw new Error(e);
        }
    };
    const DEFAULT_CONFIG = {
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    };
    exports.initArweave = (config) => {
        const configuration = Object.assign(Object.assign({}, DEFAULT_CONFIG), config);
        return node_1.default.init(configuration);
    };
    exports.uploadTransaction = async (transaction, arweave) => {
        const response = await arweave.transactions.post(transaction);
        if ([200, 208].includes(response.status)) {
            console.log('we have successfully got the file');
            console.log('here comes the transaction response status', response.status);
            console.log(`https://arweave.net/${transaction.id}`);
        }
        return response;
    };
    exports.createFileTransactions = async (filePathsArray, rootDirectoryPath, arweave, arweaveKey) => {
        if (!filePathsArray.length) {
            console.error('empty array :(');
            throw new Error('Empty array');
        }
        const transactionsPromises = filePathsArray.map(async (filePath) => ({
            filePath,
            transaction: await exports.createTransactionFromFile(filePath, arweave, arweaveKey)
        }));
        const filesTransactions = await Promise.all(transactionsPromises);
        const transactions = filesTransactions.map((fileTransaction) => fileTransaction.transaction);
        const paths = {};
        filesTransactions.forEach((file) => {
            const relativePath = path_1.default.relative(rootDirectoryPath, file.filePath);
            paths[relativePath] = {
                id: file.transaction.id,
            };
        });
        const manifest = {
            manifest: 'arweave/paths',
            version: '0.1.0',
            index: {
                path: 'index.html',
            },
            paths,
        };
        const data = Buffer.from(JSON.stringify(manifest), 'utf8');
        const manifestTransaction = await arweave.createTransaction({
            data,
        }, arweaveKey);
        console.log('here comes the manifest', manifest);
        manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');
        await arweave.transactions.sign(manifestTransaction, arweaveKey);
        return [...transactions, manifestTransaction];
    };
    exports.createTransactionFromFile = async (filePath, arweave, arweaveKey) => {
        try {
            const data = await fs.readFile(filePath);
            const transaction = await arweave.createTransaction({
                data,
            }, arweaveKey);
            transaction.addTag('Content-Type', mime_1.default.getType(filePath));
            await arweave.transactions.sign(transaction, arweaveKey);
            return transaction;
        }
        catch (e) {
            // Better way of handling the errors?
            console.error('Failed to read the file', filePath);
            throw new Error(e);
        }
    };
    class ArweaveUploader {
        constructor() {
            this.initialized = false;
        }
        async init(keyFilePath, arweaveApiConfig) {
            console.log('here comes the init');
            this.arweave = exports.initArweave(arweaveApiConfig);
            this.arweaveKey = await exports.getKeyFromFile(keyFilePath);
            this.initialized = true;
        }
        async uploadAssets(assets, rootDirectory, indexPath) {
            if (!this.initialized) {
                console.error('Not initialized, please call init');
                return;
            }
            console.log(`-------------------------------------------------
    _                                           
   /_\\   _ __ __      __ ___   __ _ __   __ ___ 
  //_\\\\ | '__|\\ \\ /\\ / // _ \\ / _\` |\\ \\ / // _ \\
 /  _  \\| |    \\ V  V /|  __/| (_| | \\ V /|  __/
 \\_/ \\_/|_|     \\_/\\_/  \\___| \\__,_|  \\_/  \\___|
                                                
-------------------------------------------------`);
            const transactions = await exports.createFileTransactions(assets, rootDirectory, this.arweave, this.arweaveKey);
            return;
            for (const transaction of transactions) {
                await exports.uploadTransaction(transaction, this.arweave);
            }
            return transactions;
        }
    }
    exports.ArweaveUploader = ArweaveUploader;
});
