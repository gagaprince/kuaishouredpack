import { IDevice, DEVICE_STATUS } from "./device.service";
export const DeviceList: IDevice[] = [{
    phoneNumber: '17701308857',
    ip: 'gagalulu.wang',
    port: 12346,
    adbPort:12345,
    status: DEVICE_STATUS.OFFLINE
},{
    phoneNumber: '17601015566',
    ip: 'gagalulu.wang',
    port: 12348,
    adbPort:12347,
    status: DEVICE_STATUS.OFFLINE
}];

export default {
    deviceKey: ''
}