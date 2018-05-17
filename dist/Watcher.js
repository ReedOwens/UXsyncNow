"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chokidar = require("chokidar");
var Watcher = /** @class */ (function () {
    function Watcher(persist) {
        if (persist === void 0) { persist = true; }
        this.watcher = chokidar.watch('', { persistent: persist });
    }
    ;
    Object.defineProperty(Watcher.prototype, "onChange", {
        set: function (value) {
            this.watcher.on('change', value);
        },
        enumerable: true,
        configurable: true
    });
    Watcher.getWatcher = function () {
        if (Watcher.singleton === null) {
            Watcher.singleton = new Watcher();
        }
        return Watcher.singleton;
    };
    Watcher.prototype.add = function (file) {
        this.watcher.add(file);
    };
    Watcher.prototype.remove = function (file) {
        this.watcher.unwatch(file);
    };
    Watcher.prototype.close = function () {
        this.watcher.close();
    };
    Watcher.singleton = null;
    return Watcher;
}());
exports.Watcher = Watcher;
//# sourceMappingURL=Watcher.js.map