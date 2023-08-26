import axios from 'axios';
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { join } from 'path';

export type toDataType = string | number[] | Uint8Array | ArrayBuffer | Blob | NodeJS.ReadableStream;

export interface toDataImpl {
    fileName: string,
    toData(): toDataType | Promise<toDataType>
}

interface NetlifyRedirectOption {
    status: number;
    force: boolean;
    query: { [key: string]: string }

    to: string,
    from: string
}

export class NetlifyRedirect implements toDataImpl {
    static fromSplat = '*'
    static toSplat = ':splat';

    fileName: string = '_redirects'
    raw: string[] = []

    toData(): string {
        return this.raw.join('\n');
    }

    toString() {
        return this.toData();
    }

    appendRaw(raw: string): NetlifyRedirect {
        this.raw.push(raw);
        return this;
    }

    add(item: NetlifyRedirectOption): NetlifyRedirect {
        let line = [];

        line.push(item.from);

        if (item.query != null && Object.keys(item.query).length > 0) {
            line.push(Object.entries(item.query).map(i => i[0].concat('=:').concat(i[1])));
        }

        line.push(item.to);

        if (item.force === true) {
            line.push(String(item.status ?? 301) + '!');
        } else if (item.status !== 301 && item.status != null) {
            line.push(String(item.status));
        }

        return this.appendRaw(line.join(' '));
    }
}

export class NetlifyDeploy {
    private _accessToken: string;
    private _jsZip: JSZip;

    constructor(accessToken: string) {
        this._accessToken = accessToken;
        this._jsZip = new JSZip();
    }

    file(path: string): JSZip.JSZipObject | null;
    file(path: RegExp): JSZip.JSZipObject[];
    file(path: string, data: any): JSZip;
    file(impl: toDataImpl): JSZip;
    file(path: any, data?: any): Promise<any> | any {
        if (data !== void 0) {
            return this._jsZip.file(path, data);
        }

        if (typeof path.toData === 'function' && typeof path.fileName === 'string') {
            const impl = path as toDataImpl;
            const _this = this;
            return (async function () {
                return _this._jsZip.file(impl.fileName, await impl.toData());
            })();
        }

        return this._jsZip.file(path);
    }

    folder(name: string): JSZip | null;
    folder(name: RegExp): JSZip.JSZipObject[];
    folder(name: any): any {
        return this._jsZip.folder(name);
    }

    remove(name: string) {
        return this._jsZip.remove(name);
    }

    fileNames() {
        return Object.keys(this._jsZip.files);
    }

    filter(predicate: (relativePath: string, file: JSZip.JSZipObject) => boolean) {
        return this._jsZip.filter(predicate);
    }

    /** Blob 데이터로 반환 합니다 */
    async toBlob() {
        return this._jsZip.generateAsync({ type: "blob" });
    }

    /** 파일로 생성합니다 */
    async writeZipFile(path: string, fileName: string = 'deploy.zip') {
        const binary = await this.toBlob();
        const buffer = await binary.arrayBuffer();
        await writeFile(join(path, fileName), Buffer.from(buffer));
    }

    /** API 를 통해 배포합니다 */
    async deploy(siteId: string) {
        const { data } = await axios({
            method: "post",
            url: `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
            headers: {
                'Authorization': `Bearer ${this._accessToken}`,
                'Content-Type': 'application/zip'
            },
            data: await this.toBlob()
        });

        return data;
    }

    /** 사이트 목록을 조회 합니다 */
    async getSites() {
        const { data } = await axios({
            method: "get",
            url: `https://api.netlify.com/api/v1/sites`,
            headers: {
                'Authorization': `Bearer ${this._accessToken}`
            }
        });

        return data;
    }

    /** 단순한 사이트 정보를 반환 합니다 */
    async getSimpleSites() {
        const data: any[] = await this.getSites();
        return data.map(item => {
            return {
                name: item?.name,
                site_id: item?.site_id,
                url: item?.url,
                admin_url: item?.admin_url,
                state: item?.state,
                screenshot_url: item?.screenshot_url,
                created_at: item?.created_at,
                updated_at: item?.updated_at,

                published_deploy: {
                    deploy_url: item?.published_deploy.deploy_url,
                    deploy_ssl_url: item?.published_deploy.deploy_ssl_url,
                    created_at: item?.published_deploy.created_at,
                    updated_at: item?.published_deploy.updated_at,
                    error_message: item?.published_deploy.error_message,
                }
            };
        });
    }
}