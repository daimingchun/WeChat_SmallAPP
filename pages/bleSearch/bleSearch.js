//bleSearch.js
//获取应用实例
const app = getApp()

Page({
    // 初始化数据
    data: {
        bleDevice: [],
    },

    onLoad: function() {
        // 设置顶部导航条加载动画
        wx.showNavigationBarLoading();
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '搜索设备'
        });

        var that = this;
        // 打开蓝牙适配器
        wx.openBluetoothAdapter({
            success: function(res){
                console.log(res)
                // 开始搜索蓝牙设备
                wx.startBluetoothDevicesDiscovery({
                    allowDuplicatesKey: false,
                    success: function (res) {
                        console.log(res);

                        // 搜索到设备回调
                        wx.onBluetoothDeviceFound(function (res) {
                            console.log('New Bluetooth Device Founded!');
                            console.log(res);

                            var bleName = res.devices[0]['name'];

                            if(bleName == '')
                            {
                                bleName = "unknow device";
                            }

                            var newBleDevice = {
                                name: bleName,
                                deviceId: res.devices[0]['deviceId']
                            };

                            var temp = that.data.bleDevice;
                            temp.push(newBleDevice);
                            console.log(temp);
                            that.setData({
                                bleDevice: temp
                            })
                        })

                    },
                    fail: function(res) {
                        console.log(res)
                        // 短振动
                        wx.vibrateShort()
                        // 显示提示框
                        wx.showModal({
                            title: '提示',
                            content: '搜索蓝牙设备异常，请重启蓝牙后尝试！',
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
                })
            },

            // 蓝牙适配器打开失败
            fail: function(res){
                console.log(res)
                // 短振动
                wx.vibrateShort()
                // 显示提示框
                wx.showModal({
                    title: '提示',
                    content: '蓝牙适配器打开失败，请手动开启蓝牙功能后重试!',
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
        })
    },

    onBleDeviceClicked: function(e) {
        wx.hideLoading();
        // 显示连接提示框
        wx.showLoading({
            title: '正在连接...',
        })
       
        var targetDeviceId = e.target.id.split('@')[0];
        var targetDeviceName = e.target.id.split('@')[1];
        console.log(targetDeviceId + "/" + targetDeviceName);

        // 建立连接
        wx.createBLEConnection({
            deviceId: targetDeviceId,
            success: function (res) {
                console.log(res);
                // 获取服务
                wx.getBLEDeviceServices({
                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                    deviceId: targetDeviceId,
                    success: function (res) {
                        console.log('device services:', res.services)
                        // 获取特征值
                        wx.getBLEDeviceCharacteristics({
                            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                            deviceId: targetDeviceId,
                            // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                            serviceId: app.globalData.bleUsrServiceId,
                            success: function (res) {
                                console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                                //启用特征值变化的notify功能
                                wx.notifyBLECharacteristicValueChange({
                                    deviceId: targetDeviceId,
                                    serviceId: app.globalData.bleUsrServiceId,
                                    characteristicId: app.globalData.bleUsrReadCharacteristicId,
                                    state: true,
                                    success: function(res) {
                                        console.log(res);
                                        // 更新连接状态
                                        app.globalData.bleConnectDeviceName = targetDeviceName;
                                        app.globalData.bleConnectedDeviceId = targetDeviceId;
                                        app.globalData.bleDeviceConnectState = true;
                                        // 取消连接提示
                                        wx.hideLoading();
                                        wx.showToast({
                                            title: '连接成功',
                                            icon: 'success',
                                            duration: 1500,
                                            complete: function (res) {
                                                // 停止搜索
                                                wx.stopBluetoothDevicesDiscovery({
                                                    success: function (res) {
                                                        console.log(res);
                                                    }
                                                });
                                                // 回到首页
                                                wx.redirectTo({
                                                    url: '../index/index',
                                                })
                                            }
                                        })
                                    },
                                })
                            },
                            
                            // 失败回调
                            fail: function (res) {
                                wx.closeBLEConnection({
                                    deviceId: targetDeviceId,
                                    success: function (res) {
                                        console.log(res)
                                    },
                                })
                                console.log(res);
                                wx.hideLoading();
                                wx.showToast({
                                    title: '连接失败',
                                    icon: "none",
                                    duration: 1500
                                });
                            }
                        })
                    },
                    // 失败回调
                    fail: function (res) {
                        wx.closeBLEConnection({
                            deviceId: targetDeviceId,
                            success: function(res) {
                                console.log(res)
                            },
                        })
                        console.log(res);
                        wx.hideLoading();
                        wx.showToast({
                            title: '连接失败',
                            icon: "none",
                            duration: 1500
                        });
                    }
                })
            },
            // 失败回调
            fail: function(res){
                console.log(res);
                wx.hideLoading();
                wx.showToast({
                    title: '连接失败',
                    icon: "none",
                    duration: 1500,
                });
            }
        })
    },

    // 返回主页
    backHomePage: function() {
        // 停止搜索
        wx.stopBluetoothDevicesDiscovery({
            success: function(res) {
                console.log(res);
            },
        })
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    }
})


// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('');
}


// wx.onBLEConnectionStateChange(function (res) {
//     // 该方法回调中可以用于处理连接意外断开等异常情况
//     console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
//     // app.globalData.bleDeviceName = res.name
//     // app.globalData.bleDeviceState = res.connected
// })




