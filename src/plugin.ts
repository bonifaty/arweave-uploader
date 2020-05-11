import { Compiler } from 'webpack';
import {getKey, uploadFile} from "./index";

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

            const assetFullPath = assets[0];
            const relativePath = assetFullPath.replace(`${compilation.outputOptions.path}/`, '');

            console.log('here is the relative path', relativePath);

            const transaction = await uploadFile(assets[0], 'utf-8', arweaveKey);

            const paths: ManifestPaths = {
                [relativePath]: {
                    id: transaction.id,
                }
            };

            const manifest: Manifest = {
                manifest: 'arweave/paths',
                version: '0.1.0',
                paths,
            };
 
            console.log('here comes the manifest', manifest);
        });
    }
}

module.exports = ArweaveUploaderPlugin;
