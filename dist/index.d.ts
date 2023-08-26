/// <reference types="node" />
import JSZip from "jszip";
export type toDataType = string | number[] | Uint8Array | ArrayBuffer | Blob | NodeJS.ReadableStream;
export interface toDataImpl {
    fileName: string;
    toData(): toDataType | Promise<toDataType>;
}
interface NetlifyRedirectOption {
    status: number;
    force: boolean;
    query: {
        [key: string]: string;
    };
    to: string;
    from: string;
}
export declare class NetlifyRedirect implements toDataImpl {
    static fromSplat: string;
    static toSplat: string;
    fileName: string;
    raw: string[];
    toData(): string;
    toString(): string;
    appendRaw(raw: string): NetlifyRedirect;
    add(item: NetlifyRedirectOption): NetlifyRedirect;
}
export declare class NetlifyDeploy {
    private _accessToken;
    private _jsZip;
    constructor(accessToken: string);
    file(path: string): JSZip.JSZipObject | null;
    file(path: RegExp): JSZip.JSZipObject[];
    file(path: string, data: any): JSZip;
    file(impl: toDataImpl): JSZip;
    folder(name: string): JSZip | null;
    folder(name: RegExp): JSZip.JSZipObject[];
    remove(name: string): JSZip;
    fileNames(): string[];
    filter(predicate: (relativePath: string, file: JSZip.JSZipObject) => boolean): JSZip.JSZipObject[];
    toBlob(): Promise<Blob>;
    writeZipFile(path: string, fileName?: string): Promise<void>;
    deploy(siteId: string): Promise<any>;
    getSites(): Promise<any>;
    getSimpleSites(): Promise<{
        name: any;
        site_id: any;
        url: any;
        admin_url: any;
        state: any;
        screenshot_url: any;
        created_at: any;
        updated_at: any;
        published_deploy: {
            deploy_url: any;
            deploy_ssl_url: any;
            created_at: any;
            updated_at: any;
            error_message: any;
        };
    }[]>;
}
export {};
//# sourceMappingURL=index.d.ts.map