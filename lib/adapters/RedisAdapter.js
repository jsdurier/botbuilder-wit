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
var RedisAdapter = (function (_super) {
    __extends(RedisAdapter, _super);
    function RedisAdapter(redisClient, expire) {
        var _this = _super.call(this, expire) || this;
        _this.redisClient = redisClient;
        _this.expire = expire;
        return _this;
    }
    RedisAdapter.prototype.get = function (key, callback) {
        this.redisClient.get(key, callback);
    };
    RedisAdapter.prototype.set = function (key, value, callback) {
        this.redisClient.set(key, value, 'EX', this.expire, callback);
    };
    RedisAdapter.prototype.touch = function (key, callback) {
        this.redisClient.expire(key, this.expire, callback);
    };
    ;
    return RedisAdapter;
}(CacheAdapter_1.default));
exports.default = RedisAdapter;
//# sourceMappingURL=RedisAdapter.js.map