import {Debug} from "./Debug";

export enum Sync {
    "PULL",
    "PUSH",
    "LOCAL",
    "INSTANCE",
    "SYNC"
}

/**
 * Type of Sync
 */
export class SyncMode {
    private debug = new Debug('SyncMode');
    private static _singleton: SyncMode = null;

    static get singleton(): SyncMode {
        return this._singleton;
    }

    static set singleton(value: SyncMode) {
        this._singleton = value;
    }

    private _mode: Sync = Sync.SYNC;

    get mode(): Sync {
        return this._mode;
    }

    set mode(value: Sync) {
        this._mode = value;
    }

    private _init: boolean = false;

    get init(): boolean {
        return this._init;
    }

    set init(value: boolean) {
        this._init = value;
    }

    private _initMode: Sync = Sync.PULL;

    get initMode(): Sync {
        return this._initMode;
    }

    set initMode(value: Sync) {
        this._initMode = value;
    }

    private _filesToGet: number = 0;

    get filesToGet(): number {
        return this._filesToGet;
    }

    set filesToGet(value: number) {
        this._filesToGet = value;
    }

    private _filesReceived: number = 0;

    get filesReceived(): number {
        return this._filesReceived;
    }

    set filesReceived(value: number) {
        this._filesReceived = value;
        this.debug.log(`FilesReceived: ${this._filesReceived} out of ${this._filesToGet} init: ${this.init}`);

        if (this.init && this._filesReceived >= this._filesToGet) {
            this.debug.log(
                `Received last file ${value} looking for ${this._filesToGet}`
            );
            if (this.whenDone) {
                this.debug.log("Calling WhenDone");
                this.whenDone();
            }
            this.init = false;
        }
    }

    private _whenDone: any = null;

    get whenDone(): any {
        return this._whenDone;
    }

    set whenDone(value: any) {
        this._whenDone = value;
    }

    static getSyncMode(): SyncMode {
        if (SyncMode._singleton === null) {
            SyncMode._singleton = new SyncMode();
        }
        return SyncMode._singleton;
    }

    /**
     *
     * @param {number} filesToGet
     * @param whenDone
     */
    setupPull(filesToGet: number, whenDone: any) {
        this.filesToGet = filesToGet;
        this._whenDone = whenDone;
        this.mode = Sync.PULL;
    }

    /**
     * Singleton constructor.
     *
     * @returns {SyncMode}
     */
    constructor() {
        if (SyncMode._singleton !== null) {
            return SyncMode._singleton;
        }
        SyncMode._singleton = this;
    }
}
