// comprehensiveTest.js

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bleRecvStr:"",
        timerId:0,
        testButtonText: '开始测试',
        buttonType: 'primary', 
        progressValue:0,
        onTesting:false,
        testCount:10,
        testTimes:0,
        attachTime:[],
        rssi:[],
        snr:[],
        pingDelay:[],
        canvasLabels: [],
        registerAvrTimes:0,
        registerMaxTimes:0,
        registerMinTimes:0,
        registerSuccessRate:0,
        rssiAvr:0,
        rssiMin:0,
        rssiMax:0,
        rssiSuccessRate:0,
        snrAvr:0,
        snrMin:0,
        snrMax:0,
        pingAvr:0,
        pingMin:0,
        pingMax:0,
        pingSuccessRate:0,
    },

    /**
     * 返回主页
     */
    backHomePage: function () {
        // 回到主页面
        wx.redirectTo({
            url: '../index/index',
        })
    },

    

    /**
     * 测试按钮回调
     */
    onTestButtonClicked: function() {
        var that = this;
        if (!that.data.onTesting) {
            that.setData({
                onTesting: true,
                testButtonText: "停止测试",
                buttonType: "warn",
                testTimes: that.data.testCount,
                attachTime:[],
                pingDelay:[],
                rssi:[],
                snr:[],
                canvasLabels:[],
                progressValue:0,
            })
            /** 发送综合测试指令 */
            util.cm_ble_write("<Request>comprehensiveTest</Request>");
            that.data.timerId = setInterval(
                function () {
                    util.cm_ble_write("<Request>comprehensiveTest</Request>");
                }, 150 * 1000
            )
        }
        else {
            that.setData({
                onTesting: false,
                testButtonText: "开始测试",
                buttonType: "primary",
                testTimes:0,
                progressValue:0,
            })
            clearInterval(that.data.timerId);
        }
    },

    /**
     * 次数调整回调
     */
    onTestTimeChange: function(e) {
        this.setData({
            testCount: e.detail.value,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '综合测试'
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        var that = this;
        if (!app.globalData.bleDeviceConnectState) {
            // 显示提示框
            wx.showModal({
                title: '提示',
                content: '请连接蓝牙后尝试！',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        console.log(res)
                        // 回到主页面
                        wx.redirectTo({
                            url: '../index/index',
                        })
                    }
                }
            })
        }

        // 监听蓝牙连接状态变化
        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // 设备连接异常断开
            if (!res.connected) {
                // 更新连接设备状态信息
                app.globalData.bleConnectedDeviceId = null;
                app.globalData.bleConnectDeviceName = null;
                app.globalData.bleDeviceConnectState = false;

                if (that.data.onTesting) {
                    that.setData({
                        onTesting: false,
                        testButtonText: "开始测试",
                        buttonType: "primary",
                        testTimes: 0,
                    })
                }
                // 显示提示框
                wx.showModal({
                    title: '提示',
                    content: '蓝牙异常断开，请返回首页重新连接！',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            console.log(res)
                            // 回到主页面
                            // wx.redirectTo({
                            //     url: '../index/index',
                            // })
                        }
                    }
                })
            }
        })

        /** 监听蓝牙数据 */
        wx.onBLECharacteristicValueChange(function (res) {
            console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
            console.log(util.hexCharCodeToStr(util.ab2hex(res.value)));
            that.setData({
                bleRecvStr: that.data.bleRecvStr + util.hexCharCodeToStr(util.ab2hex(res.value))
            })
            // 已接收到完整的应答数据
            if ((that.data.bleRecvStr).indexOf("<Response>") != -1 && (that.data.bleRecvStr).indexOf("</Response>") != -1) {

                if (!that.data.onTesting) {
                    that.setData({
                        bleRecvStr: '',
                    })
                    return;
                }

                // 驻网时间
                if ((that.data.bleRecvStr).indexOf("<attachTime>") != -1 && (that.data.bleRecvStr).indexOf("</attachTime>") != -1) {
                    // 提示更新成功
                    wx.showToast({
                        title: '更新成功',
                        icon: 'none'
                    })

                    var head = (that.data.bleRecvStr).indexOf("<attachTime>") + 12;
                    var end = (that.data.bleRecvStr).indexOf("</attachTime>");
                    var value = parseInt(that.data.bleRecvStr.slice(head, end), 10);

                    if(value <= 1) {
                        value = 0;
                    }

                    value = (value/1000).toFixed(2);

                    var attach_temp = that.data.attachTime;
                    attach_temp.push(value);
                    /** 更新数据 */
                    that.setData({
                        attachTime: attach_temp,
                        progressValue: ((that.data.attachTime.length / that.data.testTimes)*100).toFixed(0),
                    })

                    that.data.canvasLabels.push('');

                    var successCount = 0;
                    var totalTime = 0;
                    var maxTime = 0;
                    var minTime = 600;
                    for (var i = 0; i < that.data.attachTime.length; i++) {
                        if (that.data.attachTime[i] == 0) {
                            continue;
                        }
                        successCount++;
                        totalTime = (Number(totalTime) + Number(that.data.attachTime[i])).toFixed(2);
                        if (that.data.attachTime[i] > maxTime) {
                            maxTime = Number(that.data.attachTime[i]).toFixed(2);
                        }
                        if (that.data.attachTime[i] < minTime) {
                            minTime = Number(that.data.attachTime[i]).toFixed(2);
                        }
                    }
                    if (successCount == 0) {
                        minTime = 0;
                    }
                    /* 更新数据 */
                    that.setData({
                        registerAvrTimes: (Number(totalTime) / Number(successCount)).toFixed(2),
                        registerMaxTimes: maxTime,
                        registerMinTimes: minTime,
                        registerSuccessRate: ((Number(successCount) / Number(that.data.attachTime.length))*100).toFixed(2),
                    })

                    /** 清除定时器 */
                    clearInterval(that.data.timerId);
                    if (that.data.attachTime.length < that.data.testTimes) {
                        /** 发送综合测试指令 */
                        util.cm_ble_write("<Request>comprehensiveTest</Request>");
                        that.data.timerId = setInterval(
                            function () {
                                util.cm_ble_write("<Request>comprehensiveTest</Request>");
                            }, 150 * 1000
                        )
                    }
                    else {
                        that.setData({
                            onTesting: false,
                            testButtonText: "开始测试",
                            buttonType: "primary",
                            testTimes: 0,
                        })
                        wx.showToast({
                            title: '测试完成',
                            icon: 'success'
                        })
                    }
                }

                // 网络延时
                if ((that.data.bleRecvStr).indexOf("<pingDelay>") != -1 && (that.data.bleRecvStr).indexOf("</pingDelay>") != -1) {

                    var head = (that.data.bleRecvStr).indexOf("<pingDelay>") + 11;
                    var end = (that.data.bleRecvStr).indexOf("</pingDelay>");
                    var value = parseInt(that.data.bleRecvStr.slice(head, end), 10);

                    var pingDelay_temp = that.data.pingDelay;
                    pingDelay_temp.push(value);
                    /** 更新数据 */
                    that.setData({
                        pingDelay: pingDelay_temp,
                    })

                    var successCount = 0;
                    var totalTime = 0;
                    var maxTime = 0;
                    var minTime = 20000;
                    for (var i = 0; i < that.data.pingDelay.length; i++) {
                        if (that.data.pingDelay[i] == 0) {
                            continue;
                        }
                        successCount++;
                        totalTime = (Number(totalTime) + Number(that.data.pingDelay[i])).toFixed(2);
                        if (that.data.pingDelay[i] > maxTime) {
                            maxTime = Number(that.data.pingDelay[i]).toFixed(2);
                        }
                        if (that.data.pingDelay[i] < minTime) {
                            minTime = Number(that.data.pingDelay[i]).toFixed(2);
                        }
                    }
                    if (successCount == 0) {
                        minTime = 0;
                    }
                    /* 更新数据 */
                    that.setData({
                        pingAvr: (Number(totalTime) / Number(successCount)).toFixed(2),
                        pingMax: maxTime,
                        pingMin: minTime,
                        pingSuccessRate: ((Number(successCount) / Number(that.data.pingDelay.length)) * 100).toFixed(2),
                    })
                }

                // RSSI
                if ((that.data.bleRecvStr).indexOf("<csq>") != -1 && (that.data.bleRecvStr).indexOf("</csq>") != -1) {

                    var head = (that.data.bleRecvStr).indexOf("<csq>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</csq>");
                    var value = parseInt(that.data.bleRecvStr.slice(head, end), 10);
                    if(value == 99) {
                        value = 0;
                    }
                    value = Number(value*2 - 113);

                    var rssi_temp = that.data.rssi;
                    rssi_temp.push(value);
                    /** 更新数据 */
                    that.setData({
                        rssi: rssi_temp,
                    })

                    var successCount = 0;
                    var totalRssi = 0;
                    var maxRssi = -113;
                    var minRssi = 0;
                    for (var i = 0; i < that.data.rssi.length; i++) {
                        if (that.data.rssi[i] == -113) {
                            continue;
                        }
                        successCount++;
                        totalRssi = (Number(totalRssi) + Number(that.data.rssi[i]));
                        if (that.data.rssi[i] > maxRssi) {
                            maxRssi = Number(that.data.rssi[i]);
                        }
                        if (that.data.rssi[i] < minRssi) {
                            minRssi = Number(that.data.rssi[i]);
                        }
                    }
                    /* 更新数据 */
                    that.setData({
                        rssiAvr: (Number(totalRssi) / Number(successCount)).toFixed(2),
                        rssiMax: maxRssi,
                        rssiMin: minRssi,
                        rssiSuccessRate: ((Number(successCount) / Number(that.data.rssi.length)) * 100).toFixed(2),
                    })
                }

                // SNR
                if ((that.data.bleRecvStr).indexOf("<snr>") != -1 && (that.data.bleRecvStr).indexOf("</snr>") != -1) {

                    var head = (that.data.bleRecvStr).indexOf("<snr>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</snr>");
                    var value = parseInt(that.data.bleRecvStr.slice(head, end), 10);

                    var snr_temp = that.data.snr;
                    snr_temp.push(value);
                    /** 更新数据 */
                    that.setData({
                        snr: snr_temp,
                    })

                    var totalsnr = 0;
                    var maxsnr = that.data.snr[0];
                    var minsnr = that.data.snr[0];
                    for (var i = 0; i < that.data.snr.length; i++) {
                        totalsnr = (Number(totalsnr) + Number(that.data.snr[i]));
                        if (that.data.snr[i] > maxsnr) {
                            maxsnr = Number(that.data.snr[i]);
                        }
                        if (that.data.snr[i] < minsnr) {
                            minsnr = Number(that.data.snr[i]);
                        }
                    }
                    /* 更新数据 */
                    that.setData({
                        snrAvr: (Number(totalsnr) / Number(successCount)).toFixed(2),
                        snrMax: maxsnr,
                        snrMin: minsnr,
                    })
                }

                console.log("attachTime: " + that.data.attachTime);
                console.log("snr: " + that.data.snr);
                console.log("rssi: " + that.data.rssi);
                console.log("pingDelay: " + that.data.pingDelay);

                that.setData({
                    bleRecvStr: "",
                })

                /** 绘制驻网时间走势图 */
                if(that.data.attachTime.length > 0) {
                    app.deviceInfo.then(function (deviceInfo) {
                        console.log('设备信息', deviceInfo)
                        new wxCharts({
                            canvasId: 'registerCanvas',
                            type: 'line',
                            categories: that.data.canvasLabels,
                            series: [{
                                name: "驻网时间（秒）",
                                format: function (val) {
                                    return val.toFixed(0);
                                },
                                data: that.data.attachTime,
                            }],

                            yAxis: {
                                title: '驻网时间（秒）',
                                format: function (val) {
                                    return val.toFixed(1);
                                },
                                min: 0
                            },
                            dataLabel: false,
                            width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            height: 180,
                            animation: false
                        });
                    })
                }

                /** 绘制网络延时走势图 */
                if (that.data.attachTime.length > 0) {
                    app.deviceInfo.then(function (deviceInfo) {
                        console.log('设备信息', deviceInfo)
                        new wxCharts({
                            canvasId: 'pingCanvas',
                            type: 'line',
                            categories: that.data.canvasLabels,
                            series: [{
                                name: "网络延时（ms）",
                                format: function (val) {
                                    return val.toFixed(0);
                                },
                                data: that.data.pingDelay,
                            }],

                            yAxis: {
                                title: '网络延时（ms）',
                                format: function (val) {
                                    return val.toFixed(1);
                                },
                                min: 0
                            },
                            dataLabel: false,
                            width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            height: 180,
                            animation: false
                        });
                    })
                }

                /** 绘制RSSI走势图 */
                if (that.data.attachTime.length > 0) {
                    app.deviceInfo.then(function (deviceInfo) {
                        console.log('设备信息', deviceInfo)
                        new wxCharts({
                            canvasId: 'rssiCanvas',
                            type: 'line',
                            categories: that.data.canvasLabels,
                            series: [{
                                name: "RSSI(dBm)",
                                format: function (val) {
                                    return val.toFixed(0);
                                },
                                data: that.data.rssi,
                            }],

                            yAxis: {
                                title: 'RSSI(dBm)',
                                format: function (val) {
                                    return val.toFixed(1);
                                },
                                min: 0
                            },
                            dataLabel: false,
                            width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            height: 180,
                            animation: false
                        });
                    })
                }

                /** 绘制SNR走势图 */
                if (that.data.attachTime.length > 0) {
                    app.deviceInfo.then(function (deviceInfo) {
                        console.log('设备信息', deviceInfo)
                        new wxCharts({
                            canvasId: 'snrCanvas',
                            type: 'line',
                            categories: that.data.canvasLabels,
                            series: [{
                                name: "SNR",
                                format: function (val) {
                                    return val.toFixed(0);
                                },
                                data: that.data.snr,
                            }],

                            yAxis: {
                                title: 'SNR',
                                format: function (val) {
                                    return val.toFixed(1);
                                },
                                min: 0
                            },
                            dataLabel: false,
                            width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            height: 180,
                            animation: false
                        });
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

})
