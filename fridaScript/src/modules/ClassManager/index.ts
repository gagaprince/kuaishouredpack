/**
 * java对象管理工具
 * Java.choose 是一个比较耗时的操作，所以可以将结果缓存供下次使用
 * 单例模式
 */
import { choose } from '@utils/javaUtils';
import { sendWrap as send } from '@utils/commonUtil';
export default class ClassManager {
    static getInstance() {
        if (!this.instance) {
            this.instance = new ClassManager();
        }
        return this.instance;
    }
    private constructor() {
        //
    }
    private classMap: Map<string, IJavaInstance> = new Map<string, IJavaInstance>();
    private static instance: ClassManager;

    registerInstance(className: string, ins: IJavaInstance) {
        // this.classMap[className] = ins;
        this.classMap.set(className, ins);
    }

    findInstanceForJavaClass(className: string): Promise<IJavaInstance> {
        // const ins = this.classMap[className];
        const ins = this.classMap.get(className);
        if (!ins) {
            send(`classManager.findInstanceForJavaClass:当前classManager中不含 ${className} 的实例 下面去查找`);
            return choose(className).then((instance: IJavaInstance) => {
                Java.perform(() => {
                    send(`classManager.findInstanceForJavaClass: 找到 ${className} 的实例: ${instance}`);
                    this.registerInstance(className, instance);
                });
                return instance;
            });
        } else {
            send(`classManager.findInstanceForJavaClass:找到classManager中的缓存实例：${ins}`);
            return Promise.resolve(ins);
        }
    }
    clearInstance(className: string) {
        this.classMap.delete(className);
    }
    clearAll() {
        this.classMap.clear();
    }
}
