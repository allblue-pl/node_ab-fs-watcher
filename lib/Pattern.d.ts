export default class Pattern {
    #private;
    get depth(): number;
    get fsPattern(): string;
    get watchedPattern(): string;
    constructor(fsPattern: string);
    matches(fsMatch: string): boolean;
    matchesDir(fsMatch: string): boolean;
}
//# sourceMappingURL=Pattern.d.ts.map