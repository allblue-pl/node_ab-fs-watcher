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

    on(eventTypes, fn)
    {
        if (Object.prototype.toString.call(eventTypes) !== '[object Array]')
            eventTypes = [ eventTypes];

        if (Object.prototype.toString.call(fn) !== '[object Function]')
            throw new Error('`fn` must be a function.');

        let i;

        for (i = 0; i < eventTypes.length; i++) {
            if (!(eventTypes[i] in this._listeners))
                throw new Error(`Event \`${eventTypes[i]}\` does not exist.`);
        }

        for (i = 0; i < eventTypes.length; i++)
            this._listeners[eventTypes[i]].push(fn);

        if (this._patterns.length > 0)
            this.update(this._patterns);

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
            { ignorePermissionErrors: true, });

        if ('add' in this._listeners) {
            this._watcher
                .on('add', (fsPath) => {
                    if (!this._patterns_Matches(this._patterns, fsPath))
                        return;

                    this._fsPaths_Add(path.resolve(fsPath));
                })
                .on('addDir', (fsPath) => {
                    if (!this._patterns_Matches(this._patterns, fsPath))
                        return;

                    this._fsPaths_Add(path.resolve(fsPath));
                });
        }
            
        if ('unlink' in this._listeners) {
            this._watcher
                .on('unlink', (fsPath) => {
                    if (!this._patterns_Matches(this._patterns, fsPath))
                        return;
                    
                    this._fsPaths_Remove(path.resolve(fsPath));
                })
                .on('unlinkDir', (fsPath) => {
                    if (!this._patterns_Matches(this._patterns, fsPath))
                        return;

                    this._fsPaths_Remove(path.resolve(fsPath));
                });
        }

        if ('change' in this._listeners) {
            this._watcher
                .on('change', (fsPath) => {
                    if (!this._patterns_Matches(this._patterns, fsPath))
                        return;

                    for (let i = 0; i < this._listeners.change.length; i++) {
                        this._listeners.change[i](path.resolve(fsPath),
                                'change');
                    }
                });
        }

        // this._watcher
        //     .on('ready', () => {
        //         this._fsPaths_Refresh();
        //     });
    }


    _fsPath_Exists(fsPath)
    {
        for (let i = 0; i < this._fsPaths.length; i++) {
            let pattern_fsPaths = this._fsPaths[i];
            if (pattern_fsPaths.includes(fsPath))
                return i;
        }

        return -1;
    }

    _fsPath_Remove(fsPath)
    {
        for (let i = 0; i < this._fsPaths.length; i++) {

            let pattern_fsPaths = this._fsPaths[i];
            if (pattern_fsPaths.includes(fsPath))
                return i;
        }

        return -1;
    }

    _fsPaths_Add(fsPath)
    {
        if (this._fsPaths.includes(fsPath))
            return;

        this._fsPaths.push(fsPath);

        for (let i = 0; i < this._listeners.add.length; i++)
            this._listeners.add[i](fsPath, 'add');
    }

    _fsPaths_Get()
    {
        let pattern_fsPaths_array = this._patterns.map(() => []);

        for (let fsPath of this._fsPaths) {
            for (let i = 0; i < this._patterns.length; i++) {
                if (this._patterns[i].matches(fsPath)) {
                    pattern_fsPaths_array[i].push(fsPath);
                    break;
                }
            }
        }

        let fsPaths = [];
        for (let pattern_fsPaths of pattern_fsPaths_array)
            fsPaths = fsPaths.concat(pattern_fsPaths.sort());

        return fsPaths;
    }

    _fsPaths_Refresh()
    {
        let newPaths = [];
        let fsPaths = this._watcher.getWatched();
        for (let rootPath in fsPaths) {
            let tPaths = fsPaths[rootPath];
            for (let i = 0; i < tPaths.length; i++) {
                let newPath = path.join(rootPath, tPaths[i]);
                
                if (!anymatch(this._patterns, newPath))
                    continue;
                        
                newPaths.push(newPath);
            }
        }

        this._fsPaths_Update(newPaths);
    }

    _fsPaths_Remove(fsPath)
    {
        let path_index = this._fsPaths.indexOf(fsPath);
        if (path_index === -1)
            return;

        this._fsPaths.splice(path_index, 1);

        for (let i = 0; i < this._listeners.unlink.length; i++)
            this._listeners.add[i](fsPath, 'unlink');
    }

    _fsPaths_Update(fsPaths)
    {
        let removePaths = [];
        let addPaths = [];

        let i;

        for (i = 0; i < this._fsPaths.length; i++) {
            if (fsPaths.indexOf(this._fsPaths[i]) === -1) {
                this._fsPaths_Remove(this._fsPaths[i]);
            }
        }

        for (i = 0; i < fsPaths.length; i++) {
            if (this._fsPaths.indexOf(fsPaths[i]) === -1) {
                this._fsPaths_Add(fsPaths[i]);
            }
        }
    }

    _patterns_GetWatched()
    {
        let watchedPatterns = [];
        for (let pattern of this._patterns)
            watchedPatterns = watchedPatterns.concat(pattern.getWatchedPatterns());

        return watchedPatterns;
    }

    _patterns_Matches(patterns, fsPath)
    {
        for (let pattern of patterns) {
            if (pattern.matches(fsPath))
                return true;
        }

        return false;
    }

    _patterns_Update(fsPatterns)
    {
        this._patterns = fsPatterns.map(item => new Watcher.Pattern(item));
    }

}
module.exports = Watcher;
require('./Watcher.Pattern');
