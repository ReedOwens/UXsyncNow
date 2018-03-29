(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"});
    }

    var json = new global.JSON();

    var o = json.decode(request.body.dataString);
    if (o) {
        var table = o['table'];
        var sys_id = o['sys_id'];
        var fields = o['fields'];
        if (!table || !sys_id || !fields) {
            return ({status: "Error", error_message: "Missing table, sys_id, or fields"});
        }
        return uxsyncnow.getFile(table, sys_id, fields);
    }
    return ({status: "ERROR", error_message: "No params passed in PUT body."});
})(request, response);