// init arweave

// upload Files
// USAGE:
// ArweaveUploader.upload(filesArray, configuration)

import Arweave from "arweave/node";

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

export const initArweave = (config?: Partial<ArweaveConfig>) => {
    const configuration: ArweaveConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };

    const arweave = Arweave.init(configuration);
    return arweave;
};
