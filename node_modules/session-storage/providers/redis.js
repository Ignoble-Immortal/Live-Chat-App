var _ = require('lodash'),
    redis = require('redis');

/**
 * @type {AbstractProvider}
 */
var AbstractProvider = require('./abstract');

function RedisProvider(params) {
    AbstractProvider.call(this, params);
}

RedisProvider.prototype = Object.create(AbstractProvider.prototype);
RedisProvider.prototype.constructor = RedisProvider;

RedisProvider.prototype._init = function(params) {
    var self = this;
    var initFunc = function(params, cb) {
        var client = redis.createClient(params.port || 6379, params.host || 'localhost', {
            'socket_nodelay': true
        });
        var tid = setTimeout(function() {
            cb(new Error("Unable to connect to Redis server"), null);
        }, params.timeout || 10000);
        client.on('ready', function() {
            clearTimeout(tid);
            cb(null, client);
        });
    };
    this.secureKey = params.secureKey;
    this.client = this.makeSync(initFunc).call(this, params);
};

RedisProvider.prototype._preSetHook = function(value) {
    var data = '';
    if(!_.isObject(value)) {
        data = value;
    } else {
        data = JSON.stringify(value, null, 2);
    }
    if(this.secureKey)
        data = this.encode(data, this.secureKey);
    return data;
};

RedisProvider.prototype._postGetHook = function(data) {
    data = (data) ? data.toString() : null;
    if(this.secureKey) {
        data = this.decode(data, this.secureKey);
    }
    var ret = null;
    try {
        ret = JSON.parse(data);
    } catch (e) {
        ret = data;
    }
    return ret;
};

RedisProvider.prototype.setValue = function(key, value, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    var data = this._preSetHook(value);
    this.client.set(key, data, cb);
};

RedisProvider.prototype.getValue = function(key, cb) {
    var self = this;
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.get(key, function(err, reply) {
        var data = self._postGetHook(reply);
        cb(err, data);
    });
};

RedisProvider.prototype.removeValue = function(key, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.del(key, cb);
};

RedisProvider.prototype.purge = function() {
    console.warn('Wanting to execute `purge` command on Redis provider. We can not simply just purge all the server. This is too dangerous :(');
    throw new Error("Purge command is not supprot for redis yet");
};

RedisProvider.prototype.expire = function(key, time, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.expire(key, time, function(e) {
        cb(e, true);
    });
};

RedisProvider.prototype.expireSync = function(key, time) {
    this.makeSync(this.expire).call(this, key, time);
};

RedisProvider.prototype.setHValue = function(hash, key, value, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    var data = this._preSetHook(value);
    this.client.hset(hash, key, data, function() {
        cb(null, true);
    });
};

RedisProvider.prototype.getHValue = function(hash, key, cb) {
    var self = this;
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.hget(hash, key, function(err, reply) {
        cb(err, self._postGetHook(reply));
    });
};

RedisProvider.prototype.getHValues = function(hash, cb) {
    var self = this;
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.hgetall(hash, function(err, reply) {
        var ret = {};
        if(reply) {
            _.each(reply, function (buf, name) {
                ret[name] = self._postGetHook(buf);
            });
        }
        cb(err, ret);
    });
};

RedisProvider.prototype.removeHValue = function(hash, key, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.client.hdel(hash, key, cb);
};

RedisProvider.prototype.purgeHash = function(hash, cb) {
    this.removeValue(hash, cb);
};

module.exports = RedisProvider;