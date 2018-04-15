// at_page.js

const app = getApp();

var util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bleRecvStr: "",
        bleShowStr: ""
    },

    backHomePage: function () {
        if (app.globalData.bleDeviceConnectState) {
            util.cm_ble_write("<Request>bleAtDisable</Request>");
        }
        // 回到主页面
        wx.redirectTo({
            url: '../index/index',
        })
    },

    clearRecvMSG: function() {
        this.setData({
            bleShowStr: ""
        })
    },

    SendAtCmd: function (res) {
        if (app.globalData.bleDeviceConnectState) {
            console.log(res.detail.value)
            if (res.detail.value.withEnter) {
                util.cm_ble_write("<Request><AT>" + res.detail.value.atCmd + "\r\n</AT></Request>");
            }
            else {
                util.cm_ble_write("<Request><AT>" + res.detail.value.atCmd + "\r\n</AT></Request>");
            }
        }
        else {
            // 显示提示框
            wx.showModal({
                title: '提示',
                content: '请连接蓝牙后重试！',
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
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        if (app.globalData.bleDeviceConnectState) {
            util.cm_ble_write("<Request>bleAtEnable</Request>");
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
        
        var that = this;
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
            }
        })

        wx.onBLECharacteristicValueChange(function (res) {
            console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
            console.log(util.hexCharCodeToStr(util.ab2hex(res.value)));
            that.setData({
                bleRecvStr: that.data.bleRecvStr + util.hexCharCodeToStr(util.ab2hex(res.value))
            })

            if((that.data.bleRecvStr).indexOf("<Response>") != -1 && (that.data.bleRecvStr).indexOf("</Response>") != -1) {
                if ((that.data.bleRecvStr).indexOf("<AT>") != -1 && (that.data.bleRecvStr).indexOf("</AT>") != -1)
                {
                    var head = (that.data.bleRecvStr).indexOf("<AT>") + 4;
                    var end = (that.data.bleRecvStr).indexOf("</AT>");
                    that.setData({
                        bleShowStr: that.data.bleShowStr + that.data.bleRecvStr.slice(head, end),
                        bleRecvStr: ""
                    })

                    util.pageScrollToBottom();
                }
            }
        })
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

