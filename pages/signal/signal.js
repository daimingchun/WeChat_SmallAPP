//index.js
//获取应用实例
var app = getApp()

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

Page({
    data: {
        bleRecvStr: "",
        canvasLabels: [],
        rssiData: [],
        snrData: [],
        rsrqData: [],
        rssi: 0,
        snr: 0,
        rsrq: 0,
        rsrp: 0,
        earfcn: "NULL",
        ecl: "NULL",
        plmn: "NULL",
        apn: "NULL",
        band: "NULL",
        t3324: "NULL",
        t3412: "NULL",
        cellid: "NULL",

        timerId: 0,
        showModal: false,
        remarkStr: "",
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
        console.log("signal.wxml unloaded!");
        clearInterval(this.data.timerId);
    },

    // 返回主页
    backHomePage: function () {
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    },
    /** */
    onShow: function () {
        var that = this;

        if (app.globalData.bleDeviceConnectState) {
            
            setTimeout(
                function(){
                    wx.showLoading({
                        title: '正在测试',
                    })
                    util.cm_ble_write("<Request>radioInfo</Request>")
                },1500
            );
            /**定时发送请求 */
            clearInterval(that.data.timerId);
            that.data.timerId = setInterval(
                function () {
                    if (app.globalData.bleDeviceConnectState) {

                        util.cm_ble_write("<Request>radioInfo</Request>")
                    }
                }, 10000
            );
        }
        else {
            clearInterval(that.data.timerId);
            // 显示提示框
            wx.showModal({
                title: '提示',
                content: '请蓝牙连接测试仪后尝试！',
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
                wx.hideLoading();
            }
            else {
                util.cm_ble_write("<Request>radioInfo</Request>"); // 请求射频参数
                clearInterval(that.data.timerId);
                that.data.timerId = setInterval(
                    function () {
                        if (app.globalData.bleDeviceConnectState) {

                            util.cm_ble_write("<Request>radioInfo</Request>")
                        }
                    }, 10000
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

                if ((that.data.bleRecvStr).indexOf("<radioInfo>") == -1 || (that.data.bleRecvStr).indexOf("</radioInfo>") == -1) {
                    that.data.bleRecvStr = "";
                    return;
                }

                // 隐藏加载动画
                wx.hideLoading();

                // rssi
                if ((that.data.bleRecvStr).indexOf("<rssi>") != -1 && (that.data.bleRecvStr).indexOf("</rssi>") != -1) {
                    
                    var head = (that.data.bleRecvStr).indexOf("<rssi>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</rssi>");

                    if (that.data.rssiData.length >= 100) {
                        that.data.rssiData.shift()
                    }

                    var rssiValue = parseInt(that.data.bleRecvStr.slice(head, end), 10)/10

                    // 更新rssi值
                    that.setData({
                        rssi: rssiValue,
                    })

                    that.data.rssiData.push(rssiValue)
                    console.log(that.data.rssiData)
                }
                // SNR
                if ((that.data.bleRecvStr).indexOf("<snr>") != -1 && (that.data.bleRecvStr).indexOf("</snr>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<snr>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</snr>");

                    if (that.data.snrData.length >= 100) {
                        that.data.snrData.shift()
                    }
                    var snrValue = parseInt(that.data.bleRecvStr.slice(head, end), 10)
                    // snr
                    that.setData({
                        snr: snrValue,
                    })

                    if (snrValue != -32768) {
                        that.data.snrData.push(snrValue)
                    } else {
                        that.data.snrData.push(0)
                    }
                    console.log(that.data.snrData)
                }
                // RSRQ
                if ((that.data.bleRecvStr).indexOf("<rsrq>") != -1 && (that.data.bleRecvStr).indexOf("</rsrq>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<rsrq>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</rsrq>");

                    if (that.data.rsrqData.length >= 100) {
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
                /**增加绘图项 */
                if (that.data.canvasLabels.length < 100) {
                    that.data.canvasLabels.push("");
                }
                // 绘制rssi、RSRQ走势图
                app.deviceInfo.then(function (deviceInfo) {
                    console.log('设备信息', deviceInfo)
                    new wxCharts({
                        canvasId: 'rssiCanvas',
                        type: 'line',
                        categories: that.data.canvasLabels,
                        series: [{
                            name: 'RSSI' + "(" + that.data.rssi + "dBm)",
                            format: function (val) {
                                return val.toFixed(0);
                            },
                            data: that.data.rssiData,
                        },
                        {
                            name: 'RSRQ' + "(" + that.data.rsrq + "dBm)",
                            format: function (val) {
                                return val.toFixed(0);
                            },
                            data: that.data.rsrqData,
                        }],

                        yAxis: {
                            title: '信号强度',
                            format: function (val) {
                                return val.toFixed(1);
                            },
                            min: 0
                        },
                        dataLabel: false,
                        width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                        height: 180,
                        animation: false,
                        dataPointShape: false,
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
                        animation: false,
                        dataPointShape: false,
                    });
                })
                // 绘制RSRQ走势图
                // app.deviceInfo.then(function (deviceInfo) {
                //     console.log('设备信息', deviceInfo)
                //     new wxCharts({
                //         canvasId: 'rsrqCanvas',
                //         type: 'line',
                //         categories: that.data.canvasLabels,
                //         series: [{
                //             name: 'RSRQ' + "(" + that.data.rsrq + ")",
                //             format: function (val) {
                //                 return val.toFixed(0);
                //             },
                //             data: that.data.rsrqData,
                //         }],

                //         yAxis: {
                //             title: 'RSRQ (参考信号接收质量)',
                //             format: function (val) {
                //                 return val.toFixed(1);
                //             },
                //             min: 0
                //         },
                //         dataLabel: false,
                //         width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                //         height: 180,
                //         animation: false
                //     });
                // })
                // earfcn
                if ((that.data.bleRecvStr).indexOf("<earfcn>") != -1 && (that.data.bleRecvStr).indexOf("</earfcn>") != -1) {
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
                // rsrp
                if ((that.data.bleRecvStr).indexOf("<rsrp>") != -1 && (that.data.bleRecvStr).indexOf("</rsrp>") != -1) {
                    console.log("find rsrp!")
                    var head = (that.data.bleRecvStr).indexOf("<rsrp>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</rsrp>");

                    that.setData({
                        rsrp: parseInt(that.data.bleRecvStr.slice(head, end), 10)/10
                    })
                }
                // apn
                if ((that.data.bleRecvStr).indexOf("<apn>") != -1 && (that.data.bleRecvStr).indexOf("</apn>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<apn>") + 5;
                    var end = (that.data.bleRecvStr).indexOf("</apn>");

                    that.setData({
                        apn: that.data.bleRecvStr.slice(head, end)
                    })
                }

                // 清空蓝牙接收buffer
                that.data.bleRecvStr = "";
            }
        })
    },

    /**
     * 保存信号测试数据
     */
    onSaveButtonClicked: function () {
        this.setData({
            showModal: true,
        })
    },

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function () {

    },
    /**
     * 隐藏模态对话框
     */
    hideModal: function () {
        this.setData({
            showModal: false
        });
    },
    /**
     * 对话框取消按钮点击事件
     */
    onCancel: function () {
        this.hideModal();
        // this.setData({
        //     remarkStr: "",
        // })
    },
    /**
     * 对话框确认按钮点击事件
     */
    onConfirm: function () {
        var that = this;
        this.hideModal();
        wx.chooseLocation({
            /*成功回调 */
            success: function (res) {
                console.log(res.name);
                console.log(res.address);
                console.log(res.latitude);
                console.log(res.longitude);
                var date = new Date();
                //年  
                var Y = date.getFullYear();
                //月  
                var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
                //日  
                var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                //时  
                var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                //分  
                var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                //秒  
                var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();  

                var timestamp = Y + "-" + M + "-" + D + "_" + h + ":" + m + ":" + s;
                console.log("保存的索引时间戳为：" + timestamp);
                /**准备缓存的数据 */
                var testData =
                {
                    timeStamp_t: timestamp,
                    testType: "信号测试",
                    rssiData_t: that.data.rssiData,
                    snrData_t: that.data.snrData,
                    rsrqData_t: that.data.rsrqData,
                    earfcn_t: that.data.earfcn,
                    ecl_t: that.data.ecl,
                    plmn_t: that.data.plmn,
                    band_t: that.data.band,
                    t3324_t: that.data.t3324,
                    t3412_t: that.data.t3412,
                    cellid_t: that.data.cellid,
                    address_name: res.name,
                    address_addr: res.address,
                    address_lat: res.latitude,
                    address_lon: res.longitude,
                    comment: that.data.remarkStr,
                    canvasLabels_t: that.data.canvasLabels,
                };

                /* 获取当前存储的索引缓存 */
                wx.getStorage({
                    key: 'CMIOT_D5310A_HistoryData',
                    success: function(res) {
                        var oldData = res.data;
                        oldData.unshift(testData);
                        wx.setStorage({
                            key: 'CMIOT_D5310A_HistoryData',
                            data: oldData,
                            success: function(res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存成功',
                                    icon: "success",
                                    duration: 2000,
                                })
                            },
                            fail: function(res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存失败',
                                    icon: "none",
                                    duration: 2000,
                                })
                            }
                        })
                    },
                    fail: function(res) {
                        console.log(res);
                        var oldData = [];
                        oldData.unshift(testData);
                        wx.setStorage({
                            key: 'CMIOT_D5310A_HistoryData',
                            data: oldData,
                            success: function (res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存成功',
                                    icon: "success",
                                    duration: 2000,
                                })
                            },
                            fail: function (res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存失败',
                                    icon: "none",
                                    duration: 2000,
                                })
                            }
                        })
                    }
                })

                // wx.getStorage({
                //     key: 'CMIOT_D5310A_HistoryData',
                //     success: function (res) {
                //         console.log(res);
                //     },
                // })
            },

            /* 失败回调 */
            fail: function (res) {
                wx.showToast({
                    title: '位置选择失败',
                    icon: 'none'
                })
            }
        })
    },
    /**
     * 备注输入回调
     */
    onInputChange: function (e) {
        console.log(e.detail.value);
        this.setData({
            remarkStr: e.detail.value,
        })
    },
})



