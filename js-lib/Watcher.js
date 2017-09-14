'use strict';

const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');


class Watcher
{

    constructor()
    { let self = this;
        self._watcher = null;

        self._patterns = [];
        self._paths = [];

        self._listeners = {
            add: [],
            unlink: [],
            change: []
        };
    }

    clear()
    { let self = this;
        self.update([]);
    }

    finish()
    { let self = this;
        self._watcher.close();
    }

    getFilePaths()
    { let self = this;
        return self._paths.slice(0);
    }

    on(event_types, fn)
    { let self = this;
        if (Object.prototype.toString.call(event_types) !== '[object Array]')
            event_types = [ event_types];

        if (Object.prototype.toString.call(fn) !== '[object Function]')
            throw new Error('`fn` must be a function.');

        let i;

        for (i = 0; i < event_types.length; i++) {
            if (!(event_types[i] in self._listeners))
                throw new Error('Event `{0}` does not exist.', event_types[i]);
        }

        for (i = 0; i < event_types.length; i++)
            self._listeners[event_types[i]].push(fn);

        return self;
    }

    update(patterns)
    { let self = this;
        if (Object.prototype.toString.call(patterns) !== '[object Array]')
            patterns = [ patterns ];

        if (self._watcher !== null)
            self._watcher.close();

        self._watcher = chokidar.watch(patterns, { ignorePermissionErrors: true, })
            .on('add', function(watched_path) {
                self._paths_Add(path.resolve(watched_path));
            })
            .on('unlink', function(watched_path) {
                self._paths_Remove(path.resolve(watched_path));
            })
            .on('change', function(watched_path) {
                for (let i = 0; i < self._listeners.change.length; i++) {
                    self._listeners.change[i](path.resolve(watched_path),
                            'change');
                }
            })
            .on('ready', function() {
                self._paths_Refresh();
            });
    }


    _paths_Add(path)
    { let self = this;
        if (self._paths.indexOf(path) !== -1)
            return;

        self._paths.push(path);
        for (let i = 0; i < self._listeners.add.length; i++)
            self._listeners.add[i](path, 'add');
    }

    _paths_Refresh()
    { let self = this;
        let new_paths = [];
        let watched_paths = self._watcher.getWatched();
        for (let root_path in watched_paths) {
            let t_paths = watched_paths[root_path];
            for (let i = 0; i < t_paths.length; i++) {
                let new_path = path.join(root_path, t_paths[i]);

                if (fs.lstatSync(new_path).isFile())
                    new_paths.push(new_path);
            }
        }

        self._paths_Update(new_paths);
    }

    _paths_Remove(path)
    { let self = this;
        if (self._paths.indexOf(path) === -1)
            return;

        for (let i = 0; i < self._listeners.unlink.length; i++)
            self._listeners.add[i](path, 'unlink');
    }

    _paths_Update(paths)
    { let self = this;
        let remove_paths = [];
        let add_paths = [];

        let i;

        for (i = 0; i < self._paths.length; i++) {
            if (paths.indexOf(self._paths[i]) === -1)
                self._paths_Remove(self._paths[i]);
        }

        for (i = 0; i < paths.length; i++) {
            if (self._paths.indexOf(paths[i]) === -1)
                self._paths_Add(paths[i]);
        }
    }

}

module.exports = Watcher;
