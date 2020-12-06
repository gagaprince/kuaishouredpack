/**
 * 这里存放功能测试case
 * 因为不同于传统的测试，没有引入jest相关测试框架
 * （具体原因是不能通过jest获取任务是否成功的结果）
 * 需要人工查看case执行情况
 */

import {
    openLiveSquareActivityFace as openLiveSquareActivity,
    startRedPackTask
} from '@faces/index';

const main = async () => {
    await openLiveSquareActivity();
    setTimeout(()=>{
        startRedPackTask()
    },6000);
};
setTimeout(main);
