"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var unirest = require("unirest");
var Options_1 = require("./Options");
var Promise = require("bluebird");
var Bottleneck = require('bottleneck');
/**
 * Class to manage the ServiceNow connections
 */
var NowConnection = /** @class */ (function () {
    /**
     * Creates the NowConnection class.  An endPoint must be provided to the ServiceNow instance..
     *
     * @param {string} endPoint
     */
    function NowConnection(endPoint) {
        NowConnection.singleton = this;
        if (NowConnection._options === null)
            NowConnection._options = Options_1.Options.getOptions();
        if (NowConnection._limiter === null)
            NowConnection.resetConnection();
        var options = NowConnection._options;
        this.url = options.get("protocol") + '://' + options.get('host');
        var auth = {
            user: options.get('user'),
            password: options.get('password'),
            sendImmediately: true
        };
        this.base = unirest.get(this.url + endPoint)
            .headers({
            'Accept': 'application/json',
            'User-Agent': 'Unirest Node.js'
        })
            .type('json')
            //   .proxy('http://127.0.0.1:8888')
            //   .strictSSL(false)
            .auth(auth)
            .pool({ maxSockets: 5 })
            .strictSSL(false);
        this.basePut = unirest.put(this.url + endPoint)
            .headers({
            'Accept': 'application/json',
            'User-Agent': 'Unirest Node.js'
        })
            .type('json')
            //   .proxy('http://127.0.0.1:8888')
            //   .strictSSL(false)
            .auth(auth)
            .pool({ maxSockets: 5 })
            .strictSSL(false);
        var proxy = options.get('proxy');
        if (proxy != '') {
            this.base = this.base.proxy(proxy);
            this.basePut = this.basePut.proxy(proxy);
        }
    }
    /**
     * Gets the singleton instance of NowConnection
     *
     * @returns {NowConnection}
     */
    NowConnection.getConnection = function () {
        if (NowConnection.singleton === null)
            new NowConnection('');
        return NowConnection.singleton;
    };
    /**
     * Resets the connection.   All the communications go through a Bottleneck limiter to ensure
     * that the ServiceNow instance doesn't receive too many requests at a time
     */
    NowConnection.resetConnection = function () {
        NowConnection.getConnection();
        var options = NowConnection._options;
        var connections = options.get('connection_max', 0);
        var time = options.get('connection_wait', 0);
        if (NowConnection._limiter === null) {
            NowConnection._limiter = new Bottleneck(connections, time);
        }
    };
    NowConnection.prototype.queryp = function (endPoint, qstring) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.queryWithCallback(endPoint, qstring, function (data) {
                resolve(data);
            });
        });
    };
    NowConnection.prototype.queryWithCallback = function (endPoint, qstring, callback) {
        var msg = this.base.url(this.url + endPoint)
            .query({ "sysparm_query": qstring });
        NowConnection._limiter.submit(this._send, this.base, this.url + endPoint, qstring, callback);
        /*
                 NowConnection._limiter.submit(this.base.url(this.url + endPoint)
                    .query({"sysparm_query": qstring})
                     .end(callback));
        */
    };
    NowConnection.prototype.putp = function (endPoint, body) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.putWithCallback(endPoint, body, function (data) {
                resolve(data);
            });
        });
    };
    NowConnection.prototype.putWithCallback = function (endPoint, data, callback) {
        var msg = this.base.url(this.url + endPoint);
        NowConnection._limiter.submit(this._put, this.basePut, this.url + endPoint, data, callback);
    };
    NowConnection.prototype._send = function (base, endPoint, qstring, callback) {
        base.url(endPoint)
            .query({ "sysparm_query": qstring })
            .end(callback);
    };
    NowConnection.prototype._put = function (base, endPoint, data, callback) {
        base.url(endPoint)
            .send(data)
            .end(callback);
    };
    NowConnection.singleton = null;
    NowConnection._limiter = null;
    NowConnection._options = null;
    return NowConnection;
}());
exports.NowConnection = NowConnection;
//# sourceMappingURL=Connection.js.map