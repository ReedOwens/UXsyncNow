import {NowConnection} from "./Connection";
import {Options} from "./Options";
import _ = require('lodash');
import Promise = require('bluebird');
import {ApplicationDef} from "./NowApplications";
import {ITableDef} from "./NowTables";
import {Debug} from "./Debug";

const ENDPOINT = "/api/global/uxsyncnow";
export interface IRestFieldDef {
    name: string,
    table: string,
    label: string,
    type: string,
    scope: string,
    scope_id: string
}

export interface IRESTTableDef {
    key:string,
    name: string,
    fields: IRestFieldDef[]
}

export interface IRESTable {
    [name:string] : IRESTTableDef
}

export interface IRESTTableResult {
    tables : IRESTable,
    tables_unmapped : IRESTable,
    tables_non_application : IRESTable
}

export interface IRESTFile {
    table:string,
    sys_id:string,
    name:string,
    lastChanged:string,
    owner:string,
    fields:string[],
    crc:string[]
}

export class UXsyncNowREST {
    private _connection: NowConnection = null;
    private _options: Options = null;
    private _connected: boolean = false;
    private _errorMessage: string = "";
    private static _singleton: UXsyncNowREST = null;

    private debug = new Debug("UXsyncNowREST");

    get connected(): boolean {
        return this._connected;
    }

    get errorMessage(): string {
        return this._errorMessage;
    }

    static getUXsyncNowREST(): UXsyncNowREST {
        if (UXsyncNowREST._singleton === null)
            new UXsyncNowREST();
        return UXsyncNowREST._singleton;
    }

    init(): Promise<void> {
        let debug = this.debug;
        return ( new Promise((resolve) => {
            var valid = true;
            var message = [];
            var self = this;

            _.each(['host', 'protocol', 'user', 'password'], (name) => {
                if (this._options.get(name, '') === '') {
                    valid = false;
                    message.push(`${name} is not defined`);
                }
            });
            if (valid) {
                // Ok have enough for the valid connection
                this._connection = new NowConnection(ENDPOINT);

                // Now check the API.
                this._connection.queryp(ENDPOINT + "/checkUser", "")
                    .then((data: any) => {
                        let body = (data.body);
                        if (body) {
                            if (typeof body["error"] !== 'undefined') {
                                // Got an error object
                                this._errorMessage = body.error.message;
                                this._connected = false;

                                if (this._errorMessage.indexOf("User Not Authenticated") >= 0) {
                                    this._errorMessage = 'Either the username or password is incorrect';
                                }
                                if (this._errorMessage.indexOf("Requested URI does not represent any resource:") >= 0) {
                                    this._errorMessage = "Instance does not contain UXsyncNow REST services.  Is the UXsyncNow Application installed on the instance?";
                                }
                                // todo: Check for other errors
                                resolve();
                                return;
                            }
                            if (body.result) {
                                let ret = body.result;
                                if (ret.result === 'ERROR') {
                                    this._connected = false;
                                    this._errorMessage = ret.message;
                                } else {
                                    this._connected = (ret.result === "SUCCESS");
                                    this._errorMessage = ret.errorMessage;
                                }
                            } else {
                                console.log("Whattt???");
                            }
                        } else {
                            // todo: Got an error of no body
                            var a;
                        }
                        resolve();
                        return;
                    })
                    .error((reason) => {
//                        console.log("Error received " + reason);
//                        console.log(reason);
                        this._connected = false;
                        this._errorMessage = reason;
                        resolve();
                        return;
                    });
            } else {
                this._connected = false;
                this._errorMessage = message.join('\n');
                resolve();
            }
        }));
    }

    constructor() {
        this._options = Options.getOptions();
        this._connection = NowConnection.getConnection();
        UXsyncNowREST._singleton = this;
    }

    getApplications(): Promise<{ [name:string] : ApplicationDef }> {
        let debug = this.debug;
        return new Promise((resolve, reject) => {
            debug.log("Getting Applications");
            if (!this._connected) {
                debug.log("Not connected");
                reject();
            }

            let connection = NowConnection.getConnection();
            connection.queryp(ENDPOINT + "/getApplications", '')
                .then(function (data: any) {
                    let apps: { [name:string] : ApplicationDef } = {};

                    debug.log("Got applications response");
                    if (data.error) {
                        console.log("GOT ERROR in retrieving applications");
                        if (data.error) console.log("Error: " + data.error);
                        reject();
                        return;
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
                            apps[name] = {
                                id: num++,
                                sys_id: sys_id,
                                version: version,
                                short_description: short_description,
                                scope: scope,
                                name: name
                            };
                        }
                        debug.log(`Got ${num} applications`)
                    }
                    resolve(apps);
                });
        });
    }

    saveFile(table: string, sys_id: string, field: string, content: string): Promise<any> {
        let debug = this.debug;

        return new Promise((resolve, reject) => {
            if (!this._connected) {
                debug.log("Not connected");
                reject();
            }
            let body = {
                table : table,
                sys_id : sys_id,
                field: field,
                content: content
            };
            let connection = NowConnection.getConnection();
            debug.log(`Calling Save File ${table} , ${sys_id} + ${field}`);

            connection.putp(ENDPOINT + "/saveFile", body)
                .then(function (data: any) {

                if (data.error) {
                    console.log("GOT ERROR in retrieving applications");
                    if (data.error) console.log("Error: " + data.error);
                    reject();
                    return;
                }
                if (data.body && data.body.result) {
                    resolve(_.clone(data.body.result));
                } else reject();
            });
        });
    }

    getTables(): Promise<IRESTTableResult> {
        return new Promise((resolve, reject) => {
            if (!this._connected) reject();

            let connection = NowConnection.getConnection();
            connection.queryp(ENDPOINT + "/getTables", '')
                .then(function (data: any) {
                    let tables = {};
                    if (data.error) {
                        console.log("GOT ERROR in retrieving tables");
                        if (data.error) console.log("Error: " + data.error);
                        reject();
                    }
                    if (data.body && data.body.result) {
                        resolve (_.cloneDeep(data.body.result));
                        return;
                    }
                    console.log("Error no body returned");
                    reject();

                });
        });
    }

    getApplicationFiles(tables:any,app:string,since?:number):Promise<IRESTApplicationFiles> {
        return new Promise((resolve, reject) => {
            if (!this._connected) reject();

            let body = {
                tables : tables,
                application: app,
                since : ''
            };
            if (since) body.since = since + '';

            let connection = NowConnection.getConnection();
            connection.putp(ENDPOINT + "/getApplicationFiles", body)
                .then(function (data: any) {

                    if (data.error) {
                        console.log("GOT ERROR in retrieving changed files");
                        if (data.error) console.log("Error: " + data.error);
                        reject();
                    }
                    if (data.body && data.body.result) {
                        let ret:IRESTApplicationFiles = {
                            now: '',
                            files: []
                        };
                        let files:IRESTFile[] = [];
                        let results= data.body.result;
                        let cfiles= results.files;
                        if (typeof results.now !== 'undefined')
                            ret.now = results.now;

                        for (let i=0; i<cfiles.length; i++) {
                            let f = cfiles[i];
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
    }

    getFile(table: string, sys_id: string, fields: string | string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this._connected) reject( ' not connected ');

            let flds = typeof fields === 'string' ? [fields] : fields;
            let body = {
                table : table,
                sys_id : sys_id,
                fields: flds
            };
            console.log('GET FILE ' + table + + ' ' + fields )
            let connection = NowConnection.getConnection();
            connection.putp(ENDPOINT + "/getFile", body)
                .then(function (data: any) {

                    if (data.error) {
                        console.log("GOT ERROR in retrieving file");
                        if (data.error) console.log("Error: " + data.error);
                        reject();
                        return;
                    }
                    if (data.body && data.body.result) {
                        let results= data.body.result;
                        let cfiles= results.files;
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
    }
}
export interface IRESTApplicationFiles {
    now:string,
    files:IRESTFile[]
}

export interface IRESTFile {
    table:string,
    sys_id:string,
    name:string,
    lastChanged:string,
    owner:string,
    fields:string[]
}