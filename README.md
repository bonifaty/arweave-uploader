Arweave uploader
===

[![Build Status](https://travis-ci.com/bonifaty/arweave-uploader.svg?branch=master)](https://travis-ci.com/bonifaty/arweave-uploader)
[![Coverage Status](https://coveralls.io/repos/github/bonifaty/arweave-uploader/badge.svg?branch=master)](https://coveralls.io/github/bonifaty/arweave-uploader?branch=master)

Tiny SDK to upload assets to Arweave permaweb, it's a core uploader used in the following plugins:

* **Arweave Uploader Webpack Plugin** (https://github.com/bonifaty/webpack-arweave)

### Installation

Using npm:

```sh
npm install @arweave-cdn/uploader --save 
```

### Usage

```js
import { ArweaveUploader } from '@arweave-cdn/uploader';

const arweaveUploader = new ArweaveUploader();
await arweaveUploader.init('/absolute/path/to/arweave-wallet-key-file.json');

const filesToUpload = [
  '/Users/andrew/web3/index.html',
  '/Users/andrew/web3/styles.css',
  '/Users/andrew/web3/images/unicorn_llama.jpg',
];
await arweaveUploader.uploadAssets(filesToUpload, '/Users/andrew/web3/', 'index.html');
```

### Methods

--- 
##### init(`walletKeyFilepath`, `arweaveApiConfig`)

- `walletKeyFilePath` (**required**): Absolute file path to arweave wallet key file
- `arweaveApiConfig` (**optional**): Arweave API config object to use for Arweave connection. Defaults to following values:
```
{
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false,     // Enable network request logging
}
```

----

##### uploadAssets(`filesToUpload`, `rootPath`, `indexFile`, `verbose`)

- `filesToUpload` **(required)**: Array of files (with absolute file paths) which need to be uploaded 
- `rootPath` **(required)**: Path to the directory which is being uploaded
- `indexFile` **(optional)**: Index file (relative path), e.g. _index.html_
- `verbose` **(optional)**: Boolean field to enable / disable progress messages, defaults to _true_
