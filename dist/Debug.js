"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var Debug = /** @class */ (function () {
    function Debug(area) {
        if (area === void 0) { area = 'gen'; }
        this.area = area;
        if (Debug._areas.indexOf(area) === -1) {
            Debug._areas.push(area);
        }
    }
    Object.defineProperty(Debug, "vorpal", {
        get: function () {
            return this._vorpal;
        },
        set: function (value) {
            this._vorpal = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Debug, "level", {
        get: function () {
            return this._level;
        },
        set: function (value) {
            this._level = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Debug, "areas", {
        get: function () {
            var areas = lodash_1.clone(Debug._areas);
            return areas;
        },
        enumerable: true,
        configurable: true
    });
    Debug.resetFilter = function () {
        Debug._filter = [];
    };
    Debug.filter = function (area) {
        Debug._filter.push(area);
    };
    Debug.prototype.log = function (msg, level) {
        if (level === void 0) { level = 1; }
        if (level <= Debug.level) {
            if (Debug._filter.length > 0 && Debug._filter.indexOf(this.area) === -1)
                return;
            if (Debug.vorpal)
                Debug.vorpal.log(lodash_1.padEnd(this.area, 15) + ": " + msg);
            else
                console.log(lodash_1.padEnd(this.area, 15) + ": " + msg);
        }
    };
    Debug._level = 0;
    Debug._vorpal = null;
    Debug._filter = [];
    Debug._areas = [];
    return Debug;
}());
exports.Debug = Debug;
//# sourceMappingURL=Debug.js.map