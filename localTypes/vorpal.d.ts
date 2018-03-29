export = vorpal;

declare class vorpal {
    constructor();

    CmdHistoryExtension(): void;

    catch(name: any, desc: any, opts: any): any;

    command(name: any, desc: any, opts: any): any;

    default(name: any, desc: any, opts: any): any;

    delimiter(str: any): any;

    exec(cmd: any, args: any, cb: any): any;

    execSync(cmd: any, options: any): any;

    exit(options: any): void;

    find(name: any): any;

    getSessionById(id: any): any;

    help(fn: any): void;

    hide(): any;

    history(id: any): any;

    historyStoragePath(path: any): any;

    hook(fn: any): any;

    localStorage(id: any): any;

    log(...args: any[]): any;

    mode(name: any, desc: any, opts: any): any;

    parse(argv: any, options: any): any;

    pipe(fn: any): any;

    prompt(...args: any[]): any;

    show(): any;

    sigint(fn: any): any;

    use(commands: any, options: any): any;

    version(version: any): any;

}

declare namespace vorpal {
    namespace prototype {
        class CmdHistoryExtension {
            constructor();

            clear(): void;

            enterMode(): void;

            exitMode(): void;

            getNextHistory(): any;

            getPreviousHistory(): any;

            newCommand(cmd: any): void;

            peek(depth: any): any;

            setId(id: any): void;

            setStoragePath(path: any): void;

        }

        const activeCommand: any;

        const domain: any;

        function addListener(type: any, listener: any): any;

        function command(name: any, desc: any, opts: any): any;

        function delimiter(str: any): any;

        function emit(type: any, ...args: any[]): any;

        function eventNames(): any;

        function exec(cmd: any, args: any, cb: any): any;

        function execSync(cmd: any, options: any): any;

        function exit(options: any): void;

        function find(name: any): any;

        function getMaxListeners(): any;

        function getSessionById(id: any): any;

        function help(fn: any): void;

        function hide(): any;

        function history(id: any): any;

        function historyStoragePath(path: any): any;

        function hook(fn: any): any;

        function listenerCount(type: any): any;

        function listeners(type: any): any;

        function localStorage(id: any): any;

        function log(...args: any[]): any;

        function mode(name: any, desc: any, opts: any): any;

        function on(type: any, listener: any): any;

        function once(type: any, listener: any): any;

        function parse(argv: any, options: any): any;

        function pipe(fn: any): any;

        function prependListener(type: any, listener: any): any;

        function prependOnceListener(type: any, listener: any): any;

        function prompt(...args: any[]): any;

        function removeAllListeners(type: any, ...args: any[]): any;

        function removeListener(type: any, listener: any): any;

        function setMaxListeners(n: any): any;

        function show(): any;

        function sigint(fn: any): any;

        function use(commands: any, options: any): any;

        function version(version: any): any;

        namespace CmdHistoryExtension {
            namespace prototype {
                function clear(): void;

                function enterMode(): void;

                function exitMode(): void;

                function getNextHistory(): any;

                function getPreviousHistory(): any;

                function newCommand(cmd: any): void;

                function peek(depth: any): any;

                function setId(id: any): void;

                function setStoragePath(path: any): void;

                namespace clear {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.clear
                    const prototype: any;

                }

                namespace enterMode {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.enterMode
                    const prototype: any;

                }

                namespace exitMode {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.exitMode
                    const prototype: any;

                }

                namespace getNextHistory {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.getNextHistory
                    const prototype: any;

                }

                namespace getPreviousHistory {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.getPreviousHistory
                    const prototype: any;

                }

                namespace newCommand {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.newCommand
                    const prototype: any;

                }

                namespace peek {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.peek
                    const prototype: any;

                }

                namespace setId {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.setId
                    const prototype: any;

                }

                namespace setStoragePath {
                    // Too-deep object hierarchy from vorpal.prototype.CmdHistoryExtension.prototype.setStoragePath
                    const prototype: any;

                }

            }

        }

        namespace addListener {
            const prototype: {
            };

        }

        namespace command {
            const prototype: {
            };

        }

        namespace delimiter {
            const prototype: {
            };

        }

        namespace emit {
            const prototype: {
            };

        }

        namespace eventNames {
            const prototype: {
            };

        }

        namespace exec {
            const prototype: {
            };

        }

        namespace execSync {
            const prototype: {
            };

        }

        namespace exit {
            const prototype: {
            };

        }

        namespace find {
            const prototype: {
            };

        }

        namespace getMaxListeners {
            const prototype: {
            };

        }

        namespace getSessionById {
            const prototype: {
            };

        }

        namespace help {
            const prototype: {
            };

        }

        namespace hide {
            const prototype: {
            };

        }

        namespace history {
            const prototype: {
            };

        }

        namespace historyStoragePath {
            const prototype: {
            };

        }

        namespace hook {
            const prototype: {
            };

        }

        namespace listenerCount {
            const prototype: {
            };

        }

        namespace listeners {
            const prototype: {
            };

        }

        namespace localStorage {
            const prototype: {
            };

        }

        namespace log {
            const prototype: {
            };

        }

        namespace mode {
            const prototype: {
            };

        }

        namespace on {
            const prototype: {
            };

        }

        namespace once {
            const prototype: {
            };

        }

        namespace parse {
            const prototype: {
            };

        }

        namespace pipe {
            const prototype: {
            };

        }

        namespace prependListener {
            const prototype: {
            };

        }

        namespace prependOnceListener {
            const prototype: {
            };

        }

        namespace prompt {
            const prototype: {
            };

        }

        namespace removeAllListeners {
            const prototype: {
            };

        }

        namespace removeListener {
            const prototype: {
            };

        }

        namespace setMaxListeners {
            const prototype: {
            };

        }

        namespace show {
            const prototype: {
            };

        }

        namespace sigint {
            const prototype: {
            };

        }

        namespace use {
            const prototype: {
            };

        }

        namespace version {
            const prototype: {
            };

        }

    }

}


