"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var Options_1 = require("./Options");
var _ = require("lodash");
var UXsyncNowREST_1 = require("./UXsyncNowREST");
var Debug_1 = require("./Debug");
var NowApplications = /** @class */ (function () {
    function NowApplications() {
        this.debug = new Debug_1.Debug("NowApplications");
        this._applications = {};
        var options = Options_1.Options.getOptions();
        this._applications = options.get('applications', {});
        NowApplications._singleton = this;
    }
    Object.defineProperty(NowApplications.prototype, "applications", {
        get: function () {
            return this._applications;
        },
        enumerable: true,
        configurable: true
    });
    NowApplications.prototype.find = function (name) {
        return _.find(this._applications, ['name', name]);
    };
    NowApplications.prototype.findBy = function (pred, value) {
        //prioritize exact matches
        var key = _.find(this._applications, function (app) {
            return app[pred].toString().toLowerCase() === value.toString().toLowerCase();
        });
        if (!key) {
            key = _.find(this._applications, function (app) {
                return app[pred].toString().toLowerCase().indexOf(value.toString().toLowerCase()) > -1;
            });
        }
        return key;
    };
    NowApplications.getNowApplications = function () {
        if (NowApplications._singleton === null)
            new NowApplications();
        return NowApplications._singleton;
    };
    NowApplications.prototype.refresh = function () {
        var debug = this.debug;
        var self = this;
        return new Promise(function (resolve, reject) {
            UXsyncNowREST_1.UXsyncNowREST.getUXsyncNowREST().getApplications()
                .then(function (apps) {
                debug.log("Got Refresh response");
                self._applications = _.clone(apps);
                var options = Options_1.Options.getOptions();
                options.set("applications", _.clone(apps));
                options.save();
                resolve();
            })
                .error(function (err) { return reject(err); });
        });
    };
    /*
    refresh(): Promise<void> {
        let self = this;
        return new Promise(function (resolve, reject) {

            function handleGetApps(data: any) {

                let apps = {};

                if (data.error) {
                    console.log("GOT ERROR in retrieving applications");
                    if (data.error) console.log("Error: " + data.error);
                }
                let num = 1;
                if (data.body && data.body.result) {
                    var items = data.body.result;
                    for (let i in items) {
                        let item = items[i];
                        let sys_id = item['sys_id'] || '';
                        let name = item['name'];
                        let short_description = item['short_description'];
                        let version = item['version'];
                        let scope = item['scope'];
                        console.log("Found scope of " + scope);
                        apps[name] = {
                            id: num++,
                            sys_id: sys_id,
                            version: version,
                            short_description: short_description,
                            scope: scope,
                            name: name
                        };
                    }
                    self._applications = apps;
                    let options = Options.getOptions();
                    options.set("applications", apps);
                    options.save();
                } else {
                    console.log("Error");
                    if (data.error) console.log("Error Message : ");
                    reject();
                }
                resolve();
            }

            let connection = NowConnection.getConnection();
            connection.queryWithCallback('/api/now/table/sys_app', '', handleGetApps);
        });
    }
    */
    NowApplications.prototype.asArray = function (prop) {
        var apps = [];
        for (var a in this._applications) {
            if (prop)
                apps.push(this._applications[a][prop]);
            else
                apps.push(a);
        }
        return apps;
    };
    NowApplications._singleton = null;
    return NowApplications;
}());
exports.NowApplications = NowApplications;
//# sourceMappingURL=NowApplications.js.map