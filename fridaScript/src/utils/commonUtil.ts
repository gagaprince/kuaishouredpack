export const sleep = async (time: number) => {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, time);
    });
};

const utf16toEntities = function (str: string) {
    // 检测utf16字符正则
    const patt = /[\ud800-\udbff][\udc00-\udfff]/g;
    return str.replace(patt, function (char) {
        let H, L, code;
        if (char.length === 2) {
            H = char.charCodeAt(0); // 取出高位
            L = char.charCodeAt(1); // 取出低位
            code = (H - 0xd800) * 0x400 + 0x10000 + L - 0xdc00; // 转换算法
            return '&#' + code + ';';
        } else {
            return char;
        }
    });
};

/**
 * 关于 trace 这种实现不科学 因为并发会混乱 暂时先这么实现 以后再想怎么改造
 */
let traceId: string | number = Date.now();
export const sendWrap = function (msg: string) {
    send(`${traceId}----${utf16toEntities(msg)}`);
};
sendWrap.update = () => {
    traceId = Date.now();
};
sendWrap.setTraceId = (_traceId: string) => {
    traceId = _traceId;
};
sendWrap.getTraceId = () => {
    return traceId;
};
