import {
    openLiveSquareActivityFace as openLiveSquareActivity,
    startRedPackTask
} from '@faces/index';

/**
 * 进入主程后 初始化的操作
 * 屏蔽掉上报接口
 */
const main = () => {
    Java.perform(async function () {
        // initGroup();
        await openLiveSquareActivity();
        setTimeout(()=>{
            startRedPackTask()
        },6000);
    });
};
setTimeout(main); // 异步切入

rpc.exports = {
    openLiveSquareActivity,
    startRedPackTask
};
