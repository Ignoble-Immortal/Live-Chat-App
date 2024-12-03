# session-storage
---
Simple session storage engine

## Installation
---

```
$ npm install session-storage
```

## Usage

Include ```session-storage``` into your project and call ```.create()``` function.  
The interface is mostly common for all modules. But can differ from one to another.

```
    var Storage = require('session-storage').create('redis', {
        host: '192.168.1.1'
    });
    
    Storage.setValue('foo', 'bar', function(err, result) {
        //Error handling here
    });
```

All functions consider to have standart Node.JS callback notation ```callback(error, result)```  

## API
---

### Note
```session-storage``` exposes object, containing ```Storage``` class and ```.create()``` function. We recommend you to use creator function.

### Getting started

##### ```require('session-storage').create(provider, providerParams)``` Creates storage object.

###### Parameters
```provider``` Provider name that you will use. For now, possible values are ```file``` and ```redis```  
```providerParams``` It is object, containing provider-related parameters. Read them below
###### Returns
```Storage``` object


##### General functions list
---
All commands try to contain this functions. This is just simple and universal interface across different implementations.  
All functions have their `Sync` version. e.g. ```.setValueSync(key, value)```  

- ```.setValue(key, value, cb)``` Set value  
- ```.getValue(key, cb)``` Get value  
- ```.removeValue(key, cb)``` Remove value  
- ```.purge(cb)``` Clear all the values
- 
This functions are hash related. Currently implemented only for Redis provider via ```HSET``` etc functions
- ```.setHValue(hash, key, value, cb)``` Set value for hash
- ```.getHValue(hash, key, cb)``` Get value for hash
- ```.getHValues(hash, cb)``` Get ALL values for hash
- ```.removeHValue(hash, key, cb)``` Remove value for hash
- ```.purgeHash(hash, cb)``` Remove whole hash

#### Provider parameters
----
##### ```file```
All parameters are optional.
- ```where``` (___String___) Path to storage file. If empty will be placed into ```<system tmpdir>/sess_storage.json```
- ```loadOnInit``` (___Boolean___) Reloading from file on start
- ```syncInterval``` (___Number___) Interval of syncing on disk. If set to ```0``` will be assumed to 60 sec
- ```syncAlways``` (___Boolean___) If set we will sync evenry ```set``` or ```remove``` operation
- ```secureKey``` (___String___) Setting this will force to encrypt data when saving on disk
 
##### ```redis```
All parameters are optional.
- ```host``` (___String___) Redis host or ip
- ```port``` (___Number___) Redis port number
- ```secureKey``` (___String___) Setting this will force to encrypt data when saving to redis

## Examples
---
TODO


## LICENSE - "MIT License"
---

The MIT License (MIT)

Copyright (c) 2015 Aleksey Gorokhov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.