import * as unirest from "unirest";
import {Options} from "./Options";
import Promise = require('bluebird');

let Bottleneck = require('bottleneck');

/**
 * Class to manage the ServiceNow connections
 */

export class NowConnection {
    private url: string;
    private base: unirest.Request;
    private basePut: unirest.Request;

    private static singleton: NowConnection = null;
    private static _limiter: any = null;
    private static _options: Options = null;

    /**
     * Gets the singleton instance of NowConnection
     *
     * @returns {NowConnection}
     */
    static getConnection(): NowConnection {
        if (NowConnection.singleton === null)
            new NowConnection('');
        return NowConnection.singleton;
    }

    /**
     * Resets the connection.   All the communications go through a Bottleneck limiter to ensure
     * that the ServiceNow instance doesn't receive too many requests at a time
     */
    static resetConnection() {
        NowConnection.getConnection();
        let options = NowConnection._options;
        let connections = options.get('connection_max',0);
        let time = options.get('connection_wait', 0);
        if (NowConnection._limiter === null) {
            NowConnection._limiter = new Bottleneck(connections,time);
        }

    }

    /**
     * Creates the NowConnection class.  An endPoint must be provided to the ServiceNow instance..
     *
     * @param {string} endPoint
     */
    constructor(endPoint: string) {
        NowConnection.singleton = this;

        if (NowConnection._options === null)
            NowConnection._options = Options.getOptions();
        if (NowConnection._limiter === null)
            NowConnection.resetConnection();
        let options = NowConnection._options;
        this.url = options.get("protocol") + '://' + options.get('host');
        let auth = {
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
            .pool({ maxSockets: 5})
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
            .pool({ maxSockets: 5})
            .strictSSL(false);

        let proxy = options.get('proxy');
        if (proxy != '') {
            this.base = this.base.proxy(proxy);
            this.basePut = this.basePut.proxy(proxy);

        }
    }

    queryp(endPoint: string, qstring: string ): Promise<void> {
        let self = this;
        return new Promise(function(resolve,reject){
            self.queryWithCallback(endPoint,qstring, (data) =>{
                resolve(data);
            })
        })
    }

    queryWithCallback(endPoint: string, qstring: string, callback: any) {
        let msg = this.base.url(this.url + endPoint)
            .query({"sysparm_query": qstring});

        NowConnection._limiter.submit(this._send, this.base, this.url + endPoint, qstring, callback)


        /*
                 NowConnection._limiter.submit(this.base.url(this.url + endPoint)
                    .query({"sysparm_query": qstring})
                     .end(callback));
        */
    }

    putp(endPoint: string, body:any ): Promise<void> {
        let self = this;
        return new Promise(function(resolve,reject){
            self.putWithCallback(endPoint,body, (data) =>{
                resolve(data);
            })
        })
    }

    putWithCallback(endPoint: string, data: any, callback: any) {
        let msg = this.base.url(this.url + endPoint);

        NowConnection._limiter.submit(this._put, this.basePut, this.url + endPoint, data, callback)

    }

    private _send(base: unirest, endPoint: string, qstring: string, callback: any) {
        base.url(endPoint)
            .query({"sysparm_query": qstring})
            .end(callback);
    }

    private _put(base: unirest, endPoint: string, data: any, callback: any) {
        base.url(endPoint)
            .send(data)
            .end(callback);
    }
}
