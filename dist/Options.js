"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var jsonfile = require("jsonfile");
var _ = require("lodash");
var path = require("path");
var CryptoJS = require("crypto-js");
var Options = /** @class */ (function () {
    function Options(baseDir, type) {
        if (baseDir === void 0) { baseDir = "./"; }
        if (type === void 0) { type = "dev"; }
        this.options = {
            host: "",
            protocol: "https",
            port: 0,
            user: "",
            password: "",
            applications: [],
            app: "",
            app_sys_id: "",
            proxy: "",
            interval: 30000,
            connection_max: 0,
            connection_wait: 0,
            top_dir: "",
            table_ignore: [],
            table_error: [],
            file_override: [],
            table_display: {}
        };
        this._help = {
            host: "Hostname of the ServiceNow Instance.  Example dev2000.service-now.com",
            protocol: "HTTP protocol to use.   It is either HTTPS or HTTP.  Defaults to HTTPS",
            port: "If the instance is not on the standard HTTP/HTTPS port, specify the port with this option.  a Value of 0 means to use the default port",
            app: "Name of the application to sync",
            user: "User name to connect to the ServiceNow Instance",
            password: "The ServiceNow user password to use to connect to the Instance",
            proxy: "If your connection requires the use of an HTTP proxy, set this value to your required proxy.",
            connection_max: "Maximum amount of connections to your instance.  0 is unlimited.",
            connection_wait: "Time in milliseconds to wait between each connection to your instance. ",
            top_dir: "The top directory where all the applications that are synced will be stored in the filesystem.",
            interval: "The interval in ms between checking the instance for any file changes.  Default is 30000 or 30 seconds."
        };
        this.configFile = "";
        this.configFileDir = "";
        this._configDir = "";
        if (Options.singleton !== null) {
            return Options.singleton;
        }
        //    const configDir = baseDir;
        this.configFileDir = baseDir;
        var configFile = "uxsyncnow-config-" + type + ".json";
        this._configDir = path.normalize(baseDir + path.sep + (".uxsyncnow-" + type));
        this.configFile = path.normalize(this.configFileDir + "/" + configFile);
        if (fs.existsSync(this.configFileDir)) {
            var stat = fs.statSync(this.configFileDir);
            if (stat.isDirectory()) {
                // Directory exists.  Check for exiting configuration
                if (fs.existsSync(this.configFile)) {
                    this.read();
                }
                else {
                    //console.log("Creating config file with defaults");
                    this.save();
                }
            }
            else {
                console.log(this.configFileDir +
                    " is not a directory.  Please correct and run again");
                process.exit(-1);
            }
        }
        else {
            //console.log("Creating config file with defaults");
            fs.mkdirSync(this.configFileDir);
            this.save();
        }
        Options.singleton = this;
    }
    Object.defineProperty(Options.prototype, "configDir", {
        get: function () {
            return this._configDir;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the singleton object of the Options class.
     *
     * @param {string} baseDir
     * @returns {Options}
     */
    Options.getOptions = function (baseDir) {
        if (baseDir === void 0) { baseDir = "./"; }
        if (Options.singleton == null)
            Options.singleton = new Options(baseDir);
        return Options.singleton;
    };
    /**
     * Sets an option value
     *
     * password is encrypted
     * interval can not be set to a value < 1000ms
     *
     * @param {string} name
     * @param value
     */
    Options.prototype.set = function (name, value) {
        var v = value;
        switch (name) {
            case "password":
                // Handle encryption of password
                v = CryptoJS.AES.encrypt(value, '1N33dUX5t0rm!').toString();
                break;
            case "interval":
                try {
                    var i = parseInt(value);
                    if (i < 1000) {
                        v = "1000";
                    }
                }
                catch (e) { }
                break;
        }
        this.options[name] = v;
    };
    /**
     * Gets the value of an option.  If **defaultValue** is provided and the option doesn't
     * exist, then defaultValue is return.  If the option doesn't exist and no defaultValue
     * is provided then null is returned.
     *
     * password is decrypted before passing back.
     *
     * @param {string} name
     * @param defaultValue
     * @returns {any}
     */
    Options.prototype.get = function (name, defaultValue) {
        if (typeof this.options[name] !== "undefined") {
            var v = this.options[name];
            switch (name) {
                case "password":
                    var bytes = CryptoJS.AES.decrypt(v, '1N33dUX5t0rm!');
                    v = bytes.toString(CryptoJS.enc.Utf8);
                    break;
            }
            return v;
        }
        if (typeof defaultValue === "undefined")
            return null;
        return defaultValue;
    };
    Options.prototype.save = function () {
        try {
            jsonfile.writeFileSync(this.configFile, this.options, {
                spaces: 2,
                EOL: "\r\n"
            });
        }
        catch (err) {
            console.log("Could not write config file: " + this.configFile);
            console.log("" + err);
            process.exit(-1);
        }
    };
    Options.prototype.read = function () {
        try {
            console.log("Reading config file: " + this.configFile);
            this.options = jsonfile.readFileSync(this.configFile);
        }
        catch (err) {
            console.log("Could not read config file: " + this.configFile);
            console.log("" + err);
            process.exit(-1);
        }
    };
    Options.prototype.show = function (log) {
        var optionCols = 16;
        if (!log)
            log = console.log;
        for (var option in this._help) {
            log(_.padEnd(option, optionCols, " ") + " " + this._help[option]);
            //            log(`${option}  ---   ${this._help[option]}`);
        }
        log("-------------------------------------\n");
        for (var option in this._help) {
            var val = this.options[option];
            if (option === "app") {
                if (this.options[option]) {
                    val = this.options[option].name;
                }
            }
            else if (option == "password") {
                val = "*********";
            }
            log(_.padEnd(option, optionCols, " ") + " " + val);
            // log(`${option} : ${this.options[option]}`);
        }
    };
    Options.prototype.asArray = function () {
        var list = [];
        for (var option in this._help)
            list.push(option);
        return list;
    };
    Options.prototype.help = function (option) {
        return this._help[option] || "";
    };
    Options.singleton = null;
    return Options;
}());
exports.Options = Options;
//# sourceMappingURL=Options.js.map