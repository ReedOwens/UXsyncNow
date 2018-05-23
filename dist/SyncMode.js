"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debug_1 = require("./Debug");
var Sync;
(function (Sync) {
    Sync[Sync["PULL"] = 0] = "PULL";
    Sync[Sync["PUSH"] = 1] = "PUSH";
    Sync[Sync["LOCAL"] = 2] = "LOCAL";
    Sync[Sync["INSTANCE"] = 3] = "INSTANCE";
    Sync[Sync["SYNC"] = 4] = "SYNC";
})(Sync = exports.Sync || (exports.Sync = {}));
/**
 * Type of Sync
 */
var SyncMode = /** @class */ (function () {
    /**
     * Singleton constructor.
     *
     * @returns {SyncMode}
     */
    function SyncMode() {
        this._mode = Sync.SYNC;
        this._init = false;
        this._initMode = Sync.PULL;
        this._filesToGet = 0;
        this._filesReceived = 0;
        this._whenDone = null;
        if (SyncMode._singleton !== null) {
            return SyncMode._singleton;
        }
        SyncMode._singleton = this;
    }
    Object.defineProperty(SyncMode, "singleton", {
        get: function () {
            return this._singleton;
        },
        set: function (value) {
            this._singleton = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "mode", {
        get: function () {
            return this._mode;
        },
        set: function (value) {
            this._mode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "init", {
        get: function () {
            return this._init;
        },
        set: function (value) {
            this._init = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "initMode", {
        get: function () {
            return this._initMode;
        },
        set: function (value) {
            this._initMode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "filesToGet", {
        get: function () {
            return this._filesToGet;
        },
        set: function (value) {
            this._filesToGet = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "filesReceived", {
        get: function () {
            return this._filesReceived;
        },
        set: function (value) {
            this._filesReceived = value;
            if (!this.init) {
                return;
            }
            SyncMode.debug.log("FilesReceived: " + this._filesReceived + " out of " + this._filesToGet + " init: " + this.init);
            if (this._filesReceived >= this._filesToGet) {
                SyncMode.debug.log("Received last file " + value + " looking for " + this._filesToGet);
                if (this.whenDone) {
                    SyncMode.debug.log("Calling WhenDone");
                    this.whenDone();
                }
                this.init = false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyncMode.prototype, "whenDone", {
        get: function () {
            return this._whenDone;
        },
        set: function (value) {
            this._whenDone = value;
        },
        enumerable: true,
        configurable: true
    });
    SyncMode.getSyncMode = function () {
        if (SyncMode._singleton === null) {
            SyncMode._singleton = new SyncMode();
        }
        return SyncMode._singleton;
    };
    /**
     *
     * @param {number} filesToGet
     * @param whenDone
     */
    SyncMode.prototype.setupPull = function (filesToGet, whenDone) {
        this.filesToGet = filesToGet;
        this._whenDone = whenDone;
        this.mode = Sync.PULL;
    };
    SyncMode.debug = new Debug_1.Debug('SyncMode');
    SyncMode._singleton = null;
    return SyncMode;
}());
exports.SyncMode = SyncMode;
//# sourceMappingURL=SyncMode.js.map