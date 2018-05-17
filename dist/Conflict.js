"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var IResolveMode;
(function (IResolveMode) {
    IResolveMode[IResolveMode["PULL"] = 0] = "PULL";
    IResolveMode[IResolveMode["PUSH"] = 1] = "PUSH";
    IResolveMode[IResolveMode["MERGE"] = 2] = "MERGE";
})(IResolveMode = exports.IResolveMode || (exports.IResolveMode = {}));
var Conflicts = /** @class */ (function () {
    function Conflicts() {
        this._list = [];
        if (Conflicts._singleTon)
            return Conflicts._singleTon;
        Conflicts._singleTon = this;
    }
    Object.defineProperty(Conflicts.prototype, "length", {
        get: function () {
            return this._list.length;
        },
        enumerable: true,
        configurable: true
    });
    Conflicts.prototype.add = function (file) {
        this._list.push(file);
    };
    Conflicts.prototype.remove = function (file) {
        var i = lodash_1.findIndex(this._list, file);
        if (i >= 0) {
            this._list.splice(i, 1);
        }
    };
    Conflicts.prototype.asArray = function (key) {
        if (key === void 0) { key = 'fileName'; }
        return lodash_1.map(this._list, key);
    };
    Object.defineProperty(Conflicts.prototype, "list", {
        get: function () {
            return this._list;
        },
        enumerable: true,
        configurable: true
    });
    Conflicts.prototype.resolve = function (file, mode) {
        var i = lodash_1.findIndex(this._list, file);
        if (i >= 0) {
            switch (mode) {
                case IResolveMode.PULL:
                    this._list[i].pullFile();
                    break;
                case IResolveMode.PUSH:
                    this._list[i].pushFile();
                    break;
                case IResolveMode.MERGE:
                    this._list[i].mergeFile();
            }
            this._list.splice(i, 1);
        }
    };
    // private debug = new Debug("Conflict");
    Conflicts._singleTon = null;
    return Conflicts;
}());
exports.Conflicts = Conflicts;
//# sourceMappingURL=Conflict.js.map