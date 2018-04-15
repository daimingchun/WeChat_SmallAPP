// pages/deviceInfo/deviceInfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

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
                }, 10000
            );
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
                        // wx.redirectTo({
                        //     url: '../index/index',
                        // })
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
            else {
                util.cm_ble_write("<Request>deviceInfo</Request>"); // 请求射频参数\
                that.data.timerId = setInterval(
                    function () {
                        if (app.globalData.bleDeviceConnectState) {

                            util.cm_ble_write("<Request>deviceInfo</Request>")
                        }
                    }, 5000
                );
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
        // 停止搜索
        wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
                console.log(res);
            },
        })
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    }
})

