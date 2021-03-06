let whoami = '';
export const startRedPackTask = (phoneNumber: string) => {
    whoami = phoneNumber;
    Java.perform(() => {
        openGiftPack();
        findLiveFellowRedPacketFloatView();
        hookRedPacketResult();
        hookAndOpenResultList();
    });
}

const getRect = (view: any) => {
    const Rect = Java.use('android.graphics.Rect');
    const rect = Rect.$new();
    view.getGlobalVisibleRect(rect);
    return rect;
}

let slidePlayViewPager: any;
const slideNextpage = () => {
    Java.perform(function () {
        function goNext() {
            if (slidePlayViewPager.hasMore()) {
                Java.scheduleOnMainThread(function () {
                    slidePlayViewPager.d(true);
                });
            }
        }
        if (slidePlayViewPager) {
            goNext();
        } else {
            Java.choose('com.yxcorp.plugin.live.widget.LiveSlideViewPager', {
                onMatch: function (instance) {
                    send(instance + '');
                    send('找到LiveSlideViewPager');
                    slidePlayViewPager = instance;
                    goNext();
                },
                onComplete: function () {
                    send('查找LiveSlideViewPager完毕')
                }
            });
        }
    });
}

const findLiveFellowRedPacketFloatView = () => {
    var openNum = 0;
    Java.choose('com.kuaishou.live.core.show.redpacket.fellowredpacket.widget.LiveFellowRedPacketFloatView', {
        onMatch: function (instance) {
            send('找到 LiveFellowRedPacketFloatView');
            send("红包信息:" + instance.getRedPackInfo());
            send("倒计时:" + instance.g.values);
            const rect = getRect(instance);
            const top = rect.top.value;
            const bottom = rect.bottom.value;
            if (instance.getRedPackInfo() != null && instance.isShown() && top > 0 && bottom < 2200) {
                try {
                    instance.j.value.a(instance.getRedPackInfo());
                    openNum += 1;
                } catch (e) {
                    send(e);
                }
            }
        },
        onComplete: function () {
            send('当前时间:' + Date.now());
            if (openNum == 0) {
                send('当前直播间没有红包了，换个直播间吧！');
                slideNextpage();
                setTimeout(function () {
                    Java.perform(function () {
                        findLiveFellowRedPacketFloatView();
                    });
                }, 6000);
            }
        }
    })
}

let stepTime = 800;
let gloabDialogFragment: any;
const startOpenPack = (LiveRedPacketSnatchDialogFragment: IJavaInstance, isFromDialog?: boolean) => {
    if (LiveRedPacketSnatchDialogFragment.x.value == 1) {
        const time = LiveRedPacketSnatchDialogFragment.w.value.d();
        // send("time:"+time);
        // send("packId:"+LiveRedPacketSnatchDialogFragment.w.value.j())
        var delay = time - 5000;
        if (delay < 0) {
            delay = 5;
        }
        if (time > stepTime) {
            setTimeout(function () {
                Java.perform(function () {
                    startOpenPack(LiveRedPacketSnatchDialogFragment, true);
                });
            }, delay);
        } else {
            gloabDialogFragment = LiveRedPacketSnatchDialogFragment;
            LiveRedPacketSnatchDialogFragment.Y2();
            setTimeout(function () {
                Java.perform(function () {
                    LiveRedPacketSnatchDialogFragment.dismissAllowingStateLoss();
                    findLiveFellowRedPacketFloatView();
                });
            }, 6000)
        }
    } else if (isFromDialog) { // 是从x=1来的 x突然不等1 说明要么dialog被关掉了，要么直播被关掉了，要么红包已经被拆了
        // 这种情况下 都需要隔断时间开始下一次循环 暂时定为1分钟
        setTimeout(function () {
            Java.perform(function () {
                findLiveFellowRedPacketFloatView();
            });
        }, 60000)
    }
}

const scanDialog = () => {
    Java.choose('com.kuaishou.live.core.show.redpacket.snatch.LiveRedPacketSnatchDialogFragment', {
        onMatch: function (instance) {
            send('找到 LiveRedPacketSnatchDialogFragment');
            startOpenPack(instance);
        },
        onComplete: function () {
            send('找到LiveRedPacketSnatchDialogFragment完毕');
        }
    })
}

const openGiftPack = () => {
    const hongBaoService = Java.use('j.c.a.a.a.g2.a0.h0');
    hongBaoService.a.overload('j.c.a.a.a.g2.a0.r0.d').implementation = function () {
        send("有红包打开，重新扫描dialog！");
        // printStack();
        setTimeout(function () {
            Java.perform(function () {
                scanDialog();
            })
        }, 1000);
        return this.a.apply(this, arguments);
    }
}


let giftData: any = {};
const hookRedPacketResult = () => {
    const manager = Java.use('j.c.a.a.a.g2.a0.o0');
    manager.a.overload('java.lang.String', 'j.c.a.a.a.g2.a0.r0.e').implementation = function () {
        send('grab result');
        // printStack();
        send(JSON.stringify(arguments));
        const ret = arguments[1];
        send('是否抢到红包:' + ret.mIsGrabbed.value);
        send('礼物列表:' + ret.mGiftList.value.size());
        if (ret.mIsGrabbed.value) {
            send('礼物价值:' + ret.mDisplayTotalCoin.value);
            var timeList = giftData[ret.mDisplayTotalCoin.value];
            if (!timeList) {
                timeList = [];
                giftData[ret.mDisplayTotalCoin.value] = timeList;
            }
            timeList.push(stepTime);
            // 发送获奖消息
        }
        send(`grubResult::${JSON.stringify({
            price: ret.mDisplayTotalCoin.value,
            preGrubTime: stepTime,
            owner: whoami,
            grubTime: Date.now()
        })}`)
        send(JSON.stringify(giftData));
        return this.a.apply(this, arguments);
    }

    const LiveFellowRedPacketLuckyUsersResponse = Java.use('com.kuaishou.live.core.show.redpacket.fellowredpacket.model.LiveFellowRedPacketLuckyUsersResponse');
    LiveFellowRedPacketLuckyUsersResponse.getItems.implementation = function () {
        const list = this.getItems.apply(this, arguments);
        send('size:' + list.size());
        if (list.size() > 24) {
            stepTime += 5;
            send('红包慢了，stepTime+5:' + stepTime);
        } else {
            stepTime -= 5;
            send('红包快了，stepTime-5:' + stepTime);
        }
        return list;
    }
}

const hookAndOpenResultList = () => {
    const i1 = Java.use('j.c.a.a.a.k1.n1.k0.i1');
    i1.a.overload('com.kuaishou.client.log.content.packages.nano.ClientContent$LiveStreamPackage', 'j.c.a.a.a.g2.a0.r0.d', 'j.c.a.a.a.g2.a0.r0.e', 'int').implementation = function () {
        if (arguments[3] == 8) {
            const ret = this.a.apply(this, arguments);
            if (gloabDialogFragment) {
                setTimeout(function () {
                    Java.perform(function () {
                        send('x:' + gloabDialogFragment.x.value);
                        Java.scheduleOnMainThread(function () {
                            gloabDialogFragment.B.value.n();
                        });
                    });
                }, 500);
            }
            return ret;
        } else {
            return this.a.apply(this, arguments);
        }
    }
}