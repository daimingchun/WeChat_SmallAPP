//index.js
//获取应用实例
const app = getApp()

var util = require('../../utils/util.js');  // 引用公共接口


Page({
    data: {
        BleConnectState: getApp().globalData.bleDeviceConnectState,     // 蓝牙连接状态
        BleConnectName: getApp().globalData.bleConnectDeviceName,       // 蓝牙连接设备名称
        historyData: [],
    },

    // 搜索蓝牙设备界面
    searchBleDevice: function () {
        wx.redirectTo({
            url: '../bleSearch/bleSearch',
        })
    },
    // 进入AT模式页面
    cm_enter_atMode: function () {
        wx.redirectTo({
            url: '../at_page/at_page',
        })
    },
    // 进入设备信息界面
    cm_enter_deviceInfoPage: function () {
        wx.redirectTo({
            url: '../deviceInfo/deviceInfo',
        })
    },
    // 进入信号参数界面
    cm_enter_signalPage: function () {
        wx.redirectTo({
            url: '../signal/signal',
        })
    },
    // 进入驻网测试界面
    cm_enter_registerPage: function () {
        wx.redirectTo({
            url: '../networkRegister/networkRegister',
        })
    },
    // 进入网络延时界面
    cm_enter_networkDelayPage: function () {
        wx.redirectTo({
            url: '../networkDelay/networkDelay',
        })
    },
    // 进入综合测试界面
    cm_enter_comprehensiveTestPage: function() {
        wx.redirectTo({
            url: '../ComprehensiveTest/comprehensiveTest',
        })
    },
    // 进入历史记录界面
    cm_enter_historyPage: function() {
        wx.navigateTo({
            url: '../historyList/history',
        })
    },
    // 历史记录条目点击回调
    onHistoryListViewClicked: function(e) {
        var id = e.target.id;
        console.log("Button ID: " + id);
        wx.navigateTo({
            url: '../history_view/history_view?id=' + id,
        })
    },
    // 断开蓝牙连接
    disconnectBleDevice: function () {
        var that = this;
        wx.showLoading({
            title: '断开连接',
        })
        // 断开连接
        wx.closeBLEConnection({
            deviceId: app.globalData.bleConnectedDeviceId,
            success: function (res) {
                console.log(res);
                app.globalData.bleConnectedDeviceId = null;
                app.globalData.bleConnectDeviceName = null;
                app.globalData.bleDeviceConnectState = false;
                that.setData({
                    BleConnectState: getApp().globalData.bleDeviceConnectState,
                    BleConnectName: getApp().globalData.bleConnectDeviceName,
                })
                // 提示成功
                wx.hideLoading();
                wx.showToast({
                    title: '断开成功',
                    icon: 'success'
                })
            },
            fail: function (res) {
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
    bindViewTap: function () {
        wx.redirectTo({
            url: '../logs/logs',
        })
    },

    onShow: function () {
        var that = this;
        this.setData({
            BleConnectState: getApp().globalData.bleDeviceConnectState,
            BleConnectName: getApp().globalData.bleConnectDeviceName,
        })

        wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // 设备连接异常断开
            if (!res.connected) {
                // 更新连接设备状态信息
                app.globalData.bleConnectedDeviceId = null;
                app.globalData.bleConnectDeviceName = null;
                app.globalData.bleDeviceConnectState = false;
                that.setData({
                    BleConnectState: getApp().globalData.bleDeviceConnectState,
                    BleConnectName: getApp().globalData.bleConnectDeviceName,
                })
            }
        })
        // 断开时更新页面连接状态显示
        if (that.data.BleConnectState) {
            wx.onBLECharacteristicValueChange(function (res) {
                console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`);
                console.log(util.hexCharCodeToStr(util.ab2hex(res.value)));
            })
        }

        /** 获取缓存数据（历史记录） */
        wx.getStorage({
            key: 'CMIOT_D5310A_HistoryData',
            success: function(res) {
                console.log(res);
                if(res.data.length > 5) {
                    that.setData({
                        historyData: res.data.slice(0,5),
                    })
                }
                else {
                    that.setData({
                        historyData: res.data,
                    })
                }
            },
            fail: function(res) {
                console.log(res);
                that.setData({
                    historyData: [],
                })
            }
        })
        
        /**获取系统缓存信息 */
        wx.getStorageInfo({
            success: function (res) {
                console.log(res.keys)
                console.log(res.currentSize)
                console.log(res.limitSize)
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log("homepage hided!");
    },
})


