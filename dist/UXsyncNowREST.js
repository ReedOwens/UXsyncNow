"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Connection_1 = require("./Connection");
var Options_1 = require("./Options");
var _ = require("lodash");
var Promise = require("bluebird");
var Debug_1 = require("./Debug");
var ENDPOINT = "/api/global/uxsyncnow";
var UXsyncNowREST = /** @class */ (function () {
    function UXsyncNowREST() {
        this._connection = null;
        this._options = null;
        this._connected = false;
        this._errorMessage = "";
        this.debug = new Debug_1.Debug("UXsyncNowREST");
        this._options = Options_1.Options.getOptions();
        this._connection = Connection_1.NowConnection.getConnection();
        UXsyncNowREST._singleton = this;
    }
    Object.defineProperty(UXsyncNowREST.prototype, "connected", {
        get: function () {
            return this._connected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UXsyncNowREST.prototype, "errorMessage", {
        get: function () {
            return this._errorMessage;
        },
        enumerable: true,
        configurable: true
    });
    UXsyncNowREST.getUXsyncNowREST = function () {
        if (UXsyncNowREST._singleton === null)
            new UXsyncNowREST();
        return UXsyncNowREST._singleton;
    };
    UXsyncNowREST.prototype.init = function () {
        var _this = this;
        var debug = this.debug;
        return (new Promise(function (resolve) {
            var valid = true;
            var message = [];
            var self = _this;
            _.each(['host', 'protocol', 'user', 'password'], function (name) {
                if (_this._options.get(name, '') === '') {
                    valid = false;
                    message.push(name + " is not defined");
                }
            });
            if (valid) {
                // Ok have enough for the valid connection
                _this._connection = new Connection_1.NowConnection(ENDPOINT);
                // Now check the API.
                _this._connection.queryp(ENDPOINT + "/checkUser", "")
                    .then(function (data) {
                    var body = (data.body);
                    if (body) {
                        if (typeof body["error"] !== 'undefined') {
                            // Got an error object
                            _this._errorMessage = body.error.message;
                            _this._connected = false;
                            if (_this._errorMessage.indexOf("User Not Authenticated") >= 0) {
                                _this._errorMessage = 'Either the username or password is incorrect';
                            }
                            if (_this._errorMessage.indexOf("Requested URI does not represent any resource:") >= 0) {
                                _this._errorMessage = "Instance does not contain UXsyncNow REST services.  Is the UXsyncNow Application installed on the instance?\nYou can download the UpdateSet from https://share.servicenow.com/app.do#/detailV2/c0076b7fdb4157401afe13141b9619f0/overview";
                            }
                            // todo: Check for other errors
                            resolve();
                            return;
                        }
                        if (body.result) {
                            var ret = body.result;
                            if (ret.result === 'ERROR') {
                                _this._connected = false;
                                _this._errorMessage = ret.message;
                            }
                            else {
                                _this._connected = (ret.result === "SUCCESS");
                                _this._errorMessage = ret.errorMessage;
                            }
                        }
                        else {
                            _this._connected = false;
                            _this._errorMessage = "Instance returned no result information";
                        }
                    }
                    else {
                        _this._connected = false;
                        _this._errorMessage = "Instance returned no information";
                    }
                    resolve();
                    return;
                })
                    .error(function (reason) {
                    //                        console.log("Error received " + reason);
                    //                        console.log(reason);
                    _this._connected = false;
                    _this._errorMessage = reason;
                    resolve();
                    return;
                });
            }
            else {
                _this._connected = false;
                _this._errorMessage = message.join('\n');
                resolve();
            }
        }));
    };
    UXsyncNowREST.prototype.getApplications = function () {
        var _this = this;
        var debug = this.debug;
        return new Promise(function (resolve, reject) {
            debug.log("Getting Applications");
            if (!_this._connected) {
                debug.log("Not connected");
                reject();
            }
            var connection = Connection_1.NowConnection.getConnection();
            connection.queryp(ENDPOINT + "/getApplications", '')
                .then(function (data) {
                var apps = {};
                debug.log("Got applications response");
                if (data.error) {
                    console.log("GOT ERROR in retrieving applications");
                    if (data.error)
                        console.log("Error: " + data.error);
                    reject();
                    return;
                }
                var num = 1;
                if (data.body && data.body.result) {
                    var items = data.body.result;
                    for (var i in items) {
                        var item = items[i];
                        var sys_id = item['sys_id'] || '';
                        var name_1 = item['name'];
                        var short_description = item['short_description'];
                        var version = item['version'];
                        var scope = item['scope'];
                        apps[name_1] = {
                            id: num++,
                            sys_id: sys_id,
                            version: version,
                            short_description: short_description,
                            scope: scope,
                            name: name_1
                        };
                    }
                    debug.log("Got " + num + " applications");
                }
                resolve(apps);
            });
        });
    };
    UXsyncNowREST.prototype.saveFile = function (table, sys_id, field, content) {
        var _this = this;
        var debug = this.debug;
        return new Promise(function (resolve, reject) {
            if (!_this._connected) {
                debug.log("Not connected");
                reject();
            }
            var body = {
                table: table,
                sys_id: sys_id,
                field: field,
                content: content
            };
            var connection = Connection_1.NowConnection.getConnection();
            debug.log("Calling Save File " + table + " , " + sys_id + " + " + field);
            connection.putp(ENDPOINT + "/saveFile", body)
                .then(function (data) {
                if (data.error) {
                    console.log("GOT ERROR in retrieving applications");
                    if (data.error)
                        console.log("Error: " + data.error);
                    reject();
                    return;
                }
                if (data.body && data.body.result) {
                    resolve(_.clone(data.body.result));
                }
                else
                    reject();
            });
        });
    };
    UXsyncNowREST.prototype.getTables = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._connected)
                reject();
            var connection = Connection_1.NowConnection.getConnection();
            connection.queryp(ENDPOINT + "/getTables", '')
                .then(function (data) {
                var tables = {};
                if (data.error) {
                    console.log("GOT ERROR in retrieving tables");
                    if (data.error)
                        console.log("Error: " + data.error);
                    reject();
                }
                if (data.body && data.body.result) {
                    resolve(_.cloneDeep(data.body.result));
                    return;
                }
                console.log("Error no body returned");
                reject();
            });
        });
    };
    UXsyncNowREST.prototype.getApplicationFiles = function (tables, app, since) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._connected)
                reject();
            var body = {
                tables: tables,
                application: app,
                since: ''
            };
            if (since)
                body.since = since + '';
            var connection = Connection_1.NowConnection.getConnection();
            connection.putp(ENDPOINT + "/getApplicationFiles", body)
                .then(function (data) {
                if (data.error) {
                    console.log("GOT ERROR in retrieving changed files");
                    if (data.error)
                        console.log("Error: " + data.error);
                    reject();
                }
                if (data.body && data.body.result) {
                    var ret = {
                        now: '',
                        files: []
                    };
                    var files = [];
                    var results = data.body.result;
                    var cfiles = results.files;
                    if (typeof results.now !== 'undefined')
                        ret.now = results.now;
                    for (var i = 0; i < cfiles.length; i++) {
                        var f = cfiles[i];
                        files.push({
                            table: f[0],
                            sys_id: f[1],
                            name: f[2],
                            lastChanged: f[3],
                            owner: f[4],
                            fields: _.clone(f[5]),
                            crc: _.clone(f[6])
                        });
                    }
                    ret.files = files;
                    resolve(ret);
                    return;
                }
                console.log("Error no body returned");
                reject();
            });
        });
    };
    UXsyncNowREST.prototype.getFile = function (table, sys_id, fields) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._connected)
                reject(' not connected ');
            var flds = typeof fields === 'string' ? [fields] : fields;
            var body = {
                table: table,
                sys_id: sys_id,
                fields: flds
            };
            _this.debug.log('GET FILE ' + table + +' ' + fields);
            var connection = Connection_1.NowConnection.getConnection();
            connection.putp(ENDPOINT + "/getFile", body)
                .then(function (data) {
                if (data.error) {
                    console.log("GOT ERROR in retrieving file");
                    if (data.error)
                        console.log("Error: " + data.error);
                    reject();
                    return;
                }
                if (data.body && data.body.result) {
                    var results = data.body.result;
                    var cfiles = results.files;
                    if (typeof cfiles === 'undefined') {
                        resolve({});
                        return;
                    }
                    resolve(_.cloneDeep(results));
                    return;
                }
                console.log("Error no body returned");
                reject();
            });
        });
    };
    UXsyncNowREST._singleton = null;
    return UXsyncNowREST;
}());
exports.UXsyncNowREST = UXsyncNowREST;
//# sourceMappingURL=UXsyncNowREST.js.map