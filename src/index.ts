import Arweave from 'arweave/node';
const fs = require('fs').promises;
const KEY_FILE_PATH = '/Users/andrew/Dropbox/arweave-keyfile-ghcQTA5S8nm-bKEZ0Z4Z9zP4HeME3D3kG-XPs1r--Vg.json';

const API_CONFIG = {
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
};

const uploadFile = async (filePath: string, encoding: string = 'utf-8', arweaveKey) => {
    try {
        const data = await fs.readFile(filePath, encoding);
        const arweave = Arweave.init(API_CONFIG);

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

        return;

        const response = await arweave.transactions.post(transaction);

        if ([200, 208].includes(response.status)) {
            console.log('we have successfully got the file');
            console.log('here comes the transaction response status', response.status);
            console.log(`https://arweave.net/${transaction.id}`);
        }
    } catch (e) {
        console.error('Failed to read the file');
        throw new Error(e);
    }
};

const getKey = async (keyFilePath) => {
    try {
        const keyFile = await fs.readFile(keyFilePath, 'utf-8');
        return JSON.parse(keyFile);
    } catch (e) {
        console.error('Failed to read the key file');
        throw new Error(e);
    }

};


(async () => {
    console.log('Reading the key file');
    const arweaveKey = await getKey(KEY_FILE_PATH);
    console.log('Key received', Object.keys(arweaveKey));

    console.log('Uploading file...');
    uploadFile('./index.html', 'utf-8', arweaveKey);

})();
