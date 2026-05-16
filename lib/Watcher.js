import fs from "node:fs";
import path from "node:path";
import chokidar, { FSWatcher } from "chokidar";
import Pattern from "./Pattern.js";
export default class Watcher {
    #watcher;
    #patterns;
    #fsPaths;
    #listeners;
    constructor() {
        this.#watcher = null;
        this.#patterns = [];
        this.#fsPaths = [];
        this.#listeners = {
            add: [],
            unlink: [],
            change: []
        };
    }
    clear() {
        this.update([]);
    }
    finish() {
        if (this.#watcher !== null)
            this.#watcher.close();
    }
    getFSPaths() {
        return this.#fsPaths_Get();
    }
    getFSPatterns() {
        let fsPatterns = [];
        for (let pattern of this.#patterns)
            fsPatterns.push(pattern.fsPattern);
        return fsPatterns;
    }
    on(eventTypes, fn) {
        let i;
        for (i = 0; i < eventTypes.length; i++) {
            if (!(eventTypes[i] in this.#listeners))
                throw new Error(`Event \`${eventTypes[i]}\` does not exist.`);
        }
        for (i = 0; i < eventTypes.length; i++)
            this.#listeners[eventTypes[i]].push(fn);
        if (this.#patterns.length > 0)
            this.update(this.#patterns_GetFSPatterns());
        return this;
    }
    update(patterns) {
        this.finish();
        this.#patterns_Update(patterns);
        let watchedPatterns = this.#patterns_GetWatchedPatterns();
        this.#watcher = chokidar.watch(watchedPatterns, {
            ignorePermissionErrors: true,
            ignored: (fsPath) => !this.#patterns_MatchesDir(this.#patterns, fsPath)
        });
        if ('add' in this.#listeners) {
            this.#watcher
                .on('add', (fsPath) => {
                if (!this.#patterns_Matches(this.#patterns, fsPath))
                    return;
                this.#fsPaths_Add(path.resolve(fsPath));
            })
                .on('addDir', (fsPath) => {
                if (!this.#patterns_Matches(this.#patterns, fsPath))
                    return;
                this.#fsPaths_Add(path.resolve(fsPath));
            });
        }
        if ('unlink' in this.#listeners) {
            this.#watcher
                .on('unlink', (fsPath) => {
                if (!this.#patterns_Matches(this.#patterns, fsPath))
                    return;
                this.#fsPaths_Remove(path.resolve(fsPath));
            })
                .on('unlinkDir', (fsPath) => {
                if (!this.#patterns_Matches(this.#patterns, fsPath))
                    return;
                this.#fsPaths_Remove(path.resolve(fsPath));
            });
        }
        if ('change' in this.#listeners) {
            this.#watcher
                .on('change', (fsPath) => {
                if (!this.#patterns_Matches(this.#patterns, fsPath))
                    return;
                for (let i = 0; i < this.#listeners.change.length; i++) {
                    this.#listeners.change[i](path.resolve(fsPath), 'change');
                }
            });
        }
        // this._watcher
        //     .on('ready', () => {
        //         this._fsPaths_Refresh();
        //     });
    }
    #fsPath_Exists(fsPath) {
        for (let i = 0; i < this.#fsPaths.length; i++) {
            let pattern_fsPaths = this.#fsPaths[i];
            if (pattern_fsPaths.includes(fsPath))
                return i;
        }
        return -1;
    }
    #fsPath_Remove(fsPath) {
        for (let i = 0; i < this.#fsPaths.length; i++) {
            let pattern_fsPaths = this.#fsPaths[i];
            if (pattern_fsPaths.includes(fsPath))
                return i;
        }
        return -1;
    }
    #fsPaths_Add(fsPath) {
        if (this.#fsPaths.includes(fsPath))
            return;
        this.#fsPaths.push(fsPath);
        for (let i = 0; i < this.#listeners.add.length; i++)
            this.#listeners.add[i](fsPath, 'add');
    }
    #fsPaths_Get() {
        let pattern_fsPaths_array = this.#patterns.map(() => []);
        for (let fsPath of this.#fsPaths) {
            for (let i = 0; i < this.#patterns.length; i++) {
                if (this.#patterns[i].matches(fsPath)) {
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
    // #fsPaths_Refresh() {
    //     if (this.#watcher === null)
    //         return;
    //     let newPaths = [];
    //     let fsPaths = this.#watcher.getWatched();
    //     for (let rootPath in fsPaths) {
    //         let tPaths = fsPaths[rootPath];
    //         for (let i = 0; i < tPaths.length; i++) {
    //             let newPath = path.join(rootPath, tPaths[i]);
    //             if (!anymatch(this.#patterns, newPath))
    //                 continue;
    //             newPaths.push(newPath);
    //         }
    //     }
    //     this.#fsPaths_Update(newPaths);
    // }
    #fsPaths_Remove(fsPath) {
        let path_index = this.#fsPaths.indexOf(fsPath);
        if (path_index === -1)
            return;
        this.#fsPaths.splice(path_index, 1);
        for (let i = 0; i < this.#listeners.unlink.length; i++)
            this.#listeners.add[i](fsPath, 'unlink');
    }
    // #fsPaths_Update(fsPaths: Array<string>) {
    //     let removePaths = [];
    //     let addPaths = [];
    //     let i;
    //     for (i = 0; i < this.#fsPaths.length; i++) {
    //         if (fsPaths.indexOf(this.#fsPaths[i]) === -1) {
    //             this.#fsPaths_Remove(this.#fsPaths[i]);
    //         }
    //     }
    //     for (i = 0; i < fsPaths.length; i++) {
    //         if (this.#fsPaths.indexOf(fsPaths[i]) === -1) {
    //             this.#fsPaths_Add(fsPaths[i]);
    //         }
    //     }
    // }
    #patterns_GetFSPatterns() {
        let fsPatterns = [];
        for (let pattern of this.#patterns)
            fsPatterns.push(pattern.fsPattern);
        return fsPatterns;
    }
    #patterns_GetWatchedPatterns() {
        let watchedPatterns = [];
        for (let pattern of this.#patterns) {
            if (!watchedPatterns.includes(pattern.watchedPattern))
                watchedPatterns.push(pattern.watchedPattern);
        }
        return watchedPatterns;
    }
    #patterns_Matches(patterns, fsPath) {
        for (let pattern of patterns) {
            if (pattern.matches(fsPath.replace(/\\/g, "/")))
                return true;
        }
        return false;
    }
    #patterns_MatchesDir(patterns, fsPath) {
        for (let pattern of patterns) {
            if (pattern.matchesDir(fsPath))
                return true;
        }
        return false;
    }
    #patterns_Update(fsPatterns) {
        // let patterns: Array<Pattern> = [];
        // for (let fsPattern_New of fsPatterns) {
        //     let patternExists = false;
        //     for (let pattern of patterns) {
        //         if (pattern.hasWatchedPattern(fsPattern_New)) {
        //             patternExists = true;
        //             break;
        //         }
        //     }
        //     if (!patternExists)
        //         patterns.push(new Pattern(fsPattern_New));
        // }
        // this.#patterns = patterns;
        this.#patterns = fsPatterns.map((item) => new Pattern(item));
    }
}
