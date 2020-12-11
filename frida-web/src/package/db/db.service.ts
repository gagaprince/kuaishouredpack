import { Injectable } from '@nestjs/common';
const Mysql = require('node-mysql-promise');
import { DeviceService } from '../device/device.service';

const dbDebug = require('debug')('db.service:');

export interface GrubRecord {
    price: number;
    owner: string;
    grubTime: string | number;
    preGrubTime: number;
}

@Injectable()
export class DbService {
    mysql: any;

    constructor(private readonly deviceService: DeviceService) {
        this.mysql = Mysql.createConnection({
            host: 'gagalulu.wang',
            user: 'root',
            password: 'ilovelxh123',
            database: 'kuaishouredpack',
        });
        this.deviceService.addMessageListener((msg: string) => {
            this.anaysMsg(msg);
        });

        // test code
        // setTimeout(() => {
        //     this.anaysMsg(`grubResult::${JSON.stringify({
        //         price: 10,
        //         owner: '17701308857',
        //         grubTime: Date.now(),
        //         preGrubTime: 800
        //     })}`)
        // }, 2000);
    }

    anaysMsg(msg: string) {
        if (msg && typeof msg === 'string' && msg.startsWith('grubResult::')) {
            const msgList = msg.split('::');
            const msgData: GrubRecord = JSON.parse(msgList[1] || '{}');
            dbDebug('要插入的数据:' + JSON.stringify(msgData));
            this.addGrubRecord(msgData);
        }
    }

    formatTime(time: number, fmt: string) {
        const date = new Date();
        date.setTime(time);
        var o = {
            "M+": date.getMonth() + 1,                 //月份 
            "d+": date.getDate(),                    //日 
            "h+": date.getHours(),                   //小时 
            "m+": date.getMinutes(),                 //分 
            "s+": date.getSeconds(),                 //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds()             //毫秒 
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    addGrubRecord(data: GrubRecord) {
        if (data.price) {
            if (typeof data.grubTime !== 'string') {
                data.grubTime = this.formatTime(data.grubTime, 'yyyy-MM-dd hh:mm:ss');
            }
            return this.mysql
                .table('grub-record')
                .add(data)
                .then((insertId) => {
                    dbDebug(insertId);
                    dbDebug(JSON.stringify(data));
                })
                .catch((e) => {
                    dbDebug(e);
                });
        }
    }
}
