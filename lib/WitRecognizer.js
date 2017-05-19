"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_wit_1 = require("node-wit");
var crypto = require("crypto");
var RedisAdapter_1 = require("./adapters/RedisAdapter");
var MemcachedAdapter_1 = require("./adapters/MemcachedAdapter");
var CacheClients;
(function (CacheClients) {
    CacheClients[CacheClients["Unknown"] = 0] = "Unknown";
    CacheClients[CacheClients["Redis"] = 1] = "Redis";
    CacheClients[CacheClients["Memcached"] = 2] = "Memcached";
})(CacheClients = exports.CacheClients || (exports.CacheClients = {}));
var WitRecognizer = (function () {
    function WitRecognizer(accessToken, options) {
        if (options === void 0) { options = {}; }
        this.cacheAdapter = null;
        var cache = options.cache;
        if (!accessToken || typeof accessToken !== 'string') {
            throw new Error('Invalid argument. Constructor must be invoked with an accessToken of type "string".');
        }
        this.witClient = new node_wit_1.Wit({ accessToken: accessToken });
        if (cache) {
            var expire = typeof options.expire === 'number' ? options.expire : 3 * 3600;
            var clientType = this.getClientType(cache);
            if (clientType !== CacheClients.Unknown) {
                var _message = this.witClient.message;
                this.witClient.message = this.witDecorator(_message);
            }
            switch (clientType) {
                case CacheClients.Redis:
                    this.cacheAdapter = new RedisAdapter_1.default(cache, expire);
                    break;
                case CacheClients.Memcached:
                    this.cacheAdapter = new MemcachedAdapter_1.default(cache, expire);
                    break;
                default:
                    throw new Error("Invalid cache client. View the module's README.md for more details => https://github.com/sebsylvester/botbuilder-wit/blob/master/README.md");
            }
        }
    }
    WitRecognizer.prototype.recognize = function (context, done) {
        var result = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            var utterance = context.message.text;
            this.witClient.message(utterance, {})
                .then(function (response) {
                if (response.error) {
                    return done(new Error(response.error), null);
                }
                var _a = response.entities, intent = _a.intent, entities = __rest(_a, ["intent"]);
                var hasOtherEntities = Object.keys(entities).length > 0;
                if (!intent && !hasOtherEntities) {
                    return done(null, result);
                }
                if (intent) {
                    var _b = intent[0], value = _b.value, confidence = _b.confidence;
                    result.intent = value;
                    result.score = confidence;
                    result.intents = [{ intent: value, score: confidence }];
                }
                if (hasOtherEntities) {
                    if (!result.intent) {
                        result.intent = 'none';
                        result.score = 0.1;
                    }
                    result.entities = [];
                    for (var key in entities) {
                        for (var _i = 0, _c = entities[key]; _i < _c.length; _i++) {
                            var entity = _c[_i];
                            var type = entity.type, value = entity.value, confidence = entity.confidence;
                            var foundEntity = {
                                type: key,
                                entity: null,
                                rawEntity: entity,
                                score: confidence,
                            };
                            if (type === 'value') {
                                foundEntity.entity = value;
                                foundEntity.startIndex = response._text.indexOf(value);
                                foundEntity.endIndex = foundEntity.startIndex + (value.length - 1);
                            }
                            else {
                                foundEntity.entity = value;
                            }
                            result.entities.push(foundEntity);
                        }
                    }
                }
                done(null, result);
            })
                .catch(function (err) {
                done(err, null);
            });
        }
        else {
            done(null, result);
        }
    };
    WitRecognizer.prototype.getClientType = function (client) {
        var clientType = CacheClients.Unknown;
        if (typeof client === 'object' && client.constructor) {
            switch (client.constructor.name) {
                case 'RedisClient':
                    clientType = CacheClients.Redis;
                    break;
                case 'Client':
                    clientType = CacheClients.Memcached;
            }
        }
        return clientType;
    };
    WitRecognizer.prototype.witDecorator = function (message) {
        var _this = this;
        return function (utterance) {
            var hash = crypto.createHash('sha256');
            hash.update(utterance);
            var key = hash.digest('hex');
            return new Promise(function (resolve, reject) {
                _this.cacheAdapter.get(key, function (error, result) {
                    if (error) {
                        console.error(error);
                        return resolve(null);
                    }
                    try {
                        resolve(result ? JSON.parse(result) : null);
                    }
                    catch (error) {
                        resolve(null);
                    }
                });
            }).then(function (result) {
                if (result) {
                    _this.cacheAdapter.touch(key, function (error, result) {
                        if (error)
                            console.error(error);
                    });
                    return Promise.resolve(result);
                }
                else {
                    var witPromise = message(utterance);
                    witPromise.then(function (result) {
                        if (!result.error) {
                            var value = JSON.stringify(result);
                            _this.cacheAdapter.set(key, value, function (error, result) {
                                if (error)
                                    console.error(error);
                            });
                        }
                    }).catch(function (error) {
                        console.error(error);
                    });
                    return witPromise;
                }
            });
        };
    };
    return WitRecognizer;
}());
exports.WitRecognizer = WitRecognizer;
//# sourceMappingURL=WitRecognizer.js.map