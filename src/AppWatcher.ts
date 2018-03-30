import {Sync, SyncMode} from "./SyncMode";
import {Options} from "./Options";
import {Watcher} from "./Watcher";
import {NowFiles} from "./NowFiles";
import {UXsyncNowREST} from "./UXsyncNowREST";
import {NowFile} from "./NowFile";
import {forEach} from 'lodash';
import {Notify} from "./Notify";
import {Debug} from "./Debug";

/**
 * IAppWatcher
 *
 * *sync*     -- Sync type
 * *interval* -- Interval in ms to check the instance for changes
 * *pullOnly* -- If set, then only pull and sync changes with the Instance and don't watch for changes
 */
export interface IAppWatcher {
    sync?: Sync;
    interval?: number;
    pullOnly?: boolean;
}

export class AppWatcher {
    private debug = new Debug('AppWatcher');
    private interval: any;
    private options = new Options();
    private tables = this.options.get( 'tables', {} );
    private watcher: Watcher = null;
    private watch = false;
    private api = UXsyncNowREST.getUXsyncNowREST();
    private now: number;
    private pull: SyncMode;

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
    constructor(private app: string, private appName: string, options: IAppWatcher, whenDone?: any) {
        this.pull = SyncMode.getSyncMode();
        this.pull.init = true;
        if (typeof options.sync !== 'undefined') {
            this.pull.initMode = options.sync;
        } else {
            this.pull.initMode = Sync.SYNC;
        }

        this.debug.log(`App: ${app} name: ${appName} sync: ${this.pull.initMode}`);
        this.watch = options.pullOnly ? false : true;

        // If this is not a pull only run, then setup the interval pull from instance
        // and the file watcher
        if (this.watch) {
            this.debug.log('Setting up watch');
            const ms = options.interval ? options.interval : 30000;
            this.pull.whenDone = () => {
                this.debug.log('Got all the files');
                // When the initial pull is done, setup the timer to pull
                // from the instance
                Notify.showMessage = true;
                this.interval = setInterval(() => this.pullFromInstance(), ms);
                if (whenDone) {
                    this.debug.log("Calling WhenDone");
                    whenDone();
                }
            };
            this.watcher = Watcher.getWatcher();
            let files = new NowFiles();
            this.watcher.onChange = file => {
                let f = files.find(file);
                if (f) {
                    f.processLocalFile();
                    f.processInstance("local");
                }
            };
        } else {
            this.pull.whenDone = () => {
                this.debug.log("The initial pull is done");
                if (whenDone) {
                    this.debug.log("Calling WhenDone");
                    whenDone();
                }
            };
        }
        this.pullFromInstance();
    }

    close() {
        if (this.watch) {
            this.watcher.close();
        }
    }
    /**
     * Pull application files from the instance.
     */
    private pullFromInstance() {
        this.debug.log('Pull from instance',2);
        this.api.getApplicationFiles(this.tables, this.app, this.now)
            .then(result => {
                this.now = parseInt(result.now, 10);

                if (this.pull.init) {
                    this.pull.filesToGet  += result.files.length;
                }

                forEach(result.files, file => {
                    if (file.fields) {
                        let files = new NowFiles();

                        if (this.pull.init) {
                            this.pull.filesToGet  += file.fields.length - 1;  // Handle if there are more than 1 field in a record
                        }

                        for (let i = 0; i < file.fields.length; i++) {
                            let fld = file.fields[i];
                            let fldcrc = parseInt(file.crc[i], 10);
                            //                                new NowFile(appName, file.table, file.sys_id, file.name, fld, parseInt(fldcrc, 10),parseInt(result.now));
                            // console.log('Got file ' + fld)
                            let f = files.find({
                                recordID: file.sys_id,
                                tableName: file.table,
                                fieldName: fld
                            });
                            if (f) {
                                //console.log("Found one in cache");
                                f.processLocalFile();
                                f.crc = fldcrc;
                                f.processInstance("instance");
                            } else {
                                // New file on instance
                                let f = new NowFile(
                                    this.appName,
                                    file.table,
                                    file.sys_id,
                                    file.name,
                                    fld,
                                    fldcrc,
                                    this.now
                                );
                                if (this.watch) {
                                    f.watch();
                                }

                            }
                        }
                    }
                });
            });
    }

    destroy() {
        if (this.watcher) {
            this.watcher.close();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}