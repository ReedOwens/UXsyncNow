"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Options_1 = require("./Options");
var NowApplications_1 = require("./NowApplications");
var vorpalPkg = require("vorpal");
var UXsyncNowREST_1 = require("./UXsyncNowREST");
var NowTables_1 = require("./NowTables");
var Debug_1 = require("./Debug");
var FileCache_1 = require("./FileCache");
var AppWatcher_1 = require("./AppWatcher");
var SyncMode_1 = require("./SyncMode");
var minimist = require("minimist");
var NowFiles_1 = require("./NowFiles");
var NowFile_1 = require("./NowFile");
var path = require("path");
var Conflict_1 = require("./Conflict");
var _ = require("lodash");
var npmpackage = require("../package.json");
var vorpal = vorpalPkg();
var debug = new Debug_1.Debug('main');
// Print out the list of Tables and fields
function listTable(self, tables) {
    _.each(tables, function (table) {
        self.log(table.name + " (" + table.key + ")");
        self.log("--------------------------------------------------------");
        _.each(table.fields, function (field) {
            self.log('   ' +
                _.padEnd(field.name, 20) + ' ' +
                _.padEnd(field.label, 20) + ' ' +
                _.padEnd(field.type, 20) + ' ');
        });
        self.log();
    });
}
// Process the command line
var args = minimist(process.argv.slice(2), {
    string: ['config', 'd', 'a'],
    boolean: ['prod', 'pull', 'push', 'sync', 'nowatch', 'noinit', 'version'],
    alias: { 'h': 'help', 'p': 'prod', 'c': 'config', 'd': 'debug', 'a': 'areas', 'v': 'version' },
    default: {
        areas: '',
        noinit: false,
        debug: '0',
        c: 'dev',
        pull: false,
        push: false,
        sync: false,
        nowatch: false
    },
    unknown: function (arg) {
        console.log('Unknown arg ' + arg);
        return false;
    }
});
if (args.version) {
    console.log("UXsyncNow Version: " + npmpackage.version);
}
else {
    // Setup debug level and filter from command lined
    Debug_1.Debug.level = parseInt(args.debug);
    if (args.areas != '') {
        _.forEach(args.areas.split(','), function (area) { return Debug_1.Debug.filter(area); });
    }
    var configType = args.config;
    if (args.prod) {
        configType = 'prod';
    }
    //Debug.logOut = vorpal.log;
    Debug_1.Debug.vorpal = vorpal;
    var options_1 = new Options_1.Options("./", configType);
    var api_1 = UXsyncNowREST_1.UXsyncNowREST.getUXsyncNowREST();
    var applications_1 = NowApplications_1.NowApplications.getNowApplications();
    var cache = new FileCache_1.FileCache();
    api_1.init()
        .then(function () {
        var apps = options_1.get('applications', {});
        var tables = options_1.get('tables', {});
        var multifile = options_1.get('multifile', 'record');
        var app = null;
        var appWatcher;
        function refreshApps(cb) {
            debug.log('Getting Applications');
            applications_1
                .refresh()
                .then(function () {
                apps = options_1.get('applications');
                if (cb)
                    cb();
            });
        }
        function refreshTables(cb) {
            debug.log('Getting Tables');
            NowTables_1.NowTables.getNowTables()
                .refresh()
                .then(function () {
                tables = options_1.get('tables');
                if (cb)
                    cb();
            });
        }
        function initSetup(cb) {
            debug.log("Perform INIT");
            app = options_1.get('app');
            var sync = SyncMode_1.Sync.SYNC;
            if (args.push) {
                sync = SyncMode_1.Sync.PUSH;
            }
            else if (args.pull) {
                sync = SyncMode_1.Sync.PULL;
            }
            var interval = options_1.get('interval', 30000);
            if (typeof app !== 'undefined' && app['sys_id']) {
                if (appWatcher) {
                    appWatcher.close();
                }
                new NowFiles_1.NowFiles().clear();
                appWatcher = new AppWatcher_1.AppWatcher(app['sys_id'], app['scope'], {
                    pullOnly: args.nowatch,
                    sync: sync,
                    interval: interval
                }, function () {
                    debug.log('GOT THE PULL');
                    var cl = new Conflict_1.Conflicts().length;
                    if (cl > 0) {
                        vorpal.log(cl + " Conflicts Detected in sync");
                    }
                    if (cb)
                        cb();
                });
            }
        }
        // init lists for first time
        if (api_1.connected) {
            if (args.noinit) {
                console.log("You are connected but no synchronization is started.  Use command 'sync' to start synchronization.");
            }
            else {
                initSetup();
            }
        }
        else {
            console.log("You are not connected to your instance.  Please setup your connection.");
            console.log(api_1.errorMessage);
        }
        if (!args.nowatch) {
            vorpal
                .command('sync', 'Sets up the synchronization between the localfile system and the instance')
                .action(function (args, callback) {
                initSetup(callback);
            });
            vorpal
                .command('list tables [search]', 'List all tables that contain fields that will be mapped')
                .action(function (args, callback) {
                var tables = options_1.get('tables', {});
                if (args.search) {
                    tables = _.filter(tables, function (o, k) {
                        return (k.toLowerCase().indexOf(args.search.toLowerCase()) >= 0);
                    });
                }
                listTable(this, tables);
                callback();
            });
            vorpal
                .command('list options', 'List all options')
                .action(function (args, callback) {
                options_1.show();
                callback();
            });
            vorpal
                .command('list files', 'List all mapped files')
                .action(function (args, callback) {
                var _this = this;
                var names = new NowFiles_1.NowFiles().paths();
                _.each(names, function (file) { return _this.log(file); });
                callback();
            });
            vorpal
                .command('override add <source> <dest>')
                .action(function (args, callback) {
                var nowFiles = new NowFiles_1.NowFiles();
                var source = args.source;
                if (!path.isAbsolute(source)) {
                    var baseDir = options_1.get("base_dir", "./");
                    source = path.normalize(baseDir + path.sep + source);
                }
                var file = nowFiles.find(source);
                if (!file) {
                    this.log("Could not find mapped file : " + source);
                }
                else {
                    var fileOverride = options_1.get("file_override", []);
                    fileOverride.push({
                        source: path.normalize(args.source),
                        dest: args.dest
                    });
                    options_1.set("file_override", fileOverride);
                    options_1.save();
                    // Add new NowFile again.  The new override will be used in it's creation
                    var newFile = new NowFile_1.NowFile(file.applicationName, file.tableName, file.recordID, file.recordName, file.fieldName, file.crc);
                    newFile.watch();
                    file.unWatch();
                    nowFiles.remove(file);
                }
                callback();
            });
            vorpal
                .command('override remove <source>>')
                .action(function (args, callback) {
                var fileOverride = options_1.get("file_override", []);
                var override = _.find(fileOverride, { source: args.source });
                if (!override) {
                    this.log("Could not find override with source of :\n   " + args.source);
                }
                else {
                    var nowFiles = new NowFiles_1.NowFiles();
                    var dest = override['dest'];
                    if (!path.isAbsolute(dest)) {
                        var baseDir = options_1.get("base_dir", "./");
                        dest = path.normalize(baseDir + path.sep + dest);
                    }
                    var file = nowFiles.find(dest);
                    if (!file) {
                        this.log("Could not find mapped file : " + dest);
                    }
                    else {
                        file.unWatch();
                        _.remove(fileOverride, override);
                        options_1.set('file_override', fileOverride);
                        options_1.save();
                        var newFile = new NowFile_1.NowFile(file.applicationName, file.tableName, file.recordID, file.recordName, file.fieldName, file.crc);
                        newFile.watch();
                        nowFiles.remove(file);
                    }
                }
                callback();
            });
            vorpal
                .command('list overrides', 'List the file overrides')
                .action(function (args, callback) {
                var _this = this;
                var fileOverride = options_1.get("file_override", []);
                _.forEach(fileOverride, function (over) {
                    _this.log(over['source'] + '\n---> ' + over['dest']);
                });
                callback();
            });
            vorpal
                .command('set app <value>', 'Sets the current application')
                .action(function (args, callback) {
                // todo: implement prompt later
                if (typeof args.value === 'undefined') {
                    // Prompt for the app
                    this.log('Prompt');
                }
                else {
                    var app;
                    this.log('lookup :' + args.value);
                    var pred = 'id';
                    if (isNaN(args.value)) {
                        pred = 'name';
                    }
                    app = applications_1.findBy(pred, args.value);
                    if (app) {
                        this.log("Found : " + app.name + " (" + app.sys_id + ")");
                        options_1.set('app', app);
                        options_1.save();
                    }
                    else {
                        this.log(args.value + " is not an application");
                    }
                }
                callback();
            });
            vorpal
                .command('set option <option> [value]', "Sets the option to specified value or prompts for the value if not provided")
                .autocomplete(options_1.asArray())
                .action(function (args, callback) {
                if (typeof args.value === 'undefined') {
                    var type = 'input';
                    if (args.option === 'password')
                        type = 'password';
                    this.prompt({
                        type: type,
                        name: 'value',
                        default: options_1.get(args.option),
                        message: options_1.help(args.option) + ("\n" + args.option + " = "),
                    }, function (result) {
                        options_1.set(args.option, result.value);
                        options_1.save();
                        callback();
                    });
                }
                else {
                    options_1.set(args.option, args.value);
                    options_1.save();
                    callback();
                }
            });
            vorpal
                .command('connect', "Connect to the instance")
                .action(function (args, callback) {
                var _this = this;
                api_1.init().then(function () {
                    if (api_1.connected) {
                        // Ok try the API
                        _this.log("Connected!");
                    }
                    else {
                        _this.log("Not connected.\n" + api_1.errorMessage);
                    }
                    callback();
                });
            });
            vorpal
                .command('list apps', 'List all the ServiceNow Applications')
                .action(function (args, callback) {
                var list = apps;
                for (var name_1 in list) {
                    var app_1 = list[name_1];
                    this.log(_.padEnd(app_1['id'] + ")", 4, ' ') + _.padEnd(app_1['scope'], 20, ' ') + ' ' +
                        _.padEnd(name_1, 40, ' ') + " version: " + app_1['version']);
                }
                callback();
            });
            vorpal
                .command('refresh apps', 'Refreshes the current list of ServiceNow Applications')
                .action(function (args, callback) {
                var _this = this;
                this.log("Refreshing applications");
                refreshApps(function () {
                    _this.log("Done.");
                    callback();
                });
            });
            vorpal
                .command('refresh all', 'Refreshes the the Applications and tables from the Instance')
                .action(function (args, callback) {
                var _this = this;
                this.log("Refreshing applications");
                refreshApps(function () {
                    _this.log("Refreshing tables");
                    refreshTables(function () {
                        _this.log("Done.");
                        callback();
                    });
                });
            });
            vorpal
                .command('refresh tables', 'Refreshes the tables that are synchronized.  If you add new fields to tables that are HTML/XML/Script then you will need to run this command to pick up the new fields.  ')
                .action(function (args, callback) {
                var _this = this;
                this.log("Refreshing tables");
                refreshTables(function () {
                    _this.log("Done.");
                    callback();
                });
            });
            vorpal
                .command('conflicts', 'Shows all detected conflicts during synchronization')
                .action(function (args, callback) {
                var conflicts = new Conflict_1.Conflicts();
                var list = conflicts.list;
                for (var i = 0; i < list.length; i++) {
                    this.log(_.pad(i + ') ', 5) + list[i].fileName);
                }
                callback();
            });
            vorpal
                .command('resolve <conflictNumber> <mode>', 'Resolves conflict number by specified mode.  Number can be all to resolve all conflicts.  Mode can be PULL, PUSH, or MERGE.')
                .action(function (args, callback) {
                var conflicts = new Conflict_1.Conflicts();
                var list = conflicts.list;
                var mode = args.mode.toUpperCase();
                if (mode !== 'PULL' && mode !== 'PUSH' && mode !== 'MERGE') {
                    this.log("You have specified an invalid mode: " + mode + ".  Pleases use PULL, PUS, or MERGE");
                    callback();
                }
                else {
                    var start = 0;
                    var end = list.length;
                    var num = args.conflictNumber;
                    if (typeof num === 'number') {
                        // Ok should have a numb;
                        start = end = num;
                        end++;
                    }
                    this.log('Resolving conflicts by mode: ' + mode);
                    for (var i = end - 1; i >= start; i--) {
                        this.log('  ' + list[i].fileName);
                        var file = list[i];
                        var rmode = void 0;
                        switch (mode) {
                            case 'PULL':
                                rmode = Conflict_1.IResolveMode.PULL;
                                break;
                            case 'PUSH':
                                rmode = Conflict_1.IResolveMode.PUSH;
                                break;
                            case 'MERGE':
                                rmode = Conflict_1.IResolveMode.MERGE;
                                break;
                        }
                        conflicts.resolve(file, rmode);
                    }
                    callback();
                }
            });
            vorpal
                .command('debug level <level>', 'Set the debug level')
                .action(function (args, callback) {
                Debug_1.Debug.level = parseInt(args.level);
                callback();
            });
            vorpal
                .command('debug filter <area>', 'Filter debug statements from specified area')
                .action(function (args, callback) {
                Debug_1.Debug.filter(args.area);
                callback();
            });
            vorpal
                .command('debug reset', 'Resets debug to off and startup settings')
                .action(function (args, callback) {
                Debug_1.Debug.level = 0;
                Debug_1.Debug.resetFilter();
                callback();
            });
            vorpal
                .command('debug areas', 'Shows all debug areas')
                .action(function (args, callback) {
                var areas = Debug_1.Debug.areas;
                this.log("Debug Areas : " + areas.join(', '));
                callback();
            });
            vorpal
                .delimiter('uxsyncnow: ')
                .show();
        }
    });
}
//# sourceMappingURL=uxsyncnow.js.map