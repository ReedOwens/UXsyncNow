"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var notifier = require("node-notifier");
var path = require("path");
var Notify = /** @class */ (function () {
    function Notify() {
    }
    Notify.message = function (msg, title, icon) {
        if (title === void 0) { title = "UXsyncNow"; }
        if (icon === void 0) { icon = 'cloud-upload.png'; }
        if (Notify._showMessage) {
            notifier.notify({
                title: title,
                message: msg,
                wait: false,
                sound: true,
                icon: path.join(__dirname, '../images', icon)
            }, function (err, response) {
                // Handle any responses
            });
        }
    };
    Object.defineProperty(Notify, "showMessage", {
        set: function (value) {
            Notify._showMessage = value;
        },
        enumerable: true,
        configurable: true
    });
    Notify._showMessage = false;
    return Notify;
}());
exports.Notify = Notify;
//# sourceMappingURL=Notify.js.map