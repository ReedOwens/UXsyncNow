(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//var table = request.queryParams.table;
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"})
    }

    var json = new global.JSON();

    var o = json.decode(request.body.dataString);
    if (o) {
        var now = new GlideDateTime();

        var app = o['application'];
        var since = o['since'];
        var tables = o['tables'];
//        return( { app: app, tables: tables});
        if (!app || !tables) {
        	return ({status: "Error",error_message: "An application and tables must be provided."});
		}
        var list = uxsyncnow.getApplicationFiles(app,tables,since);
        return ({status: "SUCCESS", files: list, now: now.getNumericValue() });
    }
	return ({status: "ERROR", error_message: "No params passed in PUT body."});
})(request, response);