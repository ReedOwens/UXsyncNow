import Promise = require('bluebird');
import {Options} from "./Options";
import _ = require('lodash');
import {UXsyncNowREST} from "./UXsyncNowREST";
import {Debug} from "./Debug";

export interface ApplicationDef {
    id: number,
    sys_id: string,
    version: string,
    short_description: string,
    scope: string,
    name: string
}

export class NowApplications {
    private debug:Debug = new Debug("NowApplications");

    get applications(): {name?:ApplicationDef} {
        return this._applications;
    }

    private _applications:{name?:ApplicationDef} = {};
    private static _singleton: NowApplications = null;

    constructor() {
        let options = Options.getOptions();
        this._applications = options.get('applications', {});
        NowApplications._singleton = this;
    }

    find(name:string) : ApplicationDef {
        return _.find(this._applications, ['name', name])
    }

    findBy(pred:string, value:any) {
         //prioritize exact matches
         let key = _.find(this._applications, function(app){
            return app[pred].toString().toLowerCase() === value.toString().toLowerCase();
        });
        if(!key){
            key = _.find(this._applications, function(app){
                return app[pred].toString().toLowerCase().indexOf(value.toString().toLowerCase()) > -1;
            });
        }
        return key;
    }

    static getNowApplications(): NowApplications {
        if (NowApplications._singleton === null)
            new NowApplications();
        return NowApplications._singleton;
    }

    refresh(): Promise<void> {
        let debug = this.debug;
        let self = this;
        return new Promise(function (resolve, reject) {
            UXsyncNowREST.getUXsyncNowREST().getApplications()
                .then((apps:{name:ApplicationDef}) => {
                    debug.log("Got Refresh response");
                    self._applications = _.clone(apps);
                    let options = Options.getOptions();
                    options.set("applications", _.clone(apps));
                    options.save();
                    resolve();
                })
                .error((err) => reject(err))
        });
    }
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


    asArray(prop?: string): string[] {
        let apps = [];
        for (let a in this._applications) {
            if (prop)
                apps.push(this._applications[a][prop]);
            else
                apps.push(a);
        }
        return apps;
    }
}