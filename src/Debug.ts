import {padEnd,clone} from 'lodash';

export class Debug {
    private static _level:number = 0;
    private static _vorpal:any = null;
    private static _filter: string[] = [];
    private static _areas: string[] = [];

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
        let areas:string [] = clone(Debug._areas);
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
                Debug.vorpal.log( padEnd(this.area,15) + ": " + msg);
            else
                console.log( padEnd(this.area,15) + ": " + msg);
        }
    }

    constructor(private area:string = 'gen') {
        if (Debug._areas.indexOf(area) === -1 ) {
            Debug._areas.push(area);
        }
    }
}