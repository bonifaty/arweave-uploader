import { Compiler } from 'webpack';
import { ArweaveApiConfig, ArweaveUploader } from "./index";

type WebpackAsset = {
    existsAt: string;
};

type ArweavePluginOptions = {
    walletKeyFilePath: string;
    arweaveApiConfig?: Partial<ArweaveApiConfig>;
    indexFile?: string;
    verbose?: boolean;
};

class ArweaveUploaderPlugin {
    private readonly options: ArweavePluginOptions;

    constructor (options: ArweavePluginOptions) {
        this.options = {
            indexFile: 'index.html',
            verbose: false,
            ...options,
        };
    }

    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap('ArweaveUploaderPlugin', async (compilation) => {
            const assets: string[] = [];
            for (const assetName in compilation.assets) {
                const asset: WebpackAsset = compilation.assets[assetName];
                assets.push(asset.existsAt);
            }

            const arweaveUploader = new ArweaveUploader();

            const { walletKeyFilePath, arweaveApiConfig, indexFile } = this.options;

            await arweaveUploader.init(walletKeyFilePath, arweaveApiConfig);
            return await arweaveUploader.uploadAssets(assets, compilation.outputOptions.path, indexFile);
        });
    }
}

module.exports = ArweaveUploaderPlugin;
