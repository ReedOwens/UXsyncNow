(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//var table = request.queryParams.table;
	
	//var tu = new x_uxs_uxsheets.tableUtils();
	//var refs = tu.getRelatedLists(table);
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"})
    }

    var list = uxsyncnow.getApplications();
    return list;
})(request, response);