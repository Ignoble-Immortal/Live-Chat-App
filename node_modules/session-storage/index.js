var _ = require('lodash'),
    path = require('path'),
    fs = require('fs');

function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        var pFile = file;
        file = dir + '/' + file;
        var stat = fs.lstatSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else results.push(pFile)
    });
    return results;
}

var bind = Function.prototype.call.bind(Function.prototype.bind);

/**
 *
 * @param {String} [provider=file] Default provider name
 * @param {Object} [providerParams={}] Parameters for default provider
 */
function Storage(provider, providerParams) {
    provider = provider || 'file';
    providerParams = providerParams || {};
    var self = this;
    this._providers = {};
    var providers = walk(path.join(path.dirname(__filename), 'providers'));
    _.each(providers, function(provider) {
        self.addProvider(path.join(path.dirname(__filename), 'providers', provider));
    });
    if(provider) {
        this.use(provider, providerParams);
    }
}

Storage.prototype = {
    constructor: Storage,
    _providers: {},
    /**
     * Add new provider. provider file path or just provider object
     * @param {String|Object} provider
     * @param {String} [name] Provider name if filename passed
     * @throws {Error} If provider path does not exists
     */
    addProvider: function(provider, name) {
        if(_.isString(provider)) {
            //file path
            if(fs.existsSync(provider)) {
                name = name || path.basename(provider, '.js');
                this._providers[name] = require(provider);
            } else {
                throw new Error('Provider path not found! ' + provider);
            }
        } else {
            //provider object
            this._providers[name] = provider;
        }
    },
    /**
     * Use provider
     * @param {String} provider Provider name
     * @param {Object} [providerParams] Provider params
     */
    use: function(provider, providerParams) {
        var self = this;
        if(this._providers[provider]) {
            this._provider = new this._providers[provider](providerParams);
            //Magic is here
            for(var method in this._provider) {
                if(method) {
                    if (_.isFunction(this._provider[method]) && !~['_init', 'constructor'].indexOf(method)) {
                        this[method] = self._provider[method].bind(self._provider);
                    }
                }
            }
        } else {
            throw new Error('Storage provider does not exists (' + provider + ')');
        }
    },
    _provider: null
};

module.exports = {
    StorageProvider: Storage,
    create: function(provider, providerParams) {
        return new Storage(provider, providerParams);
    }
};