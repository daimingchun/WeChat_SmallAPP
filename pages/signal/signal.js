//index.js
//获取应用实例
var app = getApp()

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

Page({
    data: {
        bleRecvStr: "",
        canvasLabels: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        csqData: [],
        snrData:[],
        rsrqData:[],
        csq:0,
        snr:0,
        rsrq:0,
        earfcn:"NULL",
        ecl:"NULL",
        plmn: "NULL",
        band: "NULL",
        t3324: "NULL",
        t3412: "NULL",
        cellid: "NULL",
        timerId: 0,
    },

    onLoad: function () {
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '网络参数'
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("signal page unloaded!");
        clearInterval(this.data.timerId);
    },

    // 返回主页
    backHomePage: function () {
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    },

    onShow: function () {
        var that = this;

        if (app.globalData.bleDeviceConnectState){
            util.cm_ble_write("<Request>radioInfo</Request>")
            that.data.timerId = setInterval(
                function(){
                    if (app.globalData.bleDeviceConnectState){

                        util.cm_ble_write("<Request>radioInfo</Request>")
                    }
                },5000
            );
            wx.showLoading({
                title: '正在获取',
            })
        }
        else {
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

        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // 设备连接异常断开
            if (!res.connected) {
                // 更新连接设备状态信息
                app.globalData.bleConnectedDeviceId = null;
                app.globalData.bleConnectDeviceName = null;
                app.globalData.bleDeviceConnectState = false;
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
                clearInterval(that.data.timerId);
            }
            else{
                util.cm_ble_write("<Request>radioInfo</Request>"); // 请求射频参数\
                that.data.timerId = setInterval(
                    function () {
                        if (app.globalData.bleDeviceConnectState) {

                            util.cm_ble_write("<Request>radioInfo</Request>")
                        }
                    }, 5000
                );
            }
        })

        // 监听蓝牙数据
        wx.onBLECharacteristicValueChange(function (res) {
            console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
            console.log(util.hexCharCodeToStr(util.ab2hex(res.value)));
            that.setData({
                bleRecvStr: that.data.bleRecvStr + util.hexCharCodeToStr(util.ab2hex(res.value))
            })
            // 已接收到完整的应答数据
            if ((that.data.bleRecvStr).indexOf("<Response>") != -1 && (that.data.bleRecvStr).indexOf("</Response>") != -1) {
                
                // CSQ
                if ((that.data.bleRecvStr).indexOf("<csq>") != -1 && (that.data.bleRecvStr).indexOf("</csq>") != -1)
                {
                    // 隐藏加载动画
                    wx.hideLoading();
                    // 提示更新成功
                    wx.showToast({
                        title: '更新成功',
                        icon: 'none'
                    })

                    var head = (that.data.bleRecvStr).indexOf("<csq>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</csq>");

                    if (that.data.csqData.length >= 20) {
                        that.data.csqData.shift()
                    }
                    var csqValue = parseInt(that.data.bleRecvStr.slice(head, end), 10)
                    if(csqValue == 99){
                        csqValue = 0;
                    }

                    var rssiValue = csqValue * 2 + (-113)
                    // 更新csq值
                    that.setData({
                        csq: rssiValue,
                    })

                    if (csqValue >= 0 && csqValue<= 31) {
                        that.data.csqData.push(rssiValue)
                    }
                    else {
                        that.data.csqData.push(rssiValue)
                    }
                    console.log(that.data.csqData)
                }
                // SNR
                if ((that.data.bleRecvStr).indexOf("<snr>") != -1 && (that.data.bleRecvStr).indexOf("</snr>") != -1)
                {
                    var head = (that.data.bleRecvStr).indexOf("<snr>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</snr>");

                    if (that.data.snrData.length >= 20) {
                        that.data.snrData.shift()
                    }
                    var snrValue = parseInt(that.data.bleRecvStr.slice(head, end), 10)
                    // snr
                    that.setData({
                        snr: snrValue,
                    })

                    if (snrValue != -32768)
                    {
                        that.data.snrData.push(snrValue)
                    }else {
                        that.data.snrData.push(0)
                    }
                    console.log(that.data.snrData)
                }
                // RSRQ
                if ((that.data.bleRecvStr).indexOf("<rsrq>") != -1 && (that.data.bleRecvStr).indexOf("</rsrq>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<rsrq>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</rsrq>");

                    if (that.data.rsrqData.length >= 20) {
                        that.data.rsrqData.shift()
                    }

                    var rsrqValue = parseInt(that.data.bleRecvStr.slice(head, end), 10)

                    // rsrq
                    that.setData({
                        rsrq: rsrqValue,
                    })

                    if (rsrqValue != -32768) {
                        that.data.rsrqData.push(rsrqValue)
                    } else {
                        that.data.rsrqData.push(0)
                    }
                    console.log(that.data.rsrqData)
                }
                // 绘制CSQ走势图
                app.deviceInfo.then(function (deviceInfo) {
                    console.log('设备信息', deviceInfo)
                    new wxCharts({
                        canvasId: 'csqCanvas',
                        type: 'line',
                        categories: that.data.canvasLabels,
                        series: [{
                            name: 'RSSI' + "(" + that.data.csq + "dBm)",
                            format: function (val) {
                                return val.toFixed(0);
                            },
                            data: that.data.csqData,
                        }],

                        yAxis: {
                            title: 'RSSI (信号强度)',
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
                // 绘制SNR走势图
                app.deviceInfo.then(function (deviceInfo) {
                    console.log('设备信息', deviceInfo)
                    new wxCharts({
                        canvasId: 'snrCanvas',
                        type: 'line',
                        categories: that.data.canvasLabels,
                        series: [{
                            name: 'SNR' + "(" + that.data.snr + ")",
                            format: function (val) {
                                return val.toFixed(0);
                            },
                            data: that.data.snrData,
                        }],

                        yAxis: {
                            title: 'SNR (信噪比)',
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
                // 绘制RSRQ走势图
                app.deviceInfo.then(function (deviceInfo) {
                    console.log('设备信息', deviceInfo)
                    new wxCharts({
                        canvasId: 'rsrqCanvas',
                        type: 'line',
                        categories: that.data.canvasLabels,
                        series: [{
                            name: 'RSRQ' + "(" + that.data.rsrq + ")",
                            format: function (val) {
                                return val.toFixed(0);
                            },
                            data: that.data.rsrqData,
                        }],

                        yAxis: {
                            title: 'RSRQ (参考信号接收质量)',
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
                // earfcn
                if ((that.data.bleRecvStr).indexOf("<earfcn>") != -1 && (that.data.bleRecvStr).indexOf("</earfcn>") != -1){
                    var head = (that.data.bleRecvStr).indexOf("<earfcn>") + 8;
                    var end = (that.data.bleRecvStr).indexOf("</earfcn>");

                    that.setData({
                        earfcn: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // ecl
                if ((that.data.bleRecvStr).indexOf("<ecl>") != -1 && (that.data.bleRecvStr).indexOf("</ecl>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<ecl>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</ecl>");

                    that.setData({
                        ecl: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // plmn
                if ((that.data.bleRecvStr).indexOf("<plmn>") != -1 && (that.data.bleRecvStr).indexOf("</plmn>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<plmn>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</plmn>");

                    that.setData({
                        plmn: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // band
                if ((that.data.bleRecvStr).indexOf("<band>") != -1 && (that.data.bleRecvStr).indexOf("</band>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<band>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</band>");

                    that.setData({
                        band: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // t3324
                if ((that.data.bleRecvStr).indexOf("<t3324>") != -1 && (that.data.bleRecvStr).indexOf("</t3324>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<t3324>") + 7;
                    var end = (that.data.bleRecvStr).indexOf("</t3324>");

                    that.setData({
                        t3324: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // t3412
                if ((that.data.bleRecvStr).indexOf("<t3412>") != -1 && (that.data.bleRecvStr).indexOf("</t3412>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<t3412>") + 7;
                    var end = (that.data.bleRecvStr).indexOf("</t3412>");

                    that.setData({
                        t3412: that.data.bleRecvStr.slice(head, end)
                    })
                }
                // cell id
                if ((that.data.bleRecvStr).indexOf("<cellid>") != -1 && (that.data.bleRecvStr).indexOf("</cellid>") != -1) {
                    console.log("find cellid!")
                    var head = (that.data.bleRecvStr).indexOf("<cellid>") + 8;
                    var end = (that.data.bleRecvStr).indexOf("</cellid>");

                    that.setData({
                        cellid: that.data.bleRecvStr.slice(head, end)
                    })
                }

                // 清空蓝牙接收buffer
                that.setData({
                    bleRecvStr: ""
                })
            }
        })
    },
})



