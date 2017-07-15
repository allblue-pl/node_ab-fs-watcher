'use strict';

const Watcher = require('./Watcher');


class ABWatcher {

    get Watcher() {
        return Watcher;
    }


    constructor()
    {

    }

    getFilePaths(patterns)
    {
        let watcher = new Watcher();

        console.log(patterns);
        watcher.update(patterns);
        let file_paths = watcher.getFilePaths();
        watcher.finish();

        return file_paths;
    }

    on(patterns, event_types, change_fn)
    {
        let watcher = new Watcher();

        watcher.on(event_types, change_fn);
        watcher.update(patterns);

        return watcher;
    }

}

module.exports = ABWatcher;
