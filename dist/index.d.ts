import Arweave from "arweave/node";
import { JWKInterface } from "arweave/node/lib/wallet";
import Transaction from "arweave/node/lib/transaction";
export declare const getKeyFromFile: (keyFilePath: any) => Promise<any>;
export declare type ArweaveApiConfig = {
    host: string;
    port: number;
    protocol: 'https' | 'http';
    timeout: number;
    logging: boolean;
};
export declare const initArweave: (config?: Partial<ArweaveApiConfig>) => Arweave;
export declare const uploadTransaction: (transaction: any, arweave: any) => Promise<any>;
export declare const createFileTransactions: (filePathsArray: string[], rootDirectoryPath: string, arweave: Arweave, arweaveKey: JWKInterface) => Promise<Transaction[]>;
export declare const createTransactionFromFile: (filePath: string, arweave: Arweave, arweaveKey: JWKInterface) => Promise<Transaction>;
export declare class ArweaveUploader {
    private arweave;
    private arweaveKey;
    private initialized;
    init(keyFilePath: string, arweaveApiConfig?: Partial<ArweaveApiConfig>): Promise<void>;
    uploadAssets(assets: string[], rootDirectory: string, indexPath?: string): Promise<Transaction[]>;
}
