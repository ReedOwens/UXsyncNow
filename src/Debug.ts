import _ = require('lodash');

export class Debug {
    private static _level:number = 0;
    private static _vorpal:any = null;
    private static _filter: string[] = [];
    private static _areas: string[] = [];
    private area = '';

    static get vorpal(): any {
        return this._vorpal;
    }

    static set vorpal(value: any) {
        this._vorpal = value;
    }

    static get level(): number {
        return this._level;
    }

    static set level(value: number) {
        this._level = value;
    }

    static get areas():string [] {
        let areas:string [] = _.clone(Debug._areas);
        return areas;
    }

    static resetFilter() {
        Debug._filter = [];
    }

    static filter(area:string) {
        Debug._filter.push(area);
    }

    log(msg:string, level:number = 1 ) {
        if (level <= Debug.level) {
            if (Debug._filter.length>0 && Debug._filter.indexOf(this.area)=== -1)
                return;
            if (Debug.vorpal)
                Debug.vorpal.log( _.padEnd(this.area,15) + ": " + msg);
            else
                console.log( _.padEnd(this.area,15) + ": " + msg);
        }
    }

    constructor(area:string = 'gen') {
        this.area = area;
        Debug._areas.push(area);
    }
}