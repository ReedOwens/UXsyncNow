(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"});
    }

    var json = new global.JSON();

    var o = json.decode(request.body.dataString);
    if (o) {
        var app = o['application'];
        if (!app ) {
            return ({status: "Error", error_message: "Missing application"});
        }
		uxsyncnow.getApplicationExtendedTables();
        return uxsyncnow.getAppRecords(app);
    }
    return ({status: "ERROR", error_message: "No params passed in PUT body."});
})(request, response);