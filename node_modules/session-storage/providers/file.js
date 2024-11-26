var _ = require('lodash'),
    os = require('os'),
    fs = require('fs'),
    path = require('path');

/**
 * @type {AbstractProvider}
 */
var AbstractProvider = require('./abstract');

function FileProvider(params) {
    AbstractProvider.call(this, params);
}

FileProvider.prototype = Object.create(AbstractProvider.prototype);
FileProvider.prototype.constructor = FileProvider;

FileProvider.prototype._init = function(params) {
    var self = this;
    this._syncInProgress = false;
    this._changed = false;
    this._syncId = 0;
    this.secureKey = params.secureKey;
    this.loadOnInit = (params.loadOnInit === null) ? true : params.loadOnInit;
    this.syncAlways = !!params.syncAlways;
    this.syncInterval = params.syncInterval || 60000;
    this.storageFile = params.where || path.join(os.tmpdir(), 'sess_storage.json');
    this.data = {};
    if(this.loadOnInit)
        this.reloadFromFile();
    this.setSyncInterval(this.syncInterval);

    process.on('exit', function() {
        self.sync(true);
    });
};

FileProvider.prototype.setSyncInterval = function(interval) {
    var self = this;
    if(interval > 0) {
        this.syncInterval = interval;
        if(this._syncId > 0) {
            clearInterval(this._syncId);
        }
        this._syncId = setInterval(function(){
            self.sync();
        }, this.syncInterval);
    }
};

FileProvider.prototype.reloadFromFile = function() {
    try {
        if (fs.existsSync(this.storageFile)) {
            var pureData = fs.readFileSync(this.storageFile, {encoding: 'utf-8'});
            if(this.secureKey) {
                pureData = this.decrypt(pureData, this.secureKey);
            }
            this.data = JSON.parse(pureData);
        }
    } catch (e) {
        console.error('Failed to load storage data. ' + e.message);
    }
};

FileProvider.prototype.setValue = function(key, value, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.data[key] = _.clone(value);
    if(this.syncAlways)
        this.sync();
    cb(null, true);
};

FileProvider.prototype.getValue = function(key, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    var ret = this.data[key];
    cb(null, (ret ? ret : null));
};

FileProvider.prototype.removeValue = function(key, cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.data[key] = null;
    if(this.syncAlways)
        this.sync();
    cb(null, true);
};

FileProvider.prototype.purge = function(cb) {
    if(!_.isFunction(cb))
        cb = _.noop;
    this.data = {};
    if(this.syncAlways)
        this.sync();
    cb(null, true);
};

FileProvider.prototype.sync = function(synchronize) {
    var self = this;
    if(this._syncInProgress) {
        //We are already writing to file
        this._changed = true;
    } else {
        this._syncInProgress = true;
        //Removing null'ed references
        var toSync = {};
        _.each(this.data, function(val, name) {
            if(val)
                toSync[name] = val;
        });
        var writeFunc = synchronize ? fs.writeFileSync : fs.writeFile;
        var pureData = JSON.stringify(toSync, null, 2);
        if(this.secureKey) {
            pureData = this.encrypt(pureData, this.secureKey);
        }
        writeFunc(this.storageFile, pureData, {encoding: 'utf8'}, function () {
            self._syncInProgress = false;
            if(self._changed) {
                self._changed = false;
                self.sync();
            }
        });
    }
};

module.exports = FileProvider;