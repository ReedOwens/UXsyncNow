/*
 * 2018 UXstorm LLC
 * All Rights Reserved.
 * Copyright 2018
 *
 *  NOTICE: All information contained herein is, and remains the property of
 *  UXstorm LLC. The intellectual and technical concepts contained herein are
 *  proprietary to UXstorm LLC and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material is
 *  strictly forbidden unless prior written permission is obtained from UXstorm
 *  LLC. Use of this code is covered under license agreements with UXstorm LLC
 *
 */


import {NowFile} from "./NowFile";
import {findIndex, forEach} from "lodash";

export class NowFiles {
    static filesSingleton: NowFiles;
    files: NowFile[] = [];

    constructor() {
        if (!NowFiles.filesSingleton) {
            NowFiles.filesSingleton = this;
        }
        return NowFiles.filesSingleton;
    }

    add(file: NowFile) {
        this.files.push(file);
    }

    remove(file: NowFile) {
        let index = findIndex(this.files,file);
        if (index>=0) {
            this.files.splice(index,1);
        }
    }

    paths(): string[] {
        let names: string[] = [];
        forEach(this.files, (file) => names.push(file.fileName));
        names.sort();
        return names;
    }

    find(value: any, key = "fileName"): NowFile {
        for (let i = 0; i < this.files.length; i++) {
            let file = this.files[i];
            if (typeof value === "string") {
                if (typeof file[key] !== "undefined") {
                    if (file[key] === value) return file;
                }
            } else if (typeof value === "object") {
                let res: NowFile = null;
                for (let k in value) {
                    // console.log("type " + file[k] + " is " + typeof file[k]);
                    if (typeof file[k] !== "undefined") {
                        if (file[k] === value[k]) {
                            res = file;
                        } else {
                            res = null;
                            break; // Don't go anymore
                        }
                    }
                }
                if (res) return res;
            }
        }
        return null;
    }
}