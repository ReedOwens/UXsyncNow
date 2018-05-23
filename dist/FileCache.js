"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var jsonfile = require("jsonfile");
var Options_1 = require("./Options");
exports.IGNORE = -1;
var FileCache = /** @class */ (function () {
    function FileCache() {
        this.configFile = '';
        this.files = {};
        if (FileCache.singleton !== null) {
            return FileCache.singleton;
        }
        var options = new Options_1.Options();
        var configDir = options.configDir;
        var configFile = "file_cache.json";
        this.configFile = configDir + '/' + configFile;
        if (fs.existsSync(configDir)) {
            var stat = fs.statSync(configDir);
            if (stat.isDirectory()) {
                // Directory exists.  Check for exiting configuration
                if (fs.existsSync(this.configFile)) {
                    this.read();
                }
                else {
                    this.save();
                }
            }
            else {
                console.log(configDir + " is not a directory.  Please correct and run again");
                process.exit(-1);
            }
        }
        else {
            fs.mkdirSync(configDir);
            this.save();
        }
        FileCache.singleton = this;
    }
    /**
     * Returns the singleton object of the Options class.
     *
     * @param {string} baseDir
     * @returns {Options}
     */
    FileCache.getFileCache = function () {
        if (FileCache.singleton == null)
            FileCache.singleton = new FileCache();
        return (FileCache.singleton);
    };
    /**
     * Sets an option value
     *
     * @param {string} name
     * @param value
     */
    FileCache.prototype.set = function (name, value) {
        this.files[name] = value;
        this.save();
    };
    /**
     * Gets the value of an option.  If **defaultValue** is provided and the option doesn't
     * exist, then defaultValue is return.  If the option doesn't exist and no defaultValue
     * is provided then null is returned.
     *
     * @param {string} name
     * @param defaultValue
     * @returns {any}
     */
    FileCache.prototype.get = function (name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = true; }
        if (typeof this.files[name] !== 'undefined')
            return this.files[name];
        if (defaultValue) {
            return { serverCRC: exports.IGNORE, clientCRC: exports.IGNORE, serverSync: exports.IGNORE, clientSync: exports.IGNORE };
        }
        return null;
    };
    FileCache.prototype.exists = function (name) {
        return (typeof this.files[name] !== 'undefined');
    };
    FileCache.prototype.save = function () {
        try {
            jsonfile.writeFileSync(this.configFile, this.files, { spaces: 2, EOL: '\r\n' });
        }
        catch (err) {
            console.log("Could not write FileCache file: " + this.configFile);
            console.log('' + err);
            process.exit(-1);
        }
    };
    FileCache.prototype.read = function () {
        try {
            this.files = jsonfile.readFileSync(this.configFile);
        }
        catch (err) {
            console.log("Could not read FileCache file: " + this.configFile);
            console.log('' + err);
            process.exit(-1);
        }
    };
    FileCache.singleton = null;
    return FileCache;
}());
exports.FileCache = FileCache;
//# sourceMappingURL=FileCache.js.map