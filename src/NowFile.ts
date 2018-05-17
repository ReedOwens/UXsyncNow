import {FileCache, IGNORE} from "./FileCache";
import {Watcher} from "./Watcher";
import {Options} from "./Options";
import {Sync, SyncMode} from "./SyncMode";
import * as fs from "fs";
import {Notify} from "./Notify";
import {UXsyncNowREST} from "./UXsyncNowREST";
import * as path from "path";
import {ITableDef} from "./NowTables";
import {NowFiles} from "./NowFiles";
import {find} from 'lodash'
import * as mkdirp from "mkdirp";
import {Debug} from "./Debug";
import {Conflicts} from "./Conflict";

const EXTENSIONS = {
    html_script: "html",
    script: "js",
    script_plain: "js",
    html: "html",
    html_template: "html",
    xml: "xml"
};

export class NowFile {
    private static debug = new Debug('NowFile');
    private localCRC = 0;
    // Name of the file in the filesystem
    private _fileName = "";
    private initialized = false;
    private initProcessed = 0;
    private api = UXsyncNowREST.getUXsyncNowREST();
    private syncLocal: number = 0;
    private syncServer: number = 0;

    constructor(
        private _applicationName: string,
        private _tableName: string,
        private _recordID: string,
        private _recordName: string,
        private _fieldName: string,
        instanceCRC?: number,
        now?: number
    ) {
        // Determine path
        // If file exists, read it in then check if content from the instance was provided
        //   if provided, then update the file with the content and instanceLastUpdated time.
        //       NOTE: If the content is the same then the file will not be updated

        NowFile.debug.log("Creating new File");
        let mode = new SyncMode();

        if (typeof now !== "undefined") {
            this.syncServer = now;
        }
        this._crc = instanceCRC ? instanceCRC : 0;
        let options = Options.getOptions();
        let topDir = options.get("top_dir", "instance");
        let basedir = options.get("base_dir", "./");
        let fileOverride = options.get( "file_override", []);

        // Get the cached info on the local/instance crc and sync times


        // Todo: add top_dir override
        // Todo: add base_dir override
        // Todo: add application dir override
        // Todo: add table dir override
        // Todo: add File location override

        let tables: ITableDef[] = options.get("tables", {});
        let table: ITableDef = find(tables, { name: _tableName });
        if (!table) {
            // todo: Handle error
            console.log(
                `ERROR: ${_tableName} was not found in the tables for the application`
            );
            mode.filesReceived++;
        } else {
            let field = find(table.fields, { name: this._fieldName });
            if (!field) {
                console.log(`ERROR: ${_fieldName} was not found in ${_tableName}`);
                mode.filesReceived++;
                // todo: handle error
            } else {
                let extension = EXTENSIONS[field.type];
                let base = path.normalize(basedir);
                this._fileName = path.normalize(
                    base +
                    path.sep +
                    topDir +
                    path.sep +
                    _applicationName +
                    path.sep +
                    _tableName +
                    path.sep +
                    _recordName +
                    "_" +
                    _fieldName +
                    "." +
                    extension
                );

                let relSource = path.relative(base,this._fileName);

                NowFile.debug.log('Relative path is ' + relSource);
                // Check and see if there is an override for this file
                let over = find(fileOverride, { source: relSource});
                if (over) {
                    let dest = over['dest'];
                    NowFile.debug.log('Found override ' + dest );
                    if (dest) {
                        if (!path.isAbsolute(dest)) {
                            dest = path.normalize(base + path.sep + dest );
                        }
                    }
                    console.log('Map to ' + dest);
                    this._fileName = dest;
                }
                this.processLocalFile();
                if (this._crc !== this.localCRC) {
                   NowFile.debug.log(
                        `Need to process the Instance  ${this._tableName}, ${
                            this._recordName
                            } ${this._fieldName} -> ${this._crc}  ${this.localCRC}`
                    );
                   // OK the Server CRC is different than the Local CRC  Check and see if we are initing
                    // todo: do sync for init
                    this.processInstance();
                } else {
                    let stats = fs.statSync(this._fileName);
                    FileCache.getFileCache().set(this._fileName, {
                        serverCRC: instanceCRC,
                        clientCRC: this.crc,
                        serverSync: now ? now : -1,
                        clientSync: new Date(stats.mtime + '').getTime()
                    });

                    mode.filesReceived++;
                }
                new NowFiles().add(this);
            }
        }
    }

    private _crc = 0;

    get applicationName(): string {
        return this._applicationName;
    }

    get tableName(): string {
        return this._tableName;
    }

    get recordID(): string {
        return this._recordID;
    }

    get recordName(): string {
        return this._recordName;
    }

    get fieldName(): string {
        return this._fieldName;
    }

    get fileName(): string {
        return this._fileName;
    }

    get crc(): number {
        return this._crc;
    }

    set crc(value: number) {
        this._crc = value;
    }

    watch() {
        NowFile.debug.log("Add Watcher " + this._fileName, 2);
        Watcher.getWatcher().add(this._fileName);
    }

    unWatch() {
        NowFile.debug.log("Remove Watcher " + this._fileName, 2);
        Watcher.getWatcher().remove(this._fileName);
    }

    public processLocalFile() {
        try {
            let contents = fs.readFileSync(this._fileName);
            this.localCRC = this.calcCRC(contents.toString());
        } catch (e) {
            //console.log(`File: '${this._fileName}' doesn't exist`);
        }
        this.initUpdate(1);
    }

    public processInstance(change = "none") {
        let fileCache = FileCache.getFileCache();

        // Lets figure out the mode
        let sync = SyncMode.getSyncMode();
        let mode = sync.mode;
        if (sync.init) {
            // override if ininiting
            mode = sync.initMode;
            //todo: This is init and there is a difference.  Check and see if local file changed since last write

            // This is an init.  Lets check to see if the there is a change on the server

            let cache = fileCache.get(this._fileName);

            let server = false;
            let client = false;
            // Ok we've syned at least once
            if (cache.serverCRC !== IGNORE && cache.serverCRC !== this.crc) {
                // There was a server changed.
                server = true;
            }

/*            if (cache.serverSync !== IGNORE && cache.serverSync !== this.syncServer) {
                // There was a server changed.
                server = true;
            }
*/
            if (cache.clientCRC !== IGNORE && cache.clientCRC !== this.localCRC) {
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
                if (mode == Sync.SYNC) {
                    // Check and see if the local file doesn't exist anymore
                    if (fs.existsSync(this.fileName)) {
                        // OK file exists and is different on the client too.
                        mode = -1;  // Ignore the pull/push for now and post sync error
                        NowFile.debug.log(`SYNC ERROR for : ${this.fileName}`);
                        new Conflicts().add(this);  // must be done before filesReceived for callback purposes.
                        sync.filesReceived++;  // Mark it as complete as we can't pull/push
                    } else {
                        // File is not local, so lets pull from server
                        mode = Sync.PULL;
                    }
                }
                // IF it's not SYNC, then the methodology is PUSH or PULL and doesn't need to be changed.
            } else {
                if (client) {
                    mode = Sync.PUSH; // Push the change
                } else {
                    mode = Sync.PULL; // Pull the change
                }
            }
        }
        if (this.localCRC === this.crc) {
            sync.filesReceived++;
            return;
        }

        if (mode == Sync.SYNC) {
            // Check for conflicts and change mode appropriately && direction
            if (change == "local") {
                mode = Sync.PUSH;
            } else if (change == "instance") {
                mode = Sync.PULL;
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
            case Sync.PUSH:
            case Sync.LOCAL:
                // todo: push change
                NowFile.debug.log(
                    `Save to instance ${this._tableName}, ${this._fieldName}, ${
                        this._recordID
                        }`
                );
                NowFile.debug.log(`  ${this._fileName}`);
                this.pushFile();
                break;
            case Sync.PULL:
            case Sync.INSTANCE:
                // Get the file from the server and over write the current file on the filesystem
                this.pullFile();
                break;
        }
    }

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
    private hashFnv32a(str: string): number {
        /*jshint bitwise:false */
        var i,
            l,
            hval = 0x811c9dc5;

        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval +=
                (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    }

    private calcCRC(str: string): number {
        return this.hashFnv32a(str);
    }

    /**
     * Update the cache with the current information
     */

    private updateCache() {
        //        getCache().update(this.filename, this.localCRC, this.crc, this.syncLocal, this.syncServer);
    }

    private initUpdate(val: number) {
        this.initProcessed |= val;
        if (this.initProcessed & 3) {
            this.initialized = true;
        }
    }

    pushFile() {
        let fileCache = FileCache.getFileCache();
        let sync = SyncMode.getSyncMode();

        // Push file contents to the Instance
        NowFile.debug.log('Pushing from instance');

        let localContents = fs.readFileSync(this._fileName);
        if (localContents) {
            this.api
                .saveFile(
                    this._tableName,
                    this._recordID,
                    this._fieldName,
                    localContents.toString()
                )
                .then(
                    result => {
                        NowFile.debug.log("Got save response");
                        sync.filesReceived++;
                        this._crc = result.result;
                        this.localCRC = this._crc;
                        let stats = fs.statSync(this._fileName);
                        fileCache.set(this._fileName, {
                            serverCRC: this.crc,
                            clientCRC: this.crc,
                            serverSync: parseInt(result.now, 10),
                            clientSync: new Date(stats.mtime + '').getTime()
                        });
                        Notify.message(
                            `${path.basename(this._fileName)}`,
                            "Sent to Instance"
                        );
                    },
                    err => {
                        sync.filesReceived++;
                        console.log("Got error on getfile " + err);
                    }
                );
        } else {
            NowFile.debug.log('No content from : ' + this._fieldName);
        }
    }

    pullFile() {
        let fileCache = FileCache.getFileCache();
        let sync = SyncMode.getSyncMode();

        // PUll file contents from the Instance
        NowFile.debug.log('Pulling from instance');

        this.api.getFile(this._tableName, this._recordID, this._fieldName).then(
            (results: any) => {
                let files = results.files;
                let content = files[this._fieldName];
                let CRC = this.calcCRC(content);

                NowFile.debug.log(
                    `writing from server${this._fileName} -> ${
                        this._fieldName
                        } crc ${CRC} instance ${this._crc}`
                );
                this._crc = CRC;
                this.localCRC = CRC;
                let dirName = path.dirname(this._fileName);
                mkdirp.sync(dirName);
                fs.writeFileSync(this._fileName, content);
                this.initUpdate(2); // Done a write
                let stats = fs.statSync(this._fileName);

                fileCache.set(this._fileName, {
                    serverCRC: this.crc,
                    clientCRC: this.crc,
                    serverSync: parseInt(results.now, 10),
                    clientSync: new Date(stats.mtime + '').getTime()
                });
                Notify.message(
                    `${path.basename(this._fileName)}`,
                    "Received from Instance",
                    "cloud-download.png"
                );

                sync.filesReceived++;
            },
            err => {
                sync.filesReceived++;
                console.log("Got error on getfile " + err);
            }
        );
    }

    mergeFile() {
        // Handle MERGE by getting the file contents from the Instance and store in a file with .merge extension
        NowFile.debug.log('Merging from instance');

        this.api.getFile(this._tableName, this._recordID, this._fieldName).then(
            (results: any) => {
                let files = results.files;
                let content = files[this._fieldName];

                NowFile.debug.log( `writing from server merge file ${this._fileName}.merge` );
                let dirName = path.dirname(this._fileName);
                mkdirp.sync(dirName);
                fs.writeFileSync(this._fileName + ".merge", content);
                Notify.message(
                    `${path.basename(this._fileName)}`,
                    "Received from Instance",
                    "cloud-download.png"
                );

            },
            err => {
                console.log("Got error on getfile " + err);
            }
        );
    }
}
