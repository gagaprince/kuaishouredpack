import { Injectable } from '@nestjs/common';
import { DEVICE_STATUS, IDevice } from '../device/device.service';

const adbDebug = require('debug')('adbService:');

const adb = require('adbkit');

const path = require('path');
const fs = require('fs');
const config = require('config');

@Injectable()
export class AdbService {
    adbPath: string;
    client: any;
    tmpPath: string;
    constructor() {
        this.adbPath = path.resolve(process.cwd(), config.adbPath, 'adb');
        this.client = adb.createClient({ bin: this.adbPath });
        adbDebug(`adbPath:${this.adbPath}`);
        this.initTmpPath();
    }

    initTmpPath() {
        this.tmpPath = path.resolve(process.cwd(), 'tmp');
    }

    async restartAppByDevice(device: IDevice) {
        const { ip, adbPort } = device;
        if (ip && adbPort) {
            try {
                await this.client.connect(ip, adbPort, (err, id) => {
                    adbDebug(err, id);
                });
                const devices = await this.client.listDevices();
                const adbDevice = devices.find((device) => {
                    return device.id === `${ip}:${adbPort}`;
                });

                if (adbDevice) {
                    await this.client.shell(adbDevice.id, 'am force-stop com.smile.gifmaker');
                    await this.sleep(1000);
                    await this.client.shell(adbDevice.id, 'am start -n  com.smile.gifmaker/com.yxcorp.gifshow.HomeActivity')
                    await this.sleep(10000);
                    device.status = DEVICE_STATUS.NORMAL;
                }
                // await this.client.disconnect(ip, adbPort, (err, id) => {
                //     adbDebug(err, id);
                // });
            } catch (e) {
                adbDebug(e);
            }
        }
    }

    async stopAppByDevice(device: IDevice) {
        device.status = DEVICE_STATUS.STOP;
        const { ip, adbPort } = device;
        if (ip && adbPort) {
            try {
                await this.client.connect(ip, adbPort, (err, id) => {
                    adbDebug(err, id);
                });
                const devices = await this.client.listDevices();
                const adbDevice = devices.find((device) => {
                    return device.id === `${ip}:${adbPort}`;
                });

                if (adbDevice) {
                    await this.client.shell(adbDevice.id, 'am force-stop com.smile.gifmaker');
                    await this.sleep(1000);
                    // await this.client.shell(adbDevice.id, 'am start -n  com.smile.gifmaker/com.yxcorp.gifshow.HomeActivity')
                    // await this.sleep(10000);
                }
                // await this.client.disconnect(ip, adbPort, (err, id) => {
                //     adbDebug(err, id);
                // });
            } catch (e) {
                adbDebug(e);
            }
        }
    }

    /**
     * 
     * @param device 要连接的设备
     * @param filePath 要pull文件的路径
     * @return 返回生产文件的路径
     */
    async pullFile(device: IDevice, filePath: string, md5 = 'tmp'): Promise<string> {
        const { ip, adbPort } = device;
        if (ip && adbPort) {
            try {
                await this.client.connect(ip, adbPort, (err, id) => {
                    adbDebug(err, id);
                });
                const devices = await this.client.listDevices();
                const adbDevice = devices.find((device) => {
                    return device.id === `${ip}:${adbPort}`;
                });
                if (adbDevice) {
                    const transfer = await this.client.pull(adbDevice.id, filePath);
                    return new Promise((res, rej) => {
                        const desFilePath = `${this.tmpPath}/${md5}.png`;
                        transfer.on('end', () => {
                            res(desFilePath);
                        });
                        transfer.on('error', rej);
                        transfer.pipe(fs.createWriteStream(desFilePath));
                    });
                }
            } catch (e) {
                adbDebug(e);
            }
        }
        return '';
    }


    async sleep(time: number) {
        return new Promise((res) => {
            setTimeout(() => {
                res('')
            }, time);
        });
    }
}
