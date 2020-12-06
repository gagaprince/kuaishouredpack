/**
 * 提供给frida-web调用的接口
 */

export * from './healthCheckFaces';

import {openLiveSquareActivity} from '@modules/kuaishou/openPage';

export const openLiveSquareActivityFace = ()=>{
    return new Promise((res,rej)=>{
        Java.perform(async ()=>{
            const ret = await openLiveSquareActivity();
            res(ret);
        });
    });
}

export * from '@modules/kuaishou/redpackTask';