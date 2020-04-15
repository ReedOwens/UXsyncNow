(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var uxsyncnow = new UXsyncNow();

    return(uxsyncnow.validUserDetail());

})(request, response);