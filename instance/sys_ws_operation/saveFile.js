(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"})
    }

    var json = new global.JSON();

    var o = json.decode(request.body.dataString);
    if (o) {
        var now = new GlideDateTime();

        var table = o['table'];
        var sys_id = o['sys_id'];
        var field = o['field'];
        var content = o['content'];
        if (!table || !sys_id || !field || !content) {
            return ({status: "Error",error: "table, sys_id, field, and content must be provided"});
        }
        var result = uxsyncnow.saveApplicationFile(table ,sys_id ,field, content);
        if (result === null) {
        	return { status: "ERROR", message: "Record with field doesn't exist."};
		}
        return ({status: "SUCCESS", result: result, now: now.getNumericValue() });
    }
})(request, response);