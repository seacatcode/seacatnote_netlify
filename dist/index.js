"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetlifyDeploy = exports.NetlifyRedirect = void 0;
const axios_1 = __importDefault(require("axios"));
const jszip_1 = __importDefault(require("jszip"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
class NetlifyRedirect {
    constructor() {
        this.fileName = '_redirects';
        this.raw = [];
    }
    toData() {
        return this.raw.join('\n');
    }
    toString() {
        return this.toData();
    }
    appendRaw(raw) {
        this.raw.push(raw);
        return this;
    }
    add(item) {
        var _a;
        let line = [];
        line.push(item.from);
        if (item.query != null && Object.keys(item.query).length > 0) {
            line.push(Object.entries(item.query).map(i => i[0].concat('=:').concat(i[1])));
        }
        line.push(item.to);
        if (item.force === true) {
            line.push(String((_a = item.status) !== null && _a !== void 0 ? _a : 301) + '!');
        }
        else if (item.status !== 301 && item.status != null) {
            line.push(String(item.status));
        }
        return this.appendRaw(line.join(' '));
    }
}
exports.NetlifyRedirect = NetlifyRedirect;
NetlifyRedirect.fromSplat = '*';
NetlifyRedirect.toSplat = ':splat';
class NetlifyDeploy {
    constructor(accessToken) {
        this._accessToken = accessToken;
        this._jsZip = new jszip_1.default();
    }
    file(path, data) {
        if (data !== void 0) {
            return this._jsZip.file(path, data);
        }
        if (typeof path.toData === 'function' && typeof path.fileName === 'string') {
            const impl = path;
            const _this = this;
            return (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return _this._jsZip.file(impl.fileName, yield impl.toData());
                });
            })();
        }
        return this._jsZip.file(path);
    }
    folder(name) {
        return this._jsZip.folder(name);
    }
    remove(name) {
        return this._jsZip.remove(name);
    }
    fileNames() {
        return Object.keys(this._jsZip.files);
    }
    filter(predicate) {
        return this._jsZip.filter(predicate);
    }
    toBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._jsZip.generateAsync({ type: "blob" });
        });
    }
    writeZipFile(path, fileName = 'deploy.zip') {
        return __awaiter(this, void 0, void 0, function* () {
            const binary = yield this.toBlob();
            const buffer = yield binary.arrayBuffer();
            yield (0, promises_1.writeFile)((0, path_1.join)(path, fileName), Buffer.from(buffer));
        });
    }
    deploy(siteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield (0, axios_1.default)({
                method: "post",
                url: `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
                headers: {
                    'Authorization': `Bearer ${this._accessToken}`,
                    'Content-Type': 'application/zip'
                },
                data: yield this.toBlob()
            });
            return data;
        });
    }
    getSites() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield (0, axios_1.default)({
                method: "get",
                url: `https://api.netlify.com/api/v1/sites`,
                headers: {
                    'Authorization': `Bearer ${this._accessToken}`
                }
            });
            return data;
        });
    }
    getSimpleSites() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getSites();
            return data.map(item => {
                return {
                    name: item === null || item === void 0 ? void 0 : item.name,
                    site_id: item === null || item === void 0 ? void 0 : item.site_id,
                    url: item === null || item === void 0 ? void 0 : item.url,
                    admin_url: item === null || item === void 0 ? void 0 : item.admin_url,
                    state: item === null || item === void 0 ? void 0 : item.state,
                    screenshot_url: item === null || item === void 0 ? void 0 : item.screenshot_url,
                    created_at: item === null || item === void 0 ? void 0 : item.created_at,
                    updated_at: item === null || item === void 0 ? void 0 : item.updated_at,
                    published_deploy: {
                        deploy_url: item === null || item === void 0 ? void 0 : item.published_deploy.deploy_url,
                        deploy_ssl_url: item === null || item === void 0 ? void 0 : item.published_deploy.deploy_ssl_url,
                        created_at: item === null || item === void 0 ? void 0 : item.published_deploy.created_at,
                        updated_at: item === null || item === void 0 ? void 0 : item.published_deploy.updated_at,
                        error_message: item === null || item === void 0 ? void 0 : item.published_deploy.error_message,
                    }
                };
            });
        });
    }
}
exports.NetlifyDeploy = NetlifyDeploy;
