"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CacheAdapter_1 = require("./CacheAdapter");
var MemcachedAdapter = (function (_super) {
    __extends(MemcachedAdapter, _super);
    function MemcachedAdapter(memcachedClient, expire) {
        var _this = _super.call(this, expire) || this;
        _this.memcachedClient = memcachedClient;
        _this.expire = expire;
        return _this;
    }
    MemcachedAdapter.prototype.get = function (key, callback) {
        this.memcachedClient.get(key, callback);
    };
    MemcachedAdapter.prototype.set = function (key, value, callback) {
        this.memcachedClient.set(key, value, this.expire, callback);
    };
    MemcachedAdapter.prototype.touch = function (key, callback) {
        this.memcachedClient.touch(key, this.expire, callback);
    };
    ;
    return MemcachedAdapter;
}(CacheAdapter_1.default));
exports.default = MemcachedAdapter;
//# sourceMappingURL=MemcachedAdapter.js.map