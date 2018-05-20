// pages/networkRegister/networkRegister.js

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        registerTime: [],
        currentRegisterTime: 0,
        averageRegisterTime: 0,
        maxRegisterTime: 0,
        minRegisterTime: 0,
        registerCounts: 0,
        registerFailCounts: 0,
        successRate: 0,
        timerId: 0,
        bleRecvStr: "",
        canvasLabels: [],
        showModal: false,
        remarkStr: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '驻网测试'
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
        if (app.globalData.bleDeviceConnectState) {
            setTimeout(
                function(){
                    wx.showLoading({
                        title: '正在测试',
                    })
                    util.cm_ble_write("<Request>attachTime</Request>");
                },2000
            );
            clearInterval(that.data.timerId);
            that.data.timerId = setInterval(
                function () {
                    util.cm_ble_write("<Request>attachTime</Request>");
                }, 125 * 1000
            );
        }
        else {
            clearInterval(that.data.timerId);
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
                clearInterval(that.data.timerId);
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

                wx.hideLoading();
            }
            else {
                clearInterval(that.data.timerId);
                util.cm_ble_write("<Request>attachTime</Request>");
                that.data.timerId = setInterval(
                    function () {
                        util.cm_ble_write("<Request>attachTime</Request>");
                    }, 125 * 1000
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
                // attachTime
                if ((that.data.bleRecvStr).indexOf("<attachTime>") != -1 && (that.data.bleRecvStr).indexOf("</attachTime>") != -1) {
                    // 隐藏加载动画
                    wx.hideLoading();

                    var head = (that.data.bleRecvStr).indexOf("<attachTime>") + 12;
                    var end = (that.data.bleRecvStr).indexOf("</attachTime>");
                    // 获取驻网时间值
                    var value = parseInt(that.data.bleRecvStr.slice(head, end), 10);

                    // 只保留最近20次测试数据
                    if (that.data.registerTime.length >= 20) {
                        that.data.registerTime.shift()
                    }

                    // 驻网失败
                    if (value == 1 || value == 0) {
                        // 提示本次驻网失败
                        // wx.showToast({
                        //     title: '驻网失败',
                        //     icon: 'none'
                        // })

                        console.log("Attach timeout!");
                        value = 0;
                        // 添加测试记录绘图数据点
                        that.data.registerTime.push(value);

                        that.setData({
                            registerFailCounts: Number(that.data.registerFailCounts + 1), // 失败次数+1
                            currentRegisterTime: value,
                            registerCounts: Number(that.data.registerCounts + 1), // 驻网次数+1
                        })
                    }
                    else {
                        // 提示本次驻网成功
                        // wx.showToast({
                        //     title: '驻网成功',
                        //     icon: 'success'
                        // })

                        // 将驻网时间转换为秒单位
                        value = Number((value / 1000).toFixed(2));

                        // 添加测试记录绘图数据点
                        that.data.registerTime.push(value);

                        var regCounts = Number(that.data.registerCounts + 1); // 驻网次数+1
                        var regFailCounts = Number(that.data.registerFailCounts);
                        var succRate = ((regCounts - regFailCounts) * 100 / regCounts).toFixed(2);
                        var regAvrTime = Number(that.data.averageRegisterTime);
                        var successCounts = Number(regCounts - regFailCounts);
                        var totalRegTime = Number((successCounts - 1) * regAvrTime) + Number(value);
                        regAvrTime = Number((totalRegTime / successCounts).toFixed(2));
                        console.log("regAvrTime: " + regAvrTime);
                        // 最小时长
                        var regMin = Number(that.data.minRegisterTime);
                        if (regMin == 0 || value < regMin) {
                            regMin = value;
                        }
                        // 最大时长
                        var regMax = Number(that.data.maxRegisterTime);
                        if (value > regMax) {
                            regMax = value;
                        }

                        // 更新数据
                        that.setData({
                            registerCounts: regCounts,
                            successRate: succRate,
                            averageRegisterTime: regAvrTime,
                            maxRegisterTime: regMax,
                            minRegisterTime: regMin,
                            currentRegisterTime: value,
                        })
                    }
                    /**增加绘图项 */
                    if (that.data.canvasLabels.length < 20) {
                        that.data.canvasLabels.push("");
                    }
                    // 绘制驻网时间走势图
                    app.deviceInfo.then(function (deviceInfo) {
                        console.log('设备信息', deviceInfo)
                        new wxCharts({
                            canvasId: 'registerCanvas',
                            type: 'line',
                            categories: that.data.canvasLabels,
                            series: [{
                                name: '驻网时间（s）',
                                format: function (val) {
                                    return val.toFixed(0);
                                },
                                data: that.data.registerTime,
                            }],

                            yAxis: {
                                title: '驻网时间（s）',
                                format: function (val) {
                                    return val.toFixed(1);
                                },
                                min: 0
                            },
                            dataLabel: false,
                            width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            height: 300,
                            animation: false
                        });
                    })
                }

                clearInterval(that.data.timerId);
                util.cm_ble_write("<Request>attachTime</Request>");
                that.data.timerId = setInterval(
                    function () {
                        util.cm_ble_write("<Request>attachTime</Request>");
                    }, 125 * 1000
                );

                /**清空蓝牙缓存 */
                that.data.bleRecvStr = "";
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
        console.log("networkRegister page unloaded!");
        clearInterval(this.data.timerId);
    },

    // 返回主页
    backHomePage: function () {
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
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
                    testType: "驻网测试",
                    registerTime_t: that.data.registerTime,
                    averageRegisterTime_t: that.data.averageRegisterTime,
                    maxRegisterTime_t: that.data.maxRegisterTime,
                    minRegisterTime_t: that.data.minRegisterTime,
                    registerCounts_t: that.data.registerCounts,
                    registerFailCounts_t: that.data.registerFailCounts,
                    successRate_t: that.data.successRate,
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
                    success: function (res) {
                        var oldData = res.data;
                        oldData.unshift(testData);
                        wx.setStorage({
                            key: 'CMIOT_D5310A_HistoryData',
                            data: oldData,
                            success: function (res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存成功',
                                    icon: "success",
                                    duration: 1500,
                                })
                            },
                            fail: function (res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存失败',
                                    icon: "none",
                                    duration: 1500,
                                })
                            }
                        })
                    },
                    fail: function (res) {
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
                                    duration: 1500,
                                })
                            },
                            fail: function (res) {
                                console.log(res);
                                wx.showToast({
                                    title: '保存失败',
                                    icon: "none",
                                    duration: 1500,
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


