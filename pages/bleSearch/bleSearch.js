//bleSearch.js
//获取应用实例
const app = getApp()

var bleDeviceList = new Array();

Page({
    // 初始化数据
    data: {
        bleDevice: bleDeviceList,
    },

    onLoad: function() {
        // 设置顶部导航条加载动画
        wx.showNavigationBarLoading();
        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '搜索设备...'
        });

        // 打开蓝牙适配器
        wx.openBluetoothAdapter({
            success: function(res){
                console.log(res)
                // 开始搜索蓝牙设备
                wx.startBluetoothDevicesDiscovery({
                    success: function (res) {
                        console.log(res)
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
                                    wx.navigateTo({
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
                            wx.navigateTo({
                                url: '../index/index',
                            })
                        }
                    }
                })
            }
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


// 搜索到设备回调
wx.onBluetoothDeviceFound(function (res) {
    console.log('New Bluetooth Device Founded!');
    console.log(res);
    var bleName = res.devices[0]['name'];
    // if (name != '' && name.indexOf('NB_Terminal') != -1) {
    //     var deviceId = res.devices[0]['deviceId'];
    // }
    if (bleName == ''){
        bleName = "unknow device";
    }

    var searchedDevice = {
        name: bleName,
        deviceId: res.devices[0]['deviceId']
    }
    Page.data.bleDevice.push(searchedDevice);
})



wx.onBLEConnectionStateChange(function (res) {
    // 该方法回调中可以用于处理连接意外断开等异常情况
    console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
})

