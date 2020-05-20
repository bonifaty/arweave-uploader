Arweave uploader
===

[![Build Status](https://travis-ci.com/bonifaty/arweave-uploader.svg?branch=master)](https://travis-ci.com/bonifaty/arweave-uploader)
[![Coverage Status](https://coveralls.io/repos/github/bonifaty/arweave-uploader/badge.svg?branch=master)](https://coveralls.io/github/bonifaty/arweave-uploader?branch=master)

Tiny SDK to upload assets to Arweave permaweb

### Installation

Using npm:

```sh
npm install @arweave-cdn/uploader --save-dev 
```

or using yarn:

```sh
yarn add @arweave-cdn/uploader --dev
```

### Usage

```js
import { ArweaveUploader } from '@arweave-cdn/uploader';

const assetsForUpload = [
    '/Users/andrew/web3/index.html',
    '/Users/andrew/web3/styles.css',
    '/Users/andrew/web3/images/unicorn_llama.jpg',
];

const arweaveUploader = new ArweaveUploader();
await arweaveUploader.init('/Users/full/filepath/to/arweave-wallet-key-file.json');
await arweaveUploader.uploadAssets(assetsForUpload, '/Users/andrew/web3/', 'index.html');
```
