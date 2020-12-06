interface IExports {
    [key?: string]: any;
}
interface IRPC {
    exports: IExports;
}
declare const rpc: IRPC;
declare const send: (msg: string) => void;
