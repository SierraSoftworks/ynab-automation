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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
const node_crypto_1 = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
class DataSource {
    constructor(id) {
        this.id = id;
        this.cacheDirectory = path.join(process.cwd(), ".ynab-cache", id);
    }
    cached(key, expiry, hydrate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.promises.mkdir(this.cacheDirectory, { recursive: true });
            const cachePath = this.getCachePath(key, expiry);
            return yield fs.promises.readFile(cachePath, { encoding: "utf-8" })
                .then(data => JSON.parse(data))
                .catch(() => hydrate().then((data) => __awaiter(this, void 0, void 0, function* () {
                yield fs.promises.writeFile(cachePath, JSON.stringify(data), { encoding: "utf-8" });
                return data;
            })));
        });
    }
    getCachePath(key, expiry = "never") {
        const cacheExpiry = {
            "hour": `${new Date().toISOString().split('T')[0]}T${new Date().getUTCHours()}:00:00Z`,
            "day": `${new Date().toISOString().split('T')[0]}T00:00:00Z`,
            "month": `${new Date().toISOString().split('T')[0].substring(0, 7)}-01T00:00:00Z`,
            "year": `${new Date().toISOString().split('T')[0].substring(0, 4)}-01-01T00:00:00Z`,
            "never": "0000-01-01T00:00:00Z"
        }[expiry];
        return path.join(this.cacheDirectory, (0, node_crypto_1.createHash)("sha256").update(cacheExpiry).update(key).digest("hex"));
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=datasource.js.map