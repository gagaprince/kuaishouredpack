interface IJavaRegisterObj {
    name: string;
    implements?: any[];
    superClass?: IJavaClass;
    fields?: any;
    methods?: any;
}
interface IJavaChooseCallObj {
    onMatch: (instance: IJavaInstance) => void;
    onComplete: () => void;
}
interface IJavaClass {
    get: () => void;
    $new: (...args: any[]) => IJavaInstance;
    [key?: string]: any;
}
interface IJavaInstance {
    class: IJavaClass;
    $dispose: () => void;
    [key?: string]: any;
}
interface IJava {
    use: (className: string) => any;
    cast: (instance: IJavaInstance, clazz: IJavaClass) => IJavaInstance;
    perform: (callback: () => void) => void;
    performNow: (callback: () => void) => void;
    scheduleOnMainThread: (callback: () => void) => void;
    deoptimizeEverything: () => void;
    choose: (className: string, onChoose: IJavaChooseCallObj) => void;
    registerClass: (obj: IJavaRegisterObj) => IJavaClass;
    array: (className: string, arr: Array) => any;
    isMainThread: () => boolean;
}
interface ISimpleConversationInfo {
    conversationId: Int64;
    remoteId: Int64;
    conversationName: string;
    type: number;
    fwId?: Int64;
}
interface ISimpleAntiSpamRuleInfo {
    id: Int64;
    type: number;
    name: string;
}

interface ISimpleUserInfo {
    name: string;
    remoteId: Int64;
}

declare const Java: IJava;
