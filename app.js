//app.js

let Promise = require('./libs/ES2015ponyfill/promise').Promise

App({
    onLaunch: function () {
        // 保持屏幕常亮
        wx.setKeepScreenOn({
            keepScreenOn: true,
            complete: function(res) {
                console.log(res);
            }
        })
        console.log('App Launch')
        this.deviceInfo = this.promise.getDeviceInfo();
    },
    globalData: {
        bleConnectDeviceName        : null,
        bleDeviceConnectState       : false,
        bleConnectedDeviceId        : null,
        bleUsrServiceId             : "0003CDD0-0000-1000-8000-00805F9B0131",
        bleUsrWriteCharacteristicId : "0003CDD2-0000-1000-8000-00805F9B0131",
        bleUsrReadCharacteristicId  : "0003CDD1-0000-1000-8000-00805F9B0131"
    },
    promise: {
        getDeviceInfo: function () {//获取设备信息
            let promise = new Promise((resolve, reject) => {
                wx.getSystemInfo({
                    success: function (res) {
                        resolve(res)
                    },
                    fail: function () {
                        reject()
                    }
                })
            })
            return promise
        }
    },
    getGid: (function () {//全局唯一id
        let id = 0
        return function () {
            id++
            return id
        }
    })()
})



