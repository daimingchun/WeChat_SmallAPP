// pages/networkRegister/networkRegister.js

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        registerTime:[],
        currentRegisterTime:0,
        averageRegisterTime:0,
        maxRegisterTime:0,
        minRegisterTime:0,
        registerCounts:0,
        registerFailCounts:0,
        successRate:0,
        timerId: 0,
        bleRecvStr: "",
        canvasLabels: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
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
            util.cm_ble_write("<Request>attachTime</Request>");
            that.data.timerId = setInterval(
                function(){
                    util.cm_ble_write("<Request>attachTime</Request>");
                }, 12*1000
            );
            wx.showLoading({
                title: '正在测试',
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
                    }, 62 * 1000
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
                        wx.showToast({
                            title: '驻网失败',
                            icon: 'none'
                        })

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
                        wx.showToast({
                            title: '驻网成功',
                            icon: 'success'
                        })
                        
                        // 将驻网时间转换为秒单位
                        value = Number((value / 1000).toFixed(2));

                        // 添加测试记录绘图数据点
                        that.data.registerTime.push(value);

                        var regCounts = Number(that.data.registerCounts + 1); // 驻网次数+1
                        var regFailCounts = Number(that.data.registerFailCounts);
                        var succRate = ((regCounts - regFailCounts)*100/regCounts).toFixed(2);
                        var regAvrTime = Number(that.data.averageRegisterTime);
                        var successCounts = Number(regCounts - regFailCounts);
                        console.log("successCounts:" + successCounts + " value: " + value + " regCounts:" + regCounts + " regFailCounts:" + regFailCounts + " regAvrTime:" + regAvrTime);
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
                        if(value > regMax) {
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
                    }, 62 * 1000
                );

                that.setData({
                    bleRecvStr:'',
                })
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

    }
})




