import { Injectable } from '@nestjs/common';
import { DeviceService, DEVICE_STATUS } from '../device/device.service';

const countDebug = require('debug')('count.service:');

export interface GrubRecord {
    price: number;
    owner: string;
    grubTime: string | number;
    preGrubTime: number;
}

@Injectable()
export class CountService {
    countMap: Map<string, number>
    constructor(private readonly deviceService: DeviceService) {
        this.countMap = new Map<string, number>();
        this.deviceService.addMessageListener((msg: string) => {
            this.anaysMsg(msg);
        });
        this.restartTask();
    }

    anaysMsg(msg: string) {
        if (msg && typeof msg === 'string' && msg.startsWith('grubResult::')) {
            const msgList = msg.split('::');
            const msgData: GrubRecord = JSON.parse(msgList[1] || '{}');
            if (msgData.price > 0) {
                this.resetCount(msgData);
                countDebug('获奖，重置计数器');
            } else {
                countDebug('未获奖,增加计数器');
                this.addCount(msgData);
            }
        }
    }

    async addCount(grubRecord: GrubRecord) {
        const { owner } = grubRecord;
        if (!this.countMap.has(owner)) {
            this.countMap.set(owner, 0);
        } else {
            this.countMap.set(owner, this.countMap.get(owner) + 1);
        }
        const count = this.countMap.get(owner);
        countDebug(`当前设备:${owner}--count:${count}`);
        if (count > 30) {
            this.resetCount(grubRecord);
            countDebug('计数器满 重启设备');
            while (true) {
                const flag = await this.deviceService.restartApp(owner)
                if (flag) {
                    break;
                }
            }
        }
    }
    resetCount(grubRecord: GrubRecord) {
        this.countMap.delete(grubRecord.owner);
    }

    restartTask() {// 定时重启任务
        setInterval(async () => {
            const devices = this.deviceService.getAllDevice();
            for (let i = 0; i < devices.length; i++) {
                const owner = devices[i];
                this.countMap.delete(owner);
                const device = this.deviceService.getDeviceByLion(owner);
                if(device.status!=DEVICE_STATUS.STOP){
                    while (true) {
                        const flag = await this.deviceService.restartApp(owner)
                        if (flag) {
                            break;
                        }
                    }
                } 
            }
        }, 30 * 60 * 1000);
    }
}
