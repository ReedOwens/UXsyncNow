import * as chokidar from 'chokidar'

export class Watcher {
    private static singleton: Watcher = null;
    private watcher: any;

    constructor(persist = true) {
        this.watcher = chokidar.watch('', {persistent: persist});
    };

    set onChange(value: any) {
        this.watcher.on('change', value);
    }

    static getWatcher(): Watcher {
        if (Watcher.singleton === null) {
            Watcher.singleton = new Watcher();
        }
        return Watcher.singleton;
    }

    add(file: string) {
        this.watcher.add(file);
    }

    remove(file: string) {
        this.watcher.unwatch(file);
    }

    close() {
        this.watcher.close();
    }
}