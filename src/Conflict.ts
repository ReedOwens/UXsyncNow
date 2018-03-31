import {Debug} from "./Debug";
import {NowFile} from "./NowFile";
import {findIndex,map} from "lodash";

export enum IResolveMode {
    PULL,
    PUSH,
    MERGE
}

export class Conflicts {
   // private debug = new Debug("Conflict");
    private static  _singleTon: Conflicts = null;
    private _list: NowFile[] = [];

    constructor() {
        if( Conflicts._singleTon ) return Conflicts._singleTon;
        Conflicts._singleTon = this;
    }

    get length(): number {
        return this._list.length;
    }

    add( file: NowFile ) {
        this._list.push(file);
    }

    remove( file: NowFile ) {
      let i = findIndex(this._list, file);
      if (i>=0) {
          this._list.splice(i,1);
      }
    }

    asArray(key = 'fileName'): string[] {
        return map(this._list, key);
    }

    get list(): NowFile[] {
        return this._list;
    }

    resolve(file: NowFile, mode: IResolveMode) {
        let i = findIndex(this._list, file);
        if (i>=0) {
            switch (mode) {
                case IResolveMode.PULL:
                    this._list[i].pullFile();
                    break;
                case IResolveMode.PUSH:
                    this._list[i].pushFile();
                    break;
                case IResolveMode.MERGE:
                    this._list[i].mergeFile();
            }
            this._list.splice(i,1);
        }


    }
}