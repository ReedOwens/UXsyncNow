export = unirest;

declare function unirest(method: any, uri: any, headers: any, body: any, callback: any): any;

declare namespace unirest {
    const pipe: any;

    const prototype: {
    };

    function cookie(str: any): any;

    function firstMatch(string: any, map: any): any;

    function get(uri: any, headers: any, body: any, callback: any): any;

    function head(uri: any, headers: any, body: any, callback: any): any;

    function jar(options: any): any;

    function matches(string: any, map: any): any;

    function options(uri: any, headers: any, body: any, callback: any): any;

    function patch(uri: any, headers: any, body: any, callback: any): any;

    function post(uri: any, headers: any, body: any, callback: any): any;

    function put(uri: any, headers: any, body: any, callback: any): any;

    function request(uri: any, options: any, callback: any): any;

    function trim(s: any): any;

    function type(type: any, parse: any): any;

    namespace Request {
        function serialize(string: any, type: any): any;

        function uid(len: any): any;

        namespace serialize {
            const prototype: {
            };

        }

        namespace uid {
            const prototype: {
            };

        }

    }

    namespace Response {
        const statusCodes: {
            accepted: number;
            alreadyReported: number;
            badGateway: number;
            badRequest: number;
            conflict: number;
            created: number;
            expectationFailed: number;
            failedDependency: number;
            forbidden: number;
            found: number;
            gatewayTimeout: number;
            gone: number;
            httpVersionNotSupported: number;
            imUsed: number;
            insufficientStorage: number;
            internalServerError: number;
            lengthRequired: number;
            locked: number;
            loopDetected: number;
            methodNotAllowed: number;
            misdirectedRequest: number;
            movedPermanently: number;
            multiStatus: number;
            multipleChoices: number;
            noContent: number;
            nonAuthoritativeInformation: number;
            notAcceptable: number;
            notExtended: number;
            notFound: number;
            notImplemented: number;
            notModified: number;
            partialContent: number;
            paymentRequired: number;
            permanentRedirect: number;
            preconditionFailed: number;
            preconditionRequired: number;
            proxyAuthenticationRequired: number;
            rangeNotSatisfiable: number;
            requestEntityTooLarge: number;
            requestHeaderFieldsTooLarge: number;
            requestTimeout: number;
            resetContent: number;
            seeOther: number;
            serviceUnavailable: number;
            temporaryRedirect: number;
            tooManyRequests: number;
            unauthorized: number;
            unprocessableEntity: number;
            unsupportedMediaType: number;
            upgradeRequired: number;
            uriTooLong: number;
            useProxy: number;
            variantAlsoNegotiates: number;
        };

        function parse(string: any, type: any): any;

        function parseHeader(str: any): any;

        namespace parse {
            const prototype: {
            };

        }

        namespace parseHeader {
            const prototype: {
            };

        }

    }

    namespace cookie {
        const prototype: {
        };

    }

    namespace firstMatch {
        const prototype: {
        };

    }

    namespace get {
        const prototype: {
        };

    }

    namespace head {
        const prototype: {
        };

    }

    namespace jar {
        const prototype: {
        };

    }

    namespace matches {
        const prototype: {
        };

    }

    namespace options {
        const prototype: {
        };

    }

    namespace parsers {
        function json(data: any): any;

        function string(data: any): any;

        namespace json {
            const prototype: {
            };

        }

        namespace string {
            const prototype: {
            };

        }

    }

    namespace patch {
        const prototype: {
        };

    }

    namespace post {
        const prototype: {
        };

    }

    namespace put {
        const prototype: {
        };

    }

    namespace request {
        class Request {
            constructor(options: any);

            abort(): void;

            auth(user: any, pass: any, sendImmediately: any, bearer: any): any;

            aws(opts: any, now: any): any;

            debug(...args: any[]): void;

            destroy(): void;

            enableUnixSocket(): void;

            end(chunk: any): void;

            form(form: any): any;

            getHeader(name: any, headers: any): any;

            getNewAgent(): any;

            hawk(opts: any): void;

            httpSignature(opts: any): any;

            init(options: any, ...args: any[]): any;

            jar(jar: any): any;

            json(val: any): any;

            multipart(multipart: any): any;

            oauth(_oauth: any): any;

            onRequestError(error: any): void;

            onRequestResponse(response: any): any;

            pause(...args: any[]): void;

            pipe(dest: any, opts: any): any;

            pipeDest(dest: any): void;

            qs(q: any, clobber: any): any;

            readResponseBody(response: any): void;

            resume(...args: any[]): void;

            start(): void;

            toJSON(): any;

            write(...args: any[]): any;

            static debug: any;

            static defaultProxyHeaderExclusiveList: string[];

            static defaultProxyHeaderWhiteList: string[];

        }

        const debug: any;

        const prototype: {
        };

        function cookie(str: any): any;

        function defaults(options: any, requester: any): any;

        function del(uri: any, options: any, callback: any): any;

        function forever(agentOptions: any, optionsArg: any): any;

        function get(uri: any, options: any, callback: any): any;

        function head(uri: any, options: any, callback: any): any;

        function initParams(uri: any, options: any, callback: any): any;

        function jar(store: any): any;

        function patch(uri: any, options: any, callback: any): any;

        function post(uri: any, options: any, callback: any): any;

        function put(uri: any, options: any, callback: any): any;

        namespace Request {
            namespace prototype {
                const domain: any;

                function abort(): void;

                function addListener(type: any, listener: any): any;

                function auth(user: any, pass: any, sendImmediately: any, bearer: any): any;

                function aws(opts: any, now: any): any;

                function debug(...args: any[]): void;

                function destroy(): void;

                function emit(type: any, ...args: any[]): any;

                function enableUnixSocket(): void;

                function end(chunk: any): void;

                function eventNames(): any;

                function form(form: any): any;

                function getHeader(name: any, headers: any): any;

                function getMaxListeners(): any;

                function getNewAgent(): any;

                function hawk(opts: any): void;

                function httpSignature(opts: any): any;

                function init(options: any, ...args: any[]): any;

                function jar(jar: any): any;

                function json(val: any): any;

                function listenerCount(type: any): any;

                function listeners(type: any): any;

                function multipart(multipart: any): any;

                function oauth(_oauth: any): any;

                function on(type: any, listener: any): any;

                function onRequestError(error: any): void;

                function onRequestResponse(response: any): any;

                function once(type: any, listener: any): any;

                function pause(...args: any[]): void;

                function pipe(dest: any, opts: any): any;

                function pipeDest(dest: any): void;

                function prependListener(type: any, listener: any): any;

                function prependOnceListener(type: any, listener: any): any;

                function qs(q: any, clobber: any): any;

                function readResponseBody(response: any): void;

                function removeAllListeners(type: any, ...args: any[]): any;

                function removeListener(type: any, listener: any): any;

                function resume(...args: any[]): void;

                function setMaxListeners(n: any): any;

                function start(): void;

                function toJSON(): any;

                function write(...args: any[]): any;

                namespace abort {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.abort
                    const prototype: any;

                }

                namespace addListener {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.addListener
                    const prototype: any;

                }

                namespace auth {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.auth
                    const prototype: any;

                }

                namespace aws {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.aws
                    const prototype: any;

                }

                namespace debug {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.debug
                    const prototype: any;

                }

                namespace destroy {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.destroy
                    const prototype: any;

                }

                namespace emit {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.emit
                    const prototype: any;

                }

                namespace enableUnixSocket {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.enableUnixSocket
                    const prototype: any;

                }

                namespace end {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.end
                    const prototype: any;

                }

                namespace eventNames {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.eventNames
                    const prototype: any;

                }

                namespace form {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.form
                    const prototype: any;

                }

                namespace getHeader {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.getHeader
                    const prototype: any;

                }

                namespace getMaxListeners {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.getMaxListeners
                    const prototype: any;

                }

                namespace getNewAgent {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.getNewAgent
                    const prototype: any;

                }

                namespace hawk {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.hawk
                    const prototype: any;

                }

                namespace httpSignature {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.httpSignature
                    const prototype: any;

                }

                namespace init {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.init
                    const prototype: any;

                }

                namespace jar {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.jar
                    const prototype: any;

                }

                namespace json {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.json
                    const prototype: any;

                }

                namespace listenerCount {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.listenerCount
                    const prototype: any;

                }

                namespace listeners {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.listeners
                    const prototype: any;

                }

                namespace multipart {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.multipart
                    const prototype: any;

                }

                namespace oauth {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.oauth
                    const prototype: any;

                }

                namespace on {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.on
                    const prototype: any;

                }

                namespace onRequestError {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.onRequestError
                    const prototype: any;

                }

                namespace onRequestResponse {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.onRequestResponse
                    const prototype: any;

                }

                namespace once {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.once
                    const prototype: any;

                }

                namespace pause {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.pause
                    const prototype: any;

                }

                namespace pipe {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.pipe
                    const prototype: any;

                }

                namespace pipeDest {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.pipeDest
                    const prototype: any;

                }

                namespace prependListener {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.prependListener
                    const prototype: any;

                }

                namespace prependOnceListener {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.prependOnceListener
                    const prototype: any;

                }

                namespace qs {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.qs
                    const prototype: any;

                }

                namespace readResponseBody {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.readResponseBody
                    const prototype: any;

                }

                namespace removeAllListeners {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.removeAllListeners
                    const prototype: any;

                }

                namespace removeListener {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.removeListener
                    const prototype: any;

                }

                namespace resume {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.resume
                    const prototype: any;

                }

                namespace setMaxListeners {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.setMaxListeners
                    const prototype: any;

                }

                namespace start {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.start
                    const prototype: any;

                }

                namespace toJSON {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.toJSON
                    const prototype: any;

                }

                namespace write {
                    // Too-deep object hierarchy from unirest.request.Request.prototype.write
                    const prototype: any;

                }

            }

        }

        namespace cookie {
            const prototype: {
            };

        }

        namespace defaults {
            const prototype: {
            };

        }

        namespace del {
            const prototype: {
            };

        }

        namespace forever {
            const prototype: {
            };

        }

        namespace get {
            const prototype: {
            };

        }

        namespace head {
            const prototype: {
            };

        }

        namespace initParams {
            const prototype: {
            };

        }

        namespace jar {
            const prototype: {
            };

        }

        namespace patch {
            const prototype: {
            };

        }

        namespace post {
            const prototype: {
            };

        }

        namespace put {
            const prototype: {
            };

        }

    }

    namespace serializers {
        function form(obj: any): any;

        function json(obj: any): any;

        namespace form {
            const prototype: {
            };

        }

        namespace json {
            const prototype: {
            };

        }

    }

    namespace trim {
        const prototype: {
        };

    }

    namespace type {
        const prototype: {
        };

    }

}


