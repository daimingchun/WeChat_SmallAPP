// pages/deviceInfo/deviceInfo.js

var app = getApp();
var util = require('../../utils/util.js');  // 引用公共接口

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ICCID:"",       // ICCID号
        IMSI:"",        // IMSI号
        IMEI:"",        // IMEI号
        Module:"",      // 模组型号
        Module_ver:"",  // 模组版本
        battery:"",     // 电池电量
        bat_vol:"",     // 电池电压
        firware:"",     // 软件版本
        timerId:0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '设备信息'
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
            util.cm_ble_write("<Request>deviceInfo</Request>")
            that.data.timerId = setInterval(
                function () {
                    if (app.globalData.bleDeviceConnectState) {

                        util.cm_ble_write("<Request>deviceInfo</Request>")
                    }
                }, 60000
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
                // 隐藏加载动画
                wx.hideLoading();
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
            else {
                util.cm_ble_write("<Request>deviceInfo</Request>"); // 请求设备信息
                that.data.timerId = setInterval(
                    function () {
                        if (app.globalData.bleDeviceConnectState) {

                            util.cm_ble_write("<Request>deviceInfo</Request>")
                        }
                    }, 60000
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
                
                // 模组型号
                if ((that.data.bleRecvStr).indexOf("<module>") != -1 && (that.data.bleRecvStr).indexOf("</module>") != -1) {

                    // 隐藏加载动画
                    wx.hideLoading();
                    // 提示更新成功
                    wx.showToast({
                        title: '更新成功',
                        icon: 'none'
                    })

                    var head = (that.data.bleRecvStr).indexOf("<module>") + 8;
                    var end = (that.data.bleRecvStr).indexOf("</module>");
                    var moduleName = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        Module: moduleName,
                    })
                }

                // 模组版本
                if ((that.data.bleRecvStr).indexOf("<module_ver>") != -1 && (that.data.bleRecvStr).indexOf("</module_ver>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<module_ver>") + 12;
                    var end = (that.data.bleRecvStr).indexOf("</module_ver>");
                    var moduleVer = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        Module_ver: moduleVer,
                    })
                }

                // ICCID
                if ((that.data.bleRecvStr).indexOf("<iccid>") != -1 && (that.data.bleRecvStr).indexOf("</iccid>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<iccid>") + 7;
                    var end = (that.data.bleRecvStr).indexOf("</iccid>");
                    var iccid = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        ICCID: iccid,
                    })
                }

                // IMSI
                if ((that.data.bleRecvStr).indexOf("<imsi>") != -1 && (that.data.bleRecvStr).indexOf("</imsi>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<imsi>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</imsi>");
                    var imsi = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        IMSI: imsi,
                    })
                }

                // IMEI
                if ((that.data.bleRecvStr).indexOf("<imei>") != -1 && (that.data.bleRecvStr).indexOf("</imei>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<imei>") + 6;
                    var end = (that.data.bleRecvStr).indexOf("</imei>");
                    var imei = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        IMEI: imei,
                    })
                }

                // IMEI
                if ((that.data.bleRecvStr).indexOf("<firmware>") != -1 && (that.data.bleRecvStr).indexOf("</firmware>") != -1) {
                    var head = (that.data.bleRecvStr).indexOf("<firmware>") + 10;
                    var end = (that.data.bleRecvStr).indexOf("</firmware>");
                    var firmwareRel = that.data.bleRecvStr.slice(head, end)
                    that.setData({
                        firware: firmwareRel,
                    })
                }


                // 清空蓝牙接收buffer
                that.setData({
                    bleRecvStr: ""
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
        console.log("deviceinfo page unloaded!")
        clearInterval(this.data.timerId);
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

    // 返回主页
    backHomePage: function () {
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    }
})

