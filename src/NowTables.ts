import Promise = require('bluebird');
import {Options} from "./Options";
import * as _ from "lodash";
import {UXsyncNowREST} from "./UXsyncNowREST";

export interface IFieldDef {
    name:string,
    table:string,
    label:string,
    type:string,
    scope:string,
    scope_id:string,
    fileName?:string,  // Override for the standard file name
    dir?:string        // Override for the standard directory
}

export interface ITableDef {
    key:string,
    name:string,
    fields: IFieldDef[],
    label?:string
}

export class NowTables {
    get tablesUnmapped(): {} {
        return this._tablesUnmapped;
    }

    get tablesNonApplication(): {} {
        return this._tablesNonApplication;
    }

    get tables(): {} {
        return this._tables;
    }

    private _tables = {};
    private _tablesUnmapped = {};
    private _tablesNonApplication = {};
    private static _singleton: NowTables = null;

    constructor() {
        let options = Options.getOptions();
        this._tables = options.get('tables', {});
        this._tablesUnmapped = options.get('tables_unmapped', {});
        this._tablesNonApplication = options.get('tables_non_application', {});
        NowTables._singleton = this;
    }

    static getNowTables(): NowTables {
        if (NowTables._singleton === null)
            new NowTables();
        return NowTables._singleton
    }


    refresh(): Promise<void> {
        let self = this;
        let table_errors = [];
        let table_display = {};
        let options = Options.getOptions();
        let table_ignore = options.get('table_ignore', []);

        return new Promise(function (resolve, reject) {
            let api = UXsyncNowREST.getUXsyncNowREST();
            api.getTables().then((result) => {
                    self._tables = result.tables;
                    self._tablesUnmapped = result.tables_unmapped;
                    self._tablesNonApplication = result.tables_non_application;
                    let options = Options.getOptions();
                    options.set('tables',self._tables);
                    options.set('tables_unmapped',self._tablesUnmapped);
                    options.set('tables_non_application',self._tablesNonApplication);
                    options.save();
                    resolve();
                },
                (err) => {
                    console.log("Got error",err);
                    reject()
                });
        });
    }
    /*
         list():string {
            let ret = "";
            let tables = this._tables;
            _.each(tables,(table:IRESTTableDef,) => {
                ret += `${table.name} (${table.key})
    ----------------------------------------------------------------------
                `;
                _.each(table.fields, (field:IRestFieldDef) => {
                    ret += '   ' +
                        _.padEnd(field.name, 20) + ' ' +
                        _.padEnd(field.label, 20) + ' ' +
                        _.padEnd(field.type, 20) +  "\n";
                });
                ret += "\n";
            });
            return ret;
        }

    */
}