'use strict';

const Watcher = require('./Watcher');


class ABWatcher {

    get Watcher() {
        return Watcher;
    }


    on(patterns, event_types, change_fn)
    {
        let watcher = new Watcher();

        watcher.on(event_types, change_fn);
        watcher.update(patterns);

        return watcher;
    }

}

module.exports = new ABWatcher();
