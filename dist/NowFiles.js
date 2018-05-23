"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var Debug_1 = require("./Debug");
var NowFiles = /** @class */ (function () {
    function NowFiles() {
        this.debug = new Debug_1.Debug('NowFiles');
        this.files = [];
        if (!NowFiles.filesSingleton) {
            NowFiles.filesSingleton = this;
        }
        return NowFiles.filesSingleton;
    }
    NowFiles.prototype.add = function (file) {
        this.debug.log("Add " + file.fileName);
        this.files.push(file);
    };
    NowFiles.prototype.remove = function (file) {
        var index = lodash_1.findIndex(this.files, file);
        if (index >= 0) {
            this.debug.log("Removing " + file);
            this.files.splice(index, 1);
        }
    };
    NowFiles.prototype.clear = function () {
        this.files = [];
    };
    NowFiles.prototype.paths = function () {
        var names = [];
        lodash_1.forEach(this.files, function (file) { return names.push(file.fileName); });
        names.sort();
        return names;
    };
    NowFiles.prototype.find = function (value, key) {
        if (key === void 0) { key = "fileName"; }
        for (var i = 0; i < this.files.length; i++) {
            var file = this.files[i];
            if (typeof value === "string") {
                if (typeof file[key] !== "undefined") {
                    if (file[key] === value)
                        return file;
                }
            }
            else if (typeof value === "object") {
                var res = null;
                for (var k in value) {
                    // console.log("type " + file[k] + " is " + typeof file[k]);
                    if (typeof file[k] !== "undefined") {
                        if (file[k] === value[k]) {
                            res = file;
                        }
                        else {
                            res = null;
                            break; // Don't go anymore
                        }
                    }
                }
                if (res)
                    return res;
            }
        }
        return null;
    };
    return NowFiles;
}());
exports.NowFiles = NowFiles;
//# sourceMappingURL=NowFiles.js.map