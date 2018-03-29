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

import fs = require('fs');
import jsonfile = require('jsonfile');
import {Options} from "./Options";

export interface IFileCache {
    serverCRC: number;
    clientCRC: number;
    serverSync: number;
    clientSync: number;
}

export const IGNORE = -1;

export class FileCache {
    private static singleton: FileCache = null;


    private configFile = '';
    private files = {};

    constructor() {

        if (FileCache.singleton !== null) {
            return FileCache.singleton
        }

        let options = new Options();

        const configDir = options.configDir;
        const configFile = "file_cache.json";

        this.configFile = configDir + '/' + configFile;
        if (fs.existsSync(configDir)) {
            let stat = fs.statSync(configDir);
            if (stat.isDirectory()) {
                // Directory exists.  Check for exiting configuration
                if (fs.existsSync(this.configFile)) {
                    this.read();
                } else {
                    console.log('Creating config file with defaults');
                    this.save();
                }
            } else {
                console.log(configDir + " is not a directory.  Please correct and run again");
                process.exit(-1);
            }
        } else {
            console.log("Creating config file with defaults");
            fs.mkdirSync(configDir);
            this.save();
        }

        FileCache.singleton = this;
    }

    /**
     * Returns the singleton object of the Options class.
     *
     * @param {string} baseDir
     * @returns {Options}
     */
    static getFileCache(): FileCache {
        if (FileCache.singleton == null)
            FileCache.singleton = new FileCache();
        return (FileCache.singleton)
    }

    /**
     * Sets an option value
     *
     * @param {string} name
     * @param value
     */

    set(name: string, value: IFileCache) {
        this.files[name] = value;
        this.save();
    }

    /**
     * Gets the value of an option.  If **defaultValue** is provided and the option doesn't
     * exist, then defaultValue is return.  If the option doesn't exist and no defaultValue
     * is provided then null is returned.
     *
     * @param {string} name
     * @param defaultValue
     * @returns {any}
     */

    get(name: string, defaultValue = true): IFileCache {
        if (typeof this.files[name] !== 'undefined')
            return this.files[name];
        if (defaultValue) {
            return { serverCRC: IGNORE, clientCRC: IGNORE, serverSync: IGNORE, clientSync: IGNORE}
        }
        return null;
    }

    exists(name: string): boolean {
        return (typeof this.files[name] !== 'undefined');
    }

    save() {
        try {
            jsonfile.writeFileSync(this.configFile, this.files, {spaces: 2, EOL: '\r\n'});
        } catch (err) {
            console.log("Could not write FileCache file: " + this.configFile);
            console.log('' + err);
            process.exit(-1);
        }
    }

    read() {
        try {
            this.files = jsonfile.readFileSync(this.configFile);
        } catch (err) {
            console.log("Could not read FileCache file: " + this.configFile);
            console.log('' + err);
            process.exit(-1);
        }
    }
}