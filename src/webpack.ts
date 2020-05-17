import { Compiler } from 'webpack';
import { ArweaveApiConfig, ArweaveUploader } from "./index";

type Asset = {
    existsAt: string;
};

type ArweavePluginOptions = {
    walletKeyFilePath: string;
    arweaveApiConfig?: Partial<ArweaveApiConfig>;
    indexFile?: string;
};

class ArweaveUploaderPlugin {
    private readonly options: ArweavePluginOptions;

    constructor (options: ArweavePluginOptions) {
        this.options = {
            indexFile: 'index.html',
            ...options,
        };
    }

    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tapAsync('ArweaveUploaderPlugin', async (compilation) => {
            const assets: string[] = [];
            for (const assetName in compilation.assets) {
                const asset: Asset = compilation.assets[assetName];
                assets.push(asset.existsAt);
            }
            console.log(assets);
            console.log('output options');
            console.log(compilation.outputOptions.path);

            const arweaveUploader = new ArweaveUploader();

            const { walletKeyFilePath, arweaveApiConfig, indexFile } = this.options;
            console.log('here we want to call init');
            await arweaveUploader.init(walletKeyFilePath, arweaveApiConfig);
            const uploadTransactions = await arweaveUploader.uploadAssets(assets, compilation.outputOptions.path, indexFile);
            console.log(uploadTransactions);
        });
    }
}

module.exports = ArweaveUploaderPlugin;
