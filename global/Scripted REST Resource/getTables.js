(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var uxsyncnow = new UXsyncNow();

    if (!uxsyncnow.validUser()) {
        return ({status: "ERROR", message: "Invalid User"})
    }

    return uxsyncnow.getTables();
})(request, response);