/// <reference path="../node_modules/@types/colors/index.d.ts" />
export declare namespace tracelog {
    function print(o: any): string;
    function tracelog(opt: any): (sth: any, expect: any, tmpopt: any) => boolean;
}
