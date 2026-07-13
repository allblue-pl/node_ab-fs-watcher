declare module "anymatch" {
    const anymatchFn: (matchers: Array<string>, testString: string) => boolean;
    
    export default anymatchFn;
}