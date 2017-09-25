'use strict';

const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');


class Watcher
{

    constructor()
    {
        this._watcher = null;

        this._patterns = [];
        this._fsPaths = [];

        this._listeners = {
            add: [],
            unlink: [],
            change: []
        };
    }

    clear()
    {
        this.update([]);
    }

    finish()
    {
        this._watcher.close();
    }

    getFSPaths()
    {
        return this._fsPaths_Get();
    }

    on(event_types, fn)
    {
        if (Object.prototype.toString.call(event_types) !== '[object Array]')
            event_types = [ event_types];

        if (Object.prototype.toString.call(fn) !== '[object Function]')
            throw new Error('`fn` must be a function.');

        let i;

        for (i = 0; i < event_types.length; i++) {
            if (!(event_types[i] in this._listeners))
                throw new Error(`Event \`${event_types[i]}\` does not exist.`);
        }

        for (i = 0; i < event_types.length; i++)
            this._listeners[event_types[i]].push(fn);

        return this;
    }

    update(patterns)
    {
        if (Object.prototype.toString.call(patterns) !== '[object Array]')
            patterns = [ patterns ];

        if (this._watcher !== null)
            this._watcher.close();

        this._patterns_Update(patterns);

        this._watcher = chokidar.watch(this._patterns_GetWatched(),
                { ignorePermissionErrors: true, })
            .on('add', (fs_path) => {
                this._fsPaths_Add(path.resolve(fs_path));
            })
            .on('unlink', (fs_path) => {
                this._fsPaths_Remove(path.resolve(fs_path));
            })
            .on('change', (fs_path) => {
                for (let i = 0; i < this._listeners.change.length; i++) {
                    this._listeners.change[i](path.resolve(fs_path),
                            'change');
                }
            })
            .on('ready', () => {
                this._fsPaths_Refresh();
            });
    }


    _fsPath_Exists(fs_path)
    {
        for (let i = 0; i < this._fsPaths.length; i++) {
            let pattern_fs_paths = this._fsPaths[i];
            if (pattern_fs_paths.includes(fs_path))
                return i;
        }

        return -1;
    }

    _fsPath_Remove(fs_path)
    {
        for (let i = 0; i < this._fsPaths.length; i++) {

            let pattern_fs_paths = this._fsPaths[i];
            if (pattern_fs_paths.includes(fs_path))
                return i;
        }

        return -1;
    }

    _fsPaths_Add(fs_path)
    {
        if (this._fsPaths.includes(fs_path))
            return;

        this._fsPaths.push(fs_path);

        for (let i = 0; i < this._listeners.add.length; i++)
            this._listeners.add[i](path, 'add');
    }

    _fsPaths_Get()
    {
        let pattern_fs_paths_array = this._patterns.map(() => []);

        for (let fs_path of this._fsPaths) {
            for (let i = 0; i < this._patterns.length; i++) {
                if (this._patterns[i].matches(fs_path)) {
                    pattern_fs_paths_array[i].push(fs_path);
                    break;
                }
            }
        }

        let fs_paths = [];
        for (let pattern_fs_paths of pattern_fs_paths_array)
            fs_paths = fs_paths.concat(pattern_fs_paths.sort());

        return fs_paths;
    }

    _fsPaths_Refresh()
    {
        let new_paths = [];
        let fs_paths = this._watcher.getWatched();
        for (let root_path in fs_paths) {
            let t_paths = fs_paths[root_path];
            for (let i = 0; i < t_paths.length; i++) {
                let new_path = path.join(root_path, t_paths[i]);

                if (fs.lstatSync(new_path).isFile())
                    new_paths.push(new_path);
            }
        }

        this._fsPaths_Update(new_paths);
    }

    _fsPaths_Remove(path)
    {
        let path_index = this._fsPaths.indexOf(path);
        if (path_index === -1)
            return;

        this._fsPaths.splice(path_index, 1);

        for (let i = 0; i < this._listeners.unlink.length; i++)
            this._listeners.add[i](path, 'unlink');
    }

    _fsPaths_Update(paths)
    {
        let remove_paths = [];
        let add_paths = [];

        let i;

        for (i = 0; i < this._fsPaths.length; i++) {
            if (paths.indexOf(this._fsPaths[i]) === -1) {
                this._fsPaths_Remove(this._fsPaths[i]);
            }
        }

        for (i = 0; i < paths.length; i++) {
            if (this._fsPaths.indexOf(paths[i]) === -1) {
                this._fsPaths_Add(paths[i]);
            }
        }
    }

    _patterns_GetWatched()
    {
        let watched_patterns = [];
        for (let pattern of this._patterns)
            watched_patterns = watched_patterns.concat(pattern.getWatchedPatterns());

        return watched_patterns;
    }

    _patterns_Update(fs_patterns)
    {
        this._patterns = fs_patterns.map(item => new Watcher.Pattern(item));
    }

}
module.exports = Watcher;
require('./Watcher.Pattern');
