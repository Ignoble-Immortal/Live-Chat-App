var deasync = require('deasync'),
    crypto = require('crypto');

function AbstractProvider(params) {
    if (this.constructor === AbstractProvider) {
        throw new Error("Can't instantiate abstract class!");
    }
    this._init(params);
}

AbstractProvider.prototype._init = function() {};

AbstractProvider.prototype.encrypt = function(str, key){
    var cipher = crypto.createCipher('aes-256-ctr',key);
    var crypted = cipher.update(str,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};
AbstractProvider.prototype.decrypt = function(str, key){
    var decipher = crypto.createDecipher('aes-256-ctr',key);
    var dec = decipher.update(str,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
};
AbstractProvider.prototype.makeSync = function(fn) {
    return deasync(fn);
};

AbstractProvider.prototype.setValue = function(key, value, cb) {};
AbstractProvider.prototype.setValueSync = function(key, value) {
    var sync = deasync(this.setValue);
    return sync.call(this, key, value);
};
AbstractProvider.prototype.setHValue = function(hash, key, value, cb) {};
AbstractProvider.prototype.setHValueSync = function(hash, key, value) {
    var sync = deasync(this.setHValue);
    return sync.call(this, hash, key, value);
};
AbstractProvider.prototype.getValue = function(key, cb) {};
AbstractProvider.prototype.getValueSync = function(key) {
    var sync = deasync(this.getValue);
    return sync.call(this, key);
};
AbstractProvider.prototype.getHValue = function(hash, key, cb) {};
AbstractProvider.prototype.getHValueSync = function(hash, key) {
    var sync = deasync(this.getHValue);
    return sync.call(this, hash, key);
};
AbstractProvider.prototype.getHValues = function(hash, cb) {};
AbstractProvider.prototype.getHValuesSync = function(hash) {
    var sync = deasync(this.getHValues);
    return sync.call(this, hash);
};
AbstractProvider.prototype.removeValue = function(key, cb) {};
AbstractProvider.prototype.removeValueSync = function(key) {
    var sync = deasync(this.removeValue);
    return sync.call(this, key);
};
AbstractProvider.prototype.removeHValue = function(hash, key, cb) {};
AbstractProvider.prototype.removeHValueSync = function(hash, key) {
    var sync = deasync(this.removeHValue);
    return sync.call(this, hash, key);
};
AbstractProvider.prototype.purgeHash = function(hash, cb) {};
AbstractProvider.prototype.purgeHashSync = function(hash) {
    var sync = deasync(this.purgeHash);
    return sync.call(this, hash);
};
AbstractProvider.prototype.purge = function(cb) {};
AbstractProvider.prototype.purgeSync = function() {
    var sync = deasync(this.purge);
    return sync.call(this);
};

module.exports = AbstractProvider;