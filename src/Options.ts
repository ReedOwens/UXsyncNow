import * as fs from "fs"
import * as jsonfile from "jsonfile";
import * as _ from "lodash";
import * as path from "path";

export class Options {
    private static singleton: Options = null;
    private options: any = {
        host: "uxstormdev5.service-now.com",
        protocol: "https",
        port: 0,
        user: "resttest",
        password: "abc123",
        applications: [],
        app: "",
        app_sys_id: "",
        proxy: "",
        interval: 3000,
        connection_max: 0,
        connection_wait: 0,
        top_dir: "",
        table_ignore: [],
        table_error: [],
        file_override: [],
        table_display: {}
    };

    private _help = {
        host:
            "Hostname of the ServiceNow Instance.  Example dev2000.service-now.com",
        protocol:
            "HTTP protocol to use.   It is either HTTPS or HTTP.  Defaults to HTTPS",
        port:
            "If the instance is not on the standard HTTP/HTTPS port, specify the port with this option.  a Value of 0 means to use the default port",
        app: "Name of the application to sync",
        user: "User name to connect to the ServiceNow Instance",
        password: "The ServiceNow user password to use to connect to the Instance",
        proxy:
            "If your connection requires the use of an HTTP proxy, set this value to your required proxy.",
        connection_max:
            "Maximum amount of connections to your instance.  0 is unlimited.",
        connection_wait:
            "Time in milliseconds to wait between each connection to your instance. ",
        top_dir:
            "The top directory where all the applications that are synced will be stored in the filesystem.",
        interval:
            "The interval in ms between checking the instance for any file changes.  Default is 30000 or 30 seconds."
    };

    private configFile = "";
    private configFileDir = "";

    constructor(baseDir: string = "./", type: string = "dev") {
        if (Options.singleton !== null) {
            return Options.singleton;
        }

        //    const configDir = baseDir;
        this.configFileDir = baseDir;
        const configFile = `uxsyncnow-config-${type}.json`;
        this._configDir = path.normalize(baseDir + path.sep + `.uxsyncnow-${type}`);

        this.configFile = path.normalize(this.configFileDir + "/" + configFile);
        if (fs.existsSync(this.configFileDir)) {
            let stat = fs.statSync(this.configFileDir);
            if (stat.isDirectory()) {
                // Directory exists.  Check for exiting configuration
                if (fs.existsSync(this.configFile)) {
                    this.read();
                } else {
                    console.log("Creating config file with defaults");
                    this.save();
                }
            } else {
                console.log(
                    this.configFileDir +
                    " is not a directory.  Please correct and run again"
                );
                process.exit(-1);
            }
        } else {
            console.log("Creating config file with defaults");
            fs.mkdirSync(this.configFileDir);
            this.save();
        }

        Options.singleton = this;
    }

    private _configDir = "";

    get configDir(): string {
        return this._configDir;
    }

    /**
     * Returns the singleton object of the Options class.
     *
     * @param {string} baseDir
     * @returns {Options}
     */
    static getOptions(baseDir: string = "./"): Options {
        if (Options.singleton == null) Options.singleton = new Options(baseDir);
        return Options.singleton;
    }

    /**
     * Sets an option value
     *
     * @param {string} name
     * @param value
     */

    set(name: string, value: any) {
        this.options[name] = value;
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

    get(name: string, defaultValue?: any): any {
        if (typeof this.options[name] !== "undefined") return this.options[name];
        if (typeof defaultValue === "undefined") return null;
        return defaultValue;
    }

    save() {
        try {
            jsonfile.writeFileSync(this.configFile, this.options, {
                spaces: 2,
                EOL: "\r\n"
            });
        } catch (err) {
            console.log("Could not write config file: " + this.configFile);
            console.log("" + err);
            process.exit(-1);
        }
    }

    read() {
        try {
            console.log("Reading config file: " + this.configFile);
            this.options = jsonfile.readFileSync(this.configFile);
        } catch (err) {
            console.log("Could not read config file: " + this.configFile);
            console.log("" + err);
            process.exit(-1);
        }
    }

    show(log?: any) {
        const optionCols = 16;

        if (!log) log = console.log;

        for (let option in this._help) {
            log(_.padEnd(option, optionCols, " ") + " " + this._help[option]);
            //            log(`${option}  ---   ${this._help[option]}`);
        }
        log("-------------------------------------\n");
        for (let option in this._help) {
            let val = this.options[option];
            if (option === "app") {
                if (this.options[option]) {
                    val = this.options[option].name;
                }
            } else if (option == "password") {
                val = "*********";
            }
            log(_.padEnd(option, optionCols, " ") + " " + val);
            // log(`${option} : ${this.options[option]}`);
        }
    }

    asArray(): string[] {
        let list = [];
        for (let option in this._help) list.push(option);
        return list;
    }

    help(option: string): string {
        return this._help[option] || "";
    }
}
