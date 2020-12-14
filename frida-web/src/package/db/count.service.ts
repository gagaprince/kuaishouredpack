import { Injectable } from '@nestjs/common';
import { DeviceService } from '../device/device.service';

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
    }

    anaysMsg(msg: string) {
        if (msg && typeof msg === 'string' && msg.startsWith('grubResult::')) {
            const msgList = msg.split('::');
            const msgData: GrubRecord = JSON.parse(msgList[1] || '{}');
            if (msgData.price > 0) {
                this.resetCount(msgData);
                countDebug('获奖，重置计数器');
            } else {
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
        if (count > 30) {
            this.resetCount(grubRecord);
            countDebug('计数器满 重启设备');
            while (await this.deviceService.restartApp(owner)) { }
        }
    }
    resetCount(grubRecord: GrubRecord) {
        this.countMap.delete(grubRecord.owner);
    }
}
