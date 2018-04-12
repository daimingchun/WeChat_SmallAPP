//app.js
App({
    onLaunch: function () {
        // 保持屏幕常亮
        wx.setKeepScreenOn({
            keepScreenOn: true,
            complete: function(res) {
                console.log(res);
            }
        })
    },
    globalData: {
        bleConnectDeviceName        : null,
        bleDeviceConnectState       : false,
        bleConnectedDeviceId        : null,
        bleUsrServiceId             : "0003CDD0-0000-1000-8000-00805F9B0131",
        bleUsrWriteCharacteristicId : "0003CDD2-0000-1000-8000-00805F9B0131",
        bleUsrReadCharacteristicId  : "0003CDD1-0000-1000-8000-00805F9B0131"
    }
})



