import { sendWrap as send } from '@utils/commonUtil';
export const cast = (instance: IJavaInstance, className: string): IJavaInstance => {
    const MyClass = Java.use(className);
    return Java.cast(instance, MyClass as IJavaClass);
};

export const scheduleOnMainThread = (callback: () => void): void => {
    if (Java.isMainThread()) {
        callback();
    } else {
        Java.scheduleOnMainThread(function () {
            callback();
        });
    }
};

export const choose = (className: string): Promise<IJavaInstance> => {
    send(`Java.choose:查找类 ${className} 的实例`);
    return new Promise((res) => {
        let isFinded = false;
        Java.choose(className, {
            onMatch: (instance) => {
                send(`Java.choose:找到实例:${instance}`);
                if (!isFinded) {
                    res(instance);
                    isFinded = true;
                }
            },
            onComplete: () => {
                //
                send('Java.choose:查找完毕');
            },
        });
    });
};

export const getPropertyInstance = (instance: IJavaInstance, fieldName: string, fieldClass: string) => {
    try {
        const field = cast(instance.getClass(), 'java.lang.Class').getDeclaredField(fieldName);
        field.setAccessible(true); // 防止是private 成员
        const fieldInstance = cast(field.get(instance), fieldClass); // field.get 拿到的是一个object 需要强转成目标类
        return fieldInstance;
    } catch (error) {
        console.log(error);
    }
    return null;
};

export const setPropertyToInstance = (instance: IJavaInstance, fieldName: string, value: any) => {
    try {
        const field = cast(instance.getClass(), 'java.lang.Class').getDeclaredField(fieldName);
        field.setAccessible(true); // 防止是private 成员
        field.set(instance, value);
    } catch (error) {
        console.log(error);
    }
};
export const IntegerInvoke = (num: number) => {
    const Integer = Java.use('java.lang.Integer');
    return Integer.$new(num);
};

export const findInstance = (
    className: string,
    onMatch?: (instance: IJavaInstance) => void,
    onComplete?: () => void,
) => {
    Java.choose(className, {
        onMatch: function (instance) {
            onMatch && onMatch(instance);
        },
        onComplete: function () {
            onComplete && onComplete();
        },
    });
};

export const makeCallback = (
    name: string,
    javaInterfaceClass: string,
    methods: { [key: string]: (...args: any[]) => void },
): IJavaInstance => {
    const Interface = Java.use(javaInterfaceClass);
    const cb = Java.registerClass({
        name,
        implements: [Interface],
        methods,
    }).$new();
    return cb;
};
