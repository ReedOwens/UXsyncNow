"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileCache_1 = require("./FileCache");
var Watcher_1 = require("./Watcher");
var Options_1 = require("./Options");
var SyncMode_1 = require("./SyncMode");
var fs = require("fs");
var Notify_1 = require("./Notify");
var UXsyncNowREST_1 = require("./UXsyncNowREST");
var path = require("path");
var NowFiles_1 = require("./NowFiles");
var lodash_1 = require("lodash");
var mkdirp = require("mkdirp");
var Debug_1 = require("./Debug");
var Conflict_1 = require("./Conflict");
var EXTENSIONS = {
    html_template: "html",
    html_script: "html",
    html: "html",
    translated_html: "html",
    css: "css",
    "json": "js",
    script: "js",
    script_plain: "js",
    script_server: "js",
    xml: "xml"
};
var NowFile = /** @class */ (function () {
    function NowFile(_applicationName, _tableName, _recordID, _recordName, _fieldName, instanceCRC, now) {
        // Determine path
        // If file exists, read it in then check if content from the instance was provided
        //   if provided, then update the file with the content and instanceLastUpdated time.
        //       NOTE: If the content is the same then the file will not be updated
        this._applicationName = _applicationName;
        this._tableName = _tableName;
        this._recordID = _recordID;
        this._recordName = _recordName;
        this._fieldName = _fieldName;
        this.localCRC = 0;
        this.initialized = false;
        this.initProcessed = 0;
        this.api = UXsyncNowREST_1.UXsyncNowREST.getUXsyncNowREST();
        this.syncLocal = 0;
        this.syncServer = 0;
        // Name of the file in the filesystem
        this._fileName = "";
        this._crc = 0;
        NowFile.debug.log("Creating new File");
        var mode = new SyncMode_1.SyncMode();
        if (typeof now !== "undefined") {
            this.syncServer = now;
        }
        this._crc = instanceCRC ? instanceCRC : 0;
        var options = Options_1.Options.getOptions();
        var topDir = options.get("top_dir", "instance");
        var basedir = options.get("base_dir", "./");
        var fileOverride = options.get("file_override", []);
        // Get the cached info on the local/instance crc and sync times
        // Todo: add top_dir override
        // Todo: add base_dir override
        // Todo: add application dir override
        // Todo: add table dir override
        // Todo: add File location override
        var tables = options.get("tables", {});
        var table = lodash_1.find(tables, { name: _tableName });
        if (!table) {
            // todo: Handle error
            console.log("ERROR: " + _tableName + " was not found in the tables for the application");
            mode.filesReceived++;
        }
        else {
            var recordName = _recordName.replace(/[\\\/]/gm, '_');
            var field = lodash_1.find(table.fields, { name: this._fieldName });
            if (!field) {
                console.log("ERROR: " + _fieldName + " was not found in " + _tableName);
                mode.filesReceived++;
                // todo: handle error
            }
            else {
                var multifile = options.get('multifile', 'record').toLowerCase();
                var mmode = 'record';
                if (multifile === 'flat')
                    mmode = 'flat';
                if (multifile === 'field')
                    mmode = 'field';
                var extension = EXTENSIONS[field.type];
                var base = path.normalize(basedir);
                if (table.fields.length > 1 && mmode !== 'flat') {
                    // This table has multiple fields
                    if (mmode === 'record') {
                        this._fileName = path.normalize(base +
                            path.sep +
                            topDir +
                            path.sep +
                            _applicationName +
                            path.sep +
                            _tableName +
                            path.sep +
                            recordName +
                            path.sep +
                            _fieldName +
                            "." +
                            extension);
                    }
                    else {
                        this._fileName = path.normalize(base +
                            path.sep +
                            topDir +
                            path.sep +
                            _applicationName +
                            path.sep +
                            _tableName +
                            path.sep +
                            _fieldName +
                            path.sep +
                            recordName +
                            "." +
                            extension);
                    }
                }
                else {
                    // If flat use the original method otherwise remove the field name
                    if (mmode === 'flat') {
                        this._fileName = path.normalize(base +
                            path.sep +
                            topDir +
                            path.sep +
                            _applicationName +
                            path.sep +
                            _tableName +
                            path.sep +
                            recordName +
                            "_" +
                            _fieldName +
                            "." +
                            extension);
                    }
                    else {
                        this._fileName = path.normalize(base +
                            path.sep +
                            topDir +
                            path.sep +
                            _applicationName +
                            path.sep +
                            _tableName +
                            path.sep +
                            recordName +
                            "." +
                            extension);
                    }
                }
                var relSource = path.relative(base, this._fileName);
                NowFile.debug.log('Relative path is ' + relSource);
                // Check and see if there is an override for this file
                var over = lodash_1.find(fileOverride, { source: relSource });
                if (over) {
                    var dest = over['dest'];
                    NowFile.debug.log('Found override ' + dest);
                    if (dest) {
                        if (!path.isAbsolute(dest)) {
                            dest = path.normalize(base + path.sep + dest);
                        }
                    }
                    console.log('Map to ' + dest);
                    this._fileName = dest;
                }
                this.processLocalFile();
                if (this._crc !== this.localCRC) {
                    NowFile.debug.log("Need to process the Instance  " + this._tableName + ", " + this._recordName + " " + this._fieldName + " -> " + this._crc + "  " + this.localCRC);
                    // OK the Server CRC is different than the Local CRC  Check and see if we are initing
                    // todo: do sync for init
                    this.processInstance();
                }
                else {
                    var stats = fs.statSync(this._fileName);
                    FileCache_1.FileCache.getFileCache().set(this._fileName, {
                        serverCRC: instanceCRC,
                        clientCRC: this.crc,
                        serverSync: now ? now : -1,
                        clientSync: new Date(stats.mtime + '').getTime()
                    });
                    mode.filesReceived++;
                }
                new NowFiles_1.NowFiles().add(this);
            }
        }
    }
    Object.defineProperty(NowFile.prototype, "fileName", {
        get: function () {
            return this._fileName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "crc", {
        get: function () {
            return this._crc;
        },
        set: function (value) {
            this._crc = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "applicationName", {
        get: function () {
            return this._applicationName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "tableName", {
        get: function () {
            return this._tableName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "recordID", {
        get: function () {
            return this._recordID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "recordName", {
        get: function () {
            return this._recordName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowFile.prototype, "fieldName", {
        get: function () {
            return this._fieldName;
        },
        enumerable: true,
        configurable: true
    });
    NowFile.prototype.watch = function () {
        NowFile.debug.log("Add Watcher " + this._fileName, 2);
        Watcher_1.Watcher.getWatcher().add(this._fileName);
    };
    NowFile.prototype.unWatch = function () {
        NowFile.debug.log("Remove Watcher " + this._fileName, 2);
        Watcher_1.Watcher.getWatcher().remove(this._fileName);
    };
    NowFile.prototype.processLocalFile = function () {
        try {
            var contents = fs.readFileSync(this._fileName);
            this.localCRC = this.calcCRC(contents.toString());
        }
        catch (e) {
            //console.log(`File: '${this._fileName}' doesn't exist`);
        }
        this.initUpdate(1);
    };
    NowFile.prototype.processInstance = function (change) {
        if (change === void 0) { change = "none"; }
        var fileCache = FileCache_1.FileCache.getFileCache();
        // Lets figure out the mode
        var sync = SyncMode_1.SyncMode.getSyncMode();
        var mode = sync.mode;
        if (sync.init) {
            // override if ininiting
            mode = sync.initMode;
            //todo: This is init and there is a difference.  Check and see if local file changed since last write
            // This is an init.  Lets check to see if the there is a change on the server
            var cache = fileCache.get(this._fileName);
            var server = false;
            var client = false;
            // Ok we've syned at least once
            if (cache.serverCRC !== FileCache_1.IGNORE && cache.serverCRC !== this.crc) {
                // There was a server changed.
                server = true;
            }
            /*            if (cache.serverSync !== IGNORE && cache.serverSync !== this.syncServer) {
                            // There was a server changed.
                            server = true;
                        }
            */
            if (cache.clientCRC !== FileCache_1.IGNORE && cache.clientCRC !== this.localCRC) {
                // There was a client changed.
                client = true;
            }
            /*
                        if (cache.clientSync !== IGNORE && cache.clientSync !== this.syncLocal) {
                            // There was a client changed.
                            client = true;
                        }
            */
            if (client && server) {
                // there was both a client and server change... Conflict MUST be resolved
                if (mode == SyncMode_1.Sync.SYNC) {
                    // Check and see if the local file doesn't exist anymore
                    if (fs.existsSync(this.fileName)) {
                        // OK file exists and is different on the client too.
                        mode = -1; // Ignore the pull/push for now and post sync error
                        NowFile.debug.log("SYNC ERROR for : " + this.fileName);
                        new Conflict_1.Conflicts().add(this); // must be done before filesReceived for callback purposes.
                        sync.filesReceived++; // Mark it as complete as we can't pull/push
                    }
                    else {
                        // File is not local, so lets pull from server
                        mode = SyncMode_1.Sync.PULL;
                    }
                }
                // IF it's not SYNC, then the methodology is PUSH or PULL and doesn't need to be changed.
            }
            else {
                if (client) {
                    mode = SyncMode_1.Sync.PUSH; // Push the change
                }
                else {
                    mode = SyncMode_1.Sync.PULL; // Pull the change
                }
            }
        }
        if (this.localCRC === this.crc) {
            sync.filesReceived++;
            return;
        }
        if (mode == SyncMode_1.Sync.SYNC) {
            // Check for conflicts and change mode appropriately && direction
            if (change == "local") {
                mode = SyncMode_1.Sync.PUSH;
            }
            else if (change == "instance") {
                mode = SyncMode_1.Sync.PULL;
            }
            /*else if (this.syncLocal === 0) {
                // This is the first sync from the server so change to Instance
                mode = Sync.INSTANCE;
            } else if (this.syncServer === 0) {
                // Don't know how we would get here as we should always have as sync time
                // from server.  Only way is it's the first sync and then local should be 0
                // too.
                mode = Sync.INSTANCE;
            } else if (this.localCRC !== this.crc) {
                if (this.syncServer === 0 || this.syncLocal === 0) {
                    // One of the syncs is not set.
                }
            }
            */
        }
        switch (mode) {
            case SyncMode_1.Sync.PUSH:
            case SyncMode_1.Sync.LOCAL:
                // todo: push change
                NowFile.debug.log("Save to instance " + this._tableName + ", " + this._fieldName + ", " + this._recordID);
                NowFile.debug.log("  " + this._fileName);
                this.pushFile();
                break;
            case SyncMode_1.Sync.PULL:
            case SyncMode_1.Sync.INSTANCE:
                // Get the file from the server and over write the current file on the filesystem
                this.pullFile();
                break;
        }
    };
    NowFile.prototype.pushFile = function () {
        var _this = this;
        var fileCache = FileCache_1.FileCache.getFileCache();
        var sync = SyncMode_1.SyncMode.getSyncMode();
        // Push file contents to the Instance
        NowFile.debug.log('Pushing from instance');
        var localContents = fs.readFileSync(this._fileName);
        if (localContents) {
            this.api
                .saveFile(this._tableName, this._recordID, this._fieldName, localContents.toString())
                .then(function (result) {
                NowFile.debug.log("Got save response");
                sync.filesReceived++;
                _this._crc = result.result;
                _this.localCRC = _this._crc;
                var stats = fs.statSync(_this._fileName);
                fileCache.set(_this._fileName, {
                    serverCRC: _this.crc,
                    clientCRC: _this.crc,
                    serverSync: parseInt(result.now, 10),
                    clientSync: new Date(stats.mtime + '').getTime()
                });
                Notify_1.Notify.message("" + path.basename(_this._fileName), "Sent to Instance");
            }, function (err) {
                sync.filesReceived++;
                console.log("Got error on getfile " + err);
            });
        }
        else {
            NowFile.debug.log('No content from : ' + this._fieldName);
        }
    };
    NowFile.prototype.pullFile = function () {
        var _this = this;
        var fileCache = FileCache_1.FileCache.getFileCache();
        var sync = SyncMode_1.SyncMode.getSyncMode();
        // PUll file contents from the Instance
        NowFile.debug.log('Pulling from instance');
        this.api.getFile(this._tableName, this._recordID, this._fieldName).then(function (results) {
            var files = results.files;
            var content = files[_this._fieldName];
            var CRC = _this.calcCRC(content);
            NowFile.debug.log("writing from server" + _this._fileName + " -> " + _this._fieldName + " crc " + CRC + " instance " + _this._crc);
            _this._crc = CRC;
            _this.localCRC = CRC;
            var dirName = path.dirname(_this._fileName);
            mkdirp.sync(dirName);
            fs.writeFileSync(_this._fileName, content);
            _this.initUpdate(2); // Done a write
            var stats = fs.statSync(_this._fileName);
            fileCache.set(_this._fileName, {
                serverCRC: _this.crc,
                clientCRC: _this.crc,
                serverSync: parseInt(results.now, 10),
                clientSync: new Date(stats.mtime + '').getTime()
            });
            Notify_1.Notify.message("" + path.basename(_this._fileName), "Received from Instance", "cloud-download.png");
            sync.filesReceived++;
        }, function (err) {
            sync.filesReceived++;
            console.log("Got error on getfile " + err);
        });
    };
    NowFile.prototype.mergeFile = function () {
        var _this = this;
        // Handle MERGE by getting the file contents from the Instance and store in a file with .merge extension
        NowFile.debug.log('Merging from instance');
        this.api.getFile(this._tableName, this._recordID, this._fieldName).then(function (results) {
            var files = results.files;
            var content = files[_this._fieldName];
            NowFile.debug.log("writing from server merge file " + _this._fileName + ".merge");
            var dirName = path.dirname(_this._fileName);
            mkdirp.sync(dirName);
            fs.writeFileSync(_this._fileName + ".merge", content);
            Notify_1.Notify.message("" + path.basename(_this._fileName), "Received from Instance", "cloud-download.png");
        }, function (err) {
            console.log("Got error on getfile " + err);
        });
    };
    /**
     * Calculate a 32 bit FNV-1a hash
     * Found here: https://gist.github.com/vaiorabbit/5657561
     * Ref.: http://isthe.com/chongo/tech/comp/fnv/
     *
     * @param {string} str the input value
     * @param {boolean} [asString=false] set to true to return the hash value as
     *     8-digit hex string instead of an integer
     * @param {integer} [seed] optionally pass the hash of the previous chunk
     * @returns {integer | string}
     */
    NowFile.prototype.hashFnv32a = function (str) {
        /*jshint bitwise:false */
        var i, l, hval = 0x811c9dc5;
        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval +=
                (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    };
    NowFile.prototype.calcCRC = function (str) {
        return this.hashFnv32a(str);
    };
    /**
     * Update the cache with the current information
     */
    NowFile.prototype.updateCache = function () {
        //        getCache().update(this.filename, this.localCRC, this.crc, this.syncLocal, this.syncServer);
    };
    NowFile.prototype.initUpdate = function (val) {
        this.initProcessed |= val;
        if (this.initProcessed & 3) {
            this.initialized = true;
        }
    };
    NowFile.debug = new Debug_1.Debug('NowFile');
    return NowFile;
}());
exports.NowFile = NowFile;
//# sourceMappingURL=NowFile.js.map