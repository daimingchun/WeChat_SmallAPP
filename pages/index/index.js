//index.js
//获取应用实例
const app = getApp()

var util = require('../../utils/util.js');  // 引用公共接口


Page({
    data: {
        BleConnectState: getApp().globalData.bleDeviceConnectState,     // 蓝牙连接状态
        BleConnectName: getApp().globalData.bleConnectDeviceName,       // 蓝牙连接设备名称
    },
    // 搜索蓝牙设备界面
    searchBleDevice: function() {
        wx.navigateTo({
            url: '../bleSearch/bleSearch',
        })
    },
    // 进入AT模式页面
    cm_enter_atMode: function() {
        wx.navigateTo({
            url: '../at_page/at_page',
        })
    },
    // 进入设备信息界面
    cm_enter_deviceInfoPage: function() {
        wx.navigateTo({
            url: '../deviceInfo/deviceInfo',
        })
    },
    // 进入信号参数界面
    cm_enter_signalPage: function(){
        wx.navigateTo({
            url: '../signal/signal',
        })
    },
    // 进入驻网测试界面
    cm_enter_registerPage: function() {
        wx.navigateTo({
            url: '../networkRegister/networkRegister',
        })
    },
    // 进入网络延时界面
    cm_enter_networkDelayPage: function() {
        wx.navigateTo({
            url: '../networkDelay/networkDelay',
        })
    },
    // 进入综合测试界面
    cm_enter_comprehensiveTestPage() {
        wx.navigateTo({
            url: '../networkRegister/networkRegister',
        })
    },
    // 断开蓝牙连接
    disconnectBleDevice: function() {
        var that = this;
        wx.showLoading({
            title: '断开连接',
        })
        // 断开连接
        wx.closeBLEConnection({
            deviceId: app.globalData.bleConnectedDeviceId,
            success: function(res) {
                console.log(res);
                app.globalData.bleConnectedDeviceId = null;
                app.globalData.bleConnectDeviceName = null;
                app.globalData.bleDeviceConnectState= false;
                that.setData({
                    BleConnectState: getApp().globalData.bleDeviceConnectState,
                    BleConnectName: getApp().globalData.bleConnectDeviceName,
                })
                // 提示成功
                wx.hideLoading();
                wx.showToast({
                    title: '断开成功',
                    icon:'success'
                })
            },
            fail: function(res) {
                // 提示失败
                wx.hideLoading();
                wx.showToast({
                    title: '断开失败',
                    icon: 'fail'
                })
            }
        })
    },

    //事件处理函数
    bindViewTap: function() {
        wx.redirectTo({
            url: '../logs/logs',
        })
    },

    onShow: function () {
        var that = this;
        this.setData({
            BleConnectState: getApp().globalData.bleDeviceConnectState,
            BleConnectName:  getApp().globalData.bleConnectDeviceName,
        })

        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // 设备连接异常断开
            if (!res.connected)
            {
                // 更新连接设备状态信息
                app.globalData.bleConnectedDeviceId     = null;
                app.globalData.bleConnectDeviceName     = null;
                app.globalData.bleDeviceConnectState    = false;
                that.setData({
                    BleConnectState: getApp().globalData.bleDeviceConnectState,
                    BleConnectName: getApp().globalData.bleConnectDeviceName,
                })
            }
        })
        // 断开时更新页面连接状态显示
        if (that.data.BleConnectState)
        {
            wx.onBLECharacteristicValueChange(function(res){
                console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
                console.log(util.hexCharCodeToStr(util.ab2hex(res.value)));
            })
        }
    },
})


