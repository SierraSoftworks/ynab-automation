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
exports.fetchSafe = exports.buildUrl = void 0;
function buildUrl(template, params) {
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key] || ''));
}
exports.buildUrl = buildUrl;
function fetchSafe(url, options = {}, attempts = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            attempts -= 1;
            const response = yield fetch(url, Object.assign({}, options));
            if (response.ok) {
                return yield response.json();
            }
            if (!attempts) {
                throw new Error(`${response.status} ${response.statusText}: ${yield response.text()}`);
            }
            // Delay for 1s between retries
            yield new Promise((resolve) => {
                setTimeout(() => resolve(null), 500);
            });
        }
    });
}
exports.fetchSafe = fetchSafe;
//# sourceMappingURL=http.js.map