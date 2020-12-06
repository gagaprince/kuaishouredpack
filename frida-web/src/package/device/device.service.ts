/**
 * 设备管理服务
 */
import { Injectable } from '@nestjs/common';
import { SourceScriptService } from './sourceScript.service';
import config, { DeviceList } from './conf';
import { MinLength, Length, IsNumberString } from 'class-validator';
import { CommonException, ErrorType, ErrorCode } from '../common/exception/CommonException';
import { AdbService } from '../adb/adb.service';
const frida = require('frida');
const deviceDebug = require('debug')('device.service:');
const scriptDebug = require('debug')('frida.script.send:');

export const enum DEVICE_STATUS {
    NORMAL = 1,
    OFFLINE,
    DESTROY
}

export class IDevice {
    @Length(11, 11, { message: '手机号必须是11位' })
    @IsNumberString(null, { message: '必须全是数字' })
    phoneNumber: string;
    ip: string;
    port?: number;
    adbPort?: number;
    needListenerGroupMsg?: boolean;
    needListenerNewGroup?: boolean;
    fridaDevice?: any;
    api?: any;
    script?: any;
    session?: any;
    status?: DEVICE_STATUS
}

@Injectable()
export class DeviceService {
    private deviceMap: Map<string, IDevice>; // 当前可控的设备
    private deviceInLionMap: Map<string, IDevice>; //当前lion中配置的设备map
    private restartAppMap: Map<string, Promise<boolean>>;
    private msgListennerList: ((msg: string) => void)[];
    private reloadListennerList: ((phoneNumber: string) => void)[];
    private initDeviceFlag = false;
    // private sourceScriptService: SourceScriptService;
    /**
     * 初始化配置文件内的手机
     * @param sourceScriptService 依赖注入脚本代码服务
     */
    constructor(private sourceScriptService: SourceScriptService, private readonly adbService: AdbService) {
        this.deviceMap = new Map<string, IDevice>();
        this.deviceInLionMap = new Map<string, IDevice>();
        this.restartAppMap = new Map<string, Promise<boolean>>();
        this.msgListennerList = [];
        this.reloadListennerList = [];
        // this.initDefaultDevice();
        this.initDeviceByConf();
        this.addDeviceChangeListener();
    }
    // 添加一台设备
    async addDevice(deviceConfig: IDevice, isThrow?: boolean) {
        try {
            deviceDebug('添加一台设备：', deviceConfig);
            const device = await this.initDevice(deviceConfig, isThrow);
            if (device) {
                const { phoneNumber } = device;
                this.deviceMap.set(`${phoneNumber}`, device);
            }
        } catch (e) {
            deviceDebug('添加设备报错！');
            deviceDebug(e);
            if (isThrow) {
                throw e;
            }
        }

    }
    // 删除一台设备
    async removeDevice(device: IDevice, isThrow?: boolean) {
        try {
            deviceDebug('删除一台设备', device);
            const deviceManager = frida.getDeviceManager();
            const { script, ip, port, phoneNumber } = device;
            await script.unload().catch((e) => {
                deviceDebug(e);
                deviceDebug('执行unload js 报错');
            });
            this.deviceMap.delete(phoneNumber);
            await deviceManager.removeRemoteDevice(`${ip}:${port}`);
        } catch (e) {
            deviceDebug('删除设备报错！');
            deviceDebug(e)
            if (isThrow) {
                throw e;
            }
        }
    }
    // 获取一台设备
    getDevice(phoneNumber = 'default') {
        const device = this.deviceMap.get(phoneNumber);
        if (device && device.status === DEVICE_STATUS.NORMAL) {
            return device;
        }
    }
    getDeviceByLion(phoneNumber: string) {
        return this.deviceInLionMap.get(phoneNumber);
    }
    // reload 一台设备
    async reloadDevice(device: IDevice) {
        try {
            const { phoneNumber } = device;
            const nowDevice = this.deviceMap.get(phoneNumber);
            if (nowDevice) {
                await this.removeDevice(nowDevice, true);
            }
            await this.addDevice(device, true);
            this.reloadListennerList.forEach((reloadLis) => {
                reloadLis(phoneNumber);
            });
            return { isSuccess: true };
        } catch (e) {
            throw new CommonException(ErrorType.DEVICE_ERROR, e.message, ErrorCode.DEVICE_ERROR);
        }
    }
    // 获取所有设备基础信息
    async getDevicesInfo(): Promise<IDevice[]> {
        const devices: IDevice[] = [];
        // throw new CommonException('testException', 'test 没别的事情', ErrorCode.PARAMES_ERROR);
        this.deviceMap.forEach((device) => {
            const { phoneNumber, ip, port, adbPort, status, needListenerGroupMsg, needListenerNewGroup } = device;
            devices.push({ phoneNumber, ip, port, adbPort, status, needListenerGroupMsg, needListenerNewGroup });
        })
        return devices;
    }

    // 初始化配置文件内的设备
    async initDeviceByConf() {
        deviceDebug('initDeviceByConf');
        // 注意需要在async方法中
        // const remoteDeviceListValue = await Lion.getProperty(config.deviceKey, JSON.stringify(DeviceList));
        const remoteDeviceListValue = JSON.stringify(DeviceList);
        try {
            const remoteDeviceList = JSON.parse(remoteDeviceListValue);
            deviceDebug('远端配置：', remoteDeviceList);
            await Promise.all(remoteDeviceList.map(async (deviceConf) => {
                const { phoneNumber } = deviceConf;
                this.deviceInLionMap.set(phoneNumber, deviceConf);
                return await this.addDevice(deviceConf);
            }));
            this.initDeviceFlag = true;
            this.fireReloadList();
        } catch (e) {
            deviceDebug('获取远端配置失败或者不是标准json');
            deviceDebug(`远端配置：${remoteDeviceListValue}`);
        }
    }

    // 测试时候写的usb设备
    async initDefaultDevice(): Promise<string> {
        const defaultDevice = this.deviceMap.get('default');
        if (defaultDevice) {
            return 'defaultDevice has init';
        }
        try {
            const defaultDevice = { phoneNumber: '0', ip: 'default', status: DEVICE_STATUS.OFFLINE };
            await this.initDevice(defaultDevice);
            this.deviceMap.set('default', defaultDevice);
            return 'initDefaultDivice';
        } catch (e) {
            deviceDebug('出错了:');
            deviceDebug(e);
        }
        return 'initDefaultDevice fail';
    }

    /**
     * 初始化设备
     * 通过ip和端口添加设备
     * 注入脚本
     * 注入回调监听函数
     * device赋值
     * 返回封装后的device
     * @param device 设备基础信息
     */
    async initDevice(device: IDevice, isThrow?: boolean): Promise<IDevice> {
        const { ip, port } = device;
        let fridaDevice: any;
        if (ip == 'default') {
            fridaDevice = await frida.getUsbDevice();
        } else {
            const deviceManager = frida.getDeviceManager();
            fridaDevice = await deviceManager.addRemoteDevice(`${ip}:${port}`);
        }
        deviceDebug('获取fridaDevice');
        deviceDebug(fridaDevice);
        if (fridaDevice) {
            try {
                deviceDebug('注入frida进程');
                const session = await fridaDevice.attach('com.smile.gifmaker');
                deviceDebug('注入进程成功：com.smile.gifmaker');
                deviceDebug(session);
                const source = await this.sourceScriptService.loadFromFile();
                deviceDebug('准备js脚本成功');
                const script = await session.createScript(source);
                script.message.connect(message => {
                    if (message.type === 'send') {
                        scriptDebug(message.payload);
                        this.msgListennerList.forEach((lis) => {
                            lis && lis(message.payload);
                        });
                    }
                });
                await script.load();
                await this.sleep(3000);
                deviceDebug('加载js脚本成功');
                device.fridaDevice = fridaDevice;
                device.script = script;
                device.api = script.exports;
                device.session = session;
                device.status = DEVICE_STATUS.NORMAL;
                deviceDebug('初始化device成功');
                deviceDebug(device);
                return device;
            } catch (e) {
                deviceDebug('初始化设备报错：', device);
                deviceDebug(e);
                if (isThrow) {
                    throw e;
                }
                //throw CommonException('fridaException','注入frida进程出错')
            }
        }
        return null;
    }
    addDeviceChangeListener() {
       
    }
    getAllDevice() {
        const devices = [];
        this.deviceMap.forEach((value, key) => {
            devices.push(key);
        })
        return devices;
    }
    addMessageListener(lis: (msg: string) => void) {
        this.msgListennerList.push(lis);
    }
    fireReloadList() {
        // 将已经注册到reload中的list执行
        this.deviceMap.forEach((device) => {
            deviceDebug(device);
            const { phoneNumber } = device;
            this.reloadListennerList.forEach((reloadLis) => {
                reloadLis(phoneNumber);
            });
        });
    }
    addReloadDeviceListener(reloadLis: (phoneNumber: string) => void) {
        this.reloadListennerList.push(reloadLis);
        if (this.initDeviceFlag) {
            // 已经初始化过设备后 注册进来的监听  直接执行
            this.deviceMap.forEach((device) => {
                const { phoneNumber } = device;
                reloadLis(phoneNumber);
            })
        }
    }
    async restartApp(phoneNumber: string): Promise<boolean> {
        let restartAppIng = this.restartAppMap.get(phoneNumber);// 取得正在重启的设备
        if (restartAppIng) {
            return restartAppIng;
        }
        // 下面处理重启逻辑
        restartAppIng = this._restartApp(phoneNumber);
        this.restartAppMap.set(phoneNumber, restartAppIng);
        const ret = await restartAppIng;
        this.restartAppMap.delete(phoneNumber);
        return ret;
    }

    async _restartApp(phoneNumber: string): Promise<boolean> {
        try {
            const needRestartDevice = this.getDeviceByLion(phoneNumber);
            await this.adbService.restartAppByDevice(needRestartDevice);
            const ret = await this.reloadDevice(needRestartDevice);
            return ret.isSuccess
        } catch (e) {
            deviceDebug(e);
            deviceDebug('重启app失败，需要人工查看');
            // todo 触发报警
        }
        return false;
    }
    async sleep(time: number) {
        return new Promise((res) => {
            setTimeout(() => {
                res()
            }, time);
        });
    }
}