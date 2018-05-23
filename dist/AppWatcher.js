"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SyncMode_1 = require("./SyncMode");
var Options_1 = require("./Options");
var Watcher_1 = require("./Watcher");
var NowFiles_1 = require("./NowFiles");
var UXsyncNowREST_1 = require("./UXsyncNowREST");
var NowFile_1 = require("./NowFile");
var lodash_1 = require("lodash");
var Notify_1 = require("./Notify");
var Debug_1 = require("./Debug");
var AppWatcher = /** @class */ (function () {
    /**
     * Sets up an Application Watcher for the specified application.
     *
     * If *pullOnly* is not specified, then the application will setup
     * a file watcher to watch all the files synced.   Also a timer
     * will be created to check for any application file changes on the
     * instance.
     *
     * @param {string} app
     * @param {string} appName
     * @param {IAppWatcher} options
     */
    function AppWatcher(app, appName, options, whenDone) {
        var _this = this;
        this.app = app;
        this.appName = appName;
        this.debug = new Debug_1.Debug('AppWatcher');
        this.options = new Options_1.Options();
        this.tables = this.options.get('tables', {});
        this.watcher = null;
        this.watch = false;
        this.api = UXsyncNowREST_1.UXsyncNowREST.getUXsyncNowREST();
        this.pull = SyncMode_1.SyncMode.getSyncMode();
        this.pull.init = true;
        if (typeof options.sync !== 'undefined') {
            this.pull.initMode = options.sync;
        }
        else {
            this.pull.initMode = SyncMode_1.Sync.SYNC;
        }
        this.debug.log("App: " + app + " name: " + appName + " sync: " + this.pull.initMode);
        this.watch = options.pullOnly ? false : true;
        // If this is not a pull only run, then setup the interval pull from instance
        // and the file watcher
        if (this.watch) {
            this.debug.log('Setting up watch');
            var ms_1 = options.interval ? options.interval : 30000;
            this.pull.whenDone = function () {
                _this.debug.log('Got all the files');
                // When the initial pull is done, setup the timer to pull
                // from the instance
                Notify_1.Notify.showMessage = true;
                _this.interval = setInterval(function () { return _this.pullFromInstance(); }, ms_1);
                if (whenDone) {
                    _this.debug.log("Calling WhenDone");
                    whenDone();
                }
            };
            this.watcher = Watcher_1.Watcher.getWatcher();
            var files_1 = new NowFiles_1.NowFiles();
            this.watcher.onChange = function (file) {
                var f = files_1.find(file);
                if (f) {
                    f.processLocalFile();
                    f.processInstance("local");
                }
            };
        }
        else {
            this.pull.whenDone = function () {
                _this.debug.log("The initial pull is done");
                if (whenDone) {
                    _this.debug.log("Calling WhenDone");
                    whenDone();
                }
            };
        }
        this.pullFromInstance();
    }
    AppWatcher.prototype.close = function () {
        if (this.watch) {
            this.watcher.close();
        }
    };
    /**
     * Pull application files from the instance.
     */
    AppWatcher.prototype.pullFromInstance = function () {
        var _this = this;
        this.debug.log('Pull from instance', 2);
        this.api.getApplicationFiles(this.tables, this.app, this.now)
            .then(function (result) {
            _this.now = parseInt(result.now, 10);
            if (_this.pull.init) {
                _this.pull.filesToGet += result.files.length;
            }
            lodash_1.forEach(result.files, function (file) {
                if (file.fields) {
                    var files = new NowFiles_1.NowFiles();
                    if (_this.pull.init) {
                        _this.pull.filesToGet += file.fields.length - 1; // Handle if there are more than 1 field in a record
                    }
                    for (var i = 0; i < file.fields.length; i++) {
                        var fld = file.fields[i];
                        var fldcrc = parseInt(file.crc[i], 10);
                        //                                new NowFile(appName, file.table, file.sys_id, file.name, fld, parseInt(fldcrc, 10),parseInt(result.now));
                        // console.log('Got file ' + fld)
                        var f = files.find({
                            recordID: file.sys_id,
                            tableName: file.table,
                            fieldName: fld
                        });
                        if (f) {
                            //console.log("Found one in cache");
                            f.processLocalFile();
                            f.crc = fldcrc;
                            f.processInstance("instance");
                        }
                        else {
                            // New file on instance
                            var f_1 = new NowFile_1.NowFile(_this.appName, file.table, file.sys_id, file.name, fld, fldcrc, _this.now);
                            if (_this.watch) {
                                f_1.watch();
                            }
                        }
                    }
                }
            });
        });
    };
    AppWatcher.prototype.destroy = function () {
        if (this.watcher) {
            this.watcher.close();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    };
    return AppWatcher;
}());
exports.AppWatcher = AppWatcher;
//# sourceMappingURL=AppWatcher.js.map