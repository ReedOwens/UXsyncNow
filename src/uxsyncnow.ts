import {Options} from "./Options";
import {NowApplications} from "./NowApplications";
import * as vorpalPkg from "vorpal";
import {IRESTable, IRestFieldDef, IRESTTableDef, UXsyncNowREST} from "./UXsyncNowREST";
import {NowTables} from "./NowTables";
import {Debug} from "./Debug";
import {FileCache} from "./FileCache";
import {AppWatcher} from "./AppWatcher";
import {Sync} from "./SyncMode";
import * as minimist from "minimist";
import {NowFiles} from "./NowFiles";
import {NowFile} from "./NowFile";
import * as path from 'path';
import {Conflicts, IResolveMode} from "./Conflict";
import _ = require('lodash');

const vorpal = vorpalPkg();

let debug = new Debug('main');

// Process the command line

let args = minimist(process.argv.slice(2), {
    string: ['config', 'd', 'a'],
    boolean: ['prod', 'pull', 'push', 'sync', 'nowatch'],
    alias: {'h': 'help', 'p': 'prod', 'c': 'config', 'd': 'debug', 'a': 'areas'},
    default: {
        areas: '',
        debug: '0',
        c: 'dev',
        pull: false,
        push: false,
        sync: false,
        nowatch: false
    },
    unknown: function (arg: string): boolean {
        console.log('Unknown arg ' + arg);
        return false;
    }
});

// Setup debug level and filter from command lined
Debug.level = parseInt(args.debug);
if (args.areas != '') {
    _.forEach(args.areas.split(','), (area) => Debug.filter(area));
}

let configType = args.config;

if (args.prod) {
    configType = 'prod';
}

//Debug.logOut = vorpal.log;
Debug.vorpal = vorpal;

let options = new Options("./", configType);
let api = UXsyncNowREST.getUXsyncNowREST();
let applications = NowApplications.getNowApplications();
let cache = new FileCache();

// Print out the list of Tables and fields

function listTable(self: any, tables: IRESTable) {

    _.each(tables, (table: IRESTTableDef,) => {
        self.log(`${table.name} (${table.key})`);
        self.log("--------------------------------------------------------");
        _.each(table.fields, (field: IRestFieldDef) => {
            self.log('   ' +
                _.padEnd(field.name, 20) + ' ' +
                _.padEnd(field.label, 20) + ' ' +
                _.padEnd(field.type, 20) + ' '
            )
        });
        self.log();
    });
}

api.init()
    .then(() => {
        let apps = options.get('applications', {});
        let tables = options.get('tables', {});
        let app = null;
        let appWatcher: AppWatcher;

        function refreshApps(cb?: any) {
            debug.log('Getting Applications');
            applications
                .refresh()
                .then(() => {
                    apps = options.get('applications');
                    if (cb) cb();
                })

        }

        function refreshTables(cb: any) {
            debug.log('Getting Tables');
            NowTables.getNowTables()
                .refresh()
                .then(() => {
                    tables = options.get('tables');
                    if (cb) cb();
                });
        }

        function initSetup(cb?: any) {
            debug.log("Perform INIT");
            app = options.get('app');
            let sync = Sync.SYNC;
            if (args.push) {
                sync = Sync.PUSH;
            } else if (args.pull) {
                sync = Sync.PULL;
            }
            let interval = options.get('interval', 30000);

            if (typeof app !== 'undefined' && app['sys_id']) {
                if (appWatcher) {
                    appWatcher.close();
                }
                new NowFiles().clear();
                appWatcher = new AppWatcher(app['sys_id'], app['scope'], {
                    pullOnly: args.nowatch,
                    sync: sync,
                    interval: interval
                }, () => {
                    debug.log('GOT THE PULL');

                    let cl = new Conflicts().length;
                    if (cl > 0) {
                        vorpal.log(`${cl} Conflicts Detected in sync`)
                    }
                    if (cb) cb();
                })
            }
        }

        // init lists for first time
        if (api.connected) {
            initSetup();
        } else {
            console.log("You are not connected to your instance.  Please setup your connection.");
            console.log(api.errorMessage);
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
                    let tables = options.get('tables', {});
                    if (args.search) {
                        tables = _.filter(tables, (o: IRESTTableDef, k: string) => {
                            return (k.toLowerCase().indexOf(args.search.toLowerCase()) >= 0)
                        });
                    }
                    listTable(this, tables);
                    callback();
                });

            vorpal
                .command('list options', 'List all options')
                .action(function (args, callback) {
                    options.show();
                    callback();
                });

            vorpal
                .command('list files', 'List all mapped files')
                .action(function (args, callback) {
                    let names = new NowFiles().paths();
                    _.each(names, (file: string) => this.log(file));
                    callback();
                });

            vorpal
                .command('override add <source> <dest>')
                .action(function (args, callback) {
                    let nowFiles = new NowFiles();
                    let source = args.source;
                    if (!path.isAbsolute(source)) {
                        let baseDir = options.get("base_dir", "./");
                        source = path.normalize(baseDir + path.sep + source);
                    }
                    let file = nowFiles.find(source);
                    if (!file) {
                        this.log("Could not find mapped file : " + source);
                    } else {
                        let fileOverride = options.get("file_override", []);
                        fileOverride.push({
                            source: path.normalize(args.source),
                            dest: args.dest
                        });
                        options.set("file_override", fileOverride);
                        options.save();
                        // Add new NowFile again.  The new override will be used in it's creation
                        let newFile = new NowFile(file.applicationName,
                            file.tableName,
                            file.recordID,
                            file.recordName,
                            file.fieldName,
                            file.crc);

                        newFile.watch();
                        file.unWatch();

                        nowFiles.remove(file);
                    }
                    callback();
                });

            vorpal
                .command('override remove <source>>')
                .action(function (args, callback) {
                    let fileOverride = options.get("file_override", []);

                    let override = _.find(fileOverride, {source: args.source});

                    if (!override) {
                        this.log("Could not find override with source of :\n   " + args.source);
                    } else {
                        let nowFiles = new NowFiles();
                        let dest = override['dest'];
                        if (!path.isAbsolute(dest)) {
                            let baseDir = options.get("base_dir", "./");
                            dest = path.normalize(baseDir + path.sep + dest);
                        }

                        let file = nowFiles.find(dest);
                        if (!file) {
                            this.log("Could not find mapped file : " + dest);
                        } else {
                            file.unWatch();
                            _.remove(fileOverride, override);
                            options.set('file_override', fileOverride);
                            options.save();

                            let newFile = new NowFile(file.applicationName,
                                file.tableName,
                                file.recordID,
                                file.recordName,
                                file.fieldName,
                                file.crc);
                            newFile.watch();
                            nowFiles.remove(file);

                        }
                    }
                    callback();
                });

            vorpal
                .command('list overrides', 'List the file overrides')
                .action(function (args, callback) {
                    let fileOverride = options.get("file_override", []);
                    _.forEach(fileOverride, (over) => {
                        this.log(over['source'] + '\n---> ' + over['dest']);
                    });
                    callback();
                });
            vorpal
                .command('set app [value]', 'Sets the current application')
                .action(function (args, callback) {
                    if (typeof args.value === 'undefined') {
                        // Prompt for the app
                        this.log('Prompt');
                    } else {
                        var app;
                        this.log('lookup :' + args.value);
                        var pred = 'id';
                        if (isNaN(args.value)) {
                            pred = 'name';
                        }
                        app = applications.findBy(pred, args.value);
                        if (app) {
                            this.log("Found : " + app.name + " (" + app.sys_id + ")");
                            options.set('app', app);
                            options.save();
                        } else {
                            this.log(args.value + " is not an application");
                        }
                    }
                    callback();
                });

            vorpal
                .command('set option <option> [value]', "Sets the option to specified value or prompts for the value if not provided")
                .autocomplete(options.asArray())
                .action(function (args, callback) {
                    if (typeof args.value === 'undefined') {
                        let type = 'input';
                        if (args.option === 'password') type = 'password';
                        this.prompt({
                            type: type,
                            name: 'value',
                            default: options.get(args.option),
                            message: options.help(args.option) + `\n${args.option} = `,
                        }, (result) => {
                            options.set(args.option, result.value);
                            options.save();
                            callback();
                        });
                    } else {
                        options.set(args.option, args.value);
                        options.save();
                        callback();
                    }
                });

            vorpal
                .command('test', "Tests the connection to the instance")
                .action(function (args, callback) {
                    api.init().then(() => {
                        if (api.connected) {
                            // Ok try the API
                            this.log("Connected!");
                        } else {
                            this.log("Not connected.\n" + api.errorMessage);
                        }
                        callback();
                    })
                    ;
                });

            vorpal
                .command('list apps', 'List all the ServiceNow Applications')
                .action(function (args, callback) {
                    let list = apps;
                    for (let name in list) {
                        let app = list[name];
                        this.log(_.padEnd(app['id'] + ")", 4, ' ') + _.padEnd(app['scope'], 20, ' ') + ' ' +
                            _.padEnd(name, 40, ' ') + " version: " + app['version']);
                    }
                    callback();
                });

            vorpal
                .command('refresh apps', 'Refreshes the current list of ServiceNow Applications')
                .action(function (args, callback) {


                    this.log("Refreshing applications");
                    refreshApps(() => {
                        this.log("Done.");
                        callback();
                    });
                });
            vorpal
                .command('refresh all', 'Refreshes the the Applications and tables from the Instance')
                .action(function (args, callback) {
                    this.log("Refreshing applications");
                    refreshApps(() => {
                        this.log("Refreshing tables");
                        refreshTables(() => {
                            this.log("Done.");
                            callback();
                        });
                    });
                });

            vorpal
                .command('refresh tables', 'Refreshes the tables that are synchronized.  If you add new fields to tables that are HTML/XML/Script then you will need to run this command to pick up the new fields.  ')
                .action(function (args, callback) {
                    this.log("Refreshing tables");
                    refreshTables(() => {
                        this.log("Done.");
                        callback();
                    });
                });

            vorpal
                .command('conflicts', 'Shows all detected conflicts during synchronization')
                .action(function (args, callback) {
                    let conflicts = new Conflicts();
                    let list = conflicts.list;
                    for (let i = 0; i < list.length; i++) {
                        this.log(_.pad(i + ') ', 5) + list[i].fileName);
                    }
                    callback();
                });

            vorpal
                .command('resolve <conflictNumber> <mode>', 'Resolves conflict number by specified mode.  Number can be all to resolve all conflicts.  Mode can be PULL, PUSH, or MERGE.')
                .action(function (args, callback) {
                    let conflicts = new Conflicts();
                    let list = conflicts.list;
                    let mode = args.mode.toUpperCase();

                    if (mode !== 'PULL' && mode !== 'PUSH' && mode !== 'MERGE') {
                        this.log(`You have specified an invalid mode: ${mode}.  Pleases use PULL, PUS, or MERGE`);
                        callback()
                    } else {
                        let start = 0;
                        let end = list.length;
                        let num = args.conflictNumber;
                        if (typeof num === 'number') {
                            // Ok should have a numb;
                            start = end = num;
                            end++;
                        }
                        this.log('Resolving conflicts by mode: ' + mode);
                        for (let i = end - 1; i >= start; i--) {
                            this.log('  ' + list[i].fileName);
                            let file = list[i];
                            let rmode: IResolveMode;

                            switch (mode) {
                                case 'PULL' :
                                    rmode = IResolveMode.PULL;
                                    break;
                                case 'PUSH' :
                                    rmode = IResolveMode.PUSH;
                                    break;
                                case 'MERGE' :
                                    rmode = IResolveMode.MERGE;
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
                    Debug.level = parseInt(args.level);
                    callback();
                });

            vorpal
                .command('debug filter <area>', 'Filter debug statements from specified area')
                .action(function (args, callback) {
                    Debug.filter(args.area);
                    callback();
                });

            vorpal
                .command('debug reset', 'Resets debug to off and startup settings')
                .action(function (args, callback) {
                    Debug.level = 0;
                    Debug.resetFilter();
                    callback();
                });

            vorpal
                .command('debug areas', 'Shows all debug areas')
                .action(function (args, callback) {
                    let areas = Debug.areas;
                    this.log("Debug Areas : " + areas.join(', '));
                    callback();
                });

            vorpal
                .delimiter('uxsyncnow: ')
                .show();
        }
        ;
    });
