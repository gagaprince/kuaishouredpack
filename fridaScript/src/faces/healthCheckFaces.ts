/**
 * 帮助检查 脚本是否正常
 */
export const checkScript = async () => {
    return new Promise((res) => {
        Java.perform(async () => {
            res({ health: true });
        });
    });
};
