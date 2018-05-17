"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var Options_1 = require("./Options");
var UXsyncNowREST_1 = require("./UXsyncNowREST");
var NowTables = /** @class */ (function () {
    function NowTables() {
        this._tables = {};
        this._tablesUnmapped = {};
        this._tablesNonApplication = {};
        var options = Options_1.Options.getOptions();
        this._tables = options.get('tables', {});
        this._tablesUnmapped = options.get('tables_unmapped', {});
        this._tablesNonApplication = options.get('tables_non_application', {});
        NowTables._singleton = this;
    }
    Object.defineProperty(NowTables.prototype, "tablesUnmapped", {
        get: function () {
            return this._tablesUnmapped;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowTables.prototype, "tablesNonApplication", {
        get: function () {
            return this._tablesNonApplication;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NowTables.prototype, "tables", {
        get: function () {
            return this._tables;
        },
        enumerable: true,
        configurable: true
    });
    NowTables.getNowTables = function () {
        if (NowTables._singleton === null)
            new NowTables();
        return NowTables._singleton;
    };
    NowTables.prototype.refresh = function () {
        var self = this;
        var table_errors = [];
        var table_display = {};
        var options = Options_1.Options.getOptions();
        var table_ignore = options.get('table_ignore', []);
        return new Promise(function (resolve, reject) {
            var api = UXsyncNowREST_1.UXsyncNowREST.getUXsyncNowREST();
            api.getTables().then(function (result) {
                self._tables = result.tables;
                self._tablesUnmapped = result.tables_unmapped;
                self._tablesNonApplication = result.tables_non_application;
                var options = Options_1.Options.getOptions();
                options.set('tables', self._tables);
                options.set('tables_unmapped', self._tablesUnmapped);
                options.set('tables_non_application', self._tablesNonApplication);
                options.save();
                resolve();
            }, function (err) {
                console.log("Got error", err);
                reject();
            });
        });
    };
    NowTables._singleton = null;
    return NowTables;
}());
exports.NowTables = NowTables;
//# sourceMappingURL=NowTables.js.map