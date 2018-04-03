//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {

    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res)

        wx.startBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res)

            setTimeout(function () {

              wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log(res)
                }
              })

              wx.createBLEConnection({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                deviceId: "0A39D3C6-1A51-2DCE-B5CF-8A280E56BA0B",
                success: function (res) {
                  console.log(res)
                },

              
              })


              setTimeout(function () {
                wx.getBLEDeviceServices({
                  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                  deviceId: "0A39D3C6-1A51-2DCE-B5CF-8A280E56BA0B",
                  success: function (res) {
                    console.log('device services:', res.services)
                    wx.getBLEDeviceCharacteristics({
                      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                      deviceId: "0A39D3C6-1A51-2DCE-B5CF-8A280E56BA0B",
                      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                      serviceId: "0003CDD0-0000-1000-8000-00805F9B0131",
                      success: function (res) {
                        console.log('device getBLEDeviceCharacteristics:', res.characteristics)

                        let buffer = new ArrayBuffer(5)
                        let dataView = new DataView(buffer)
                        dataView.setUint8(0, 0x31)
                        dataView.setUint8(1, 0x32)
                        dataView.setUint8(2, 0x33)
                        dataView.setUint8(3, 0x34)
                        dataView.setUint8(4, 0x35)

                        wx.writeBLECharacteristicValue({
                          // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                          deviceId: "0A39D3C6-1A51-2DCE-B5CF-8A280E56BA0B",
                          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                          serviceId: "0003CDD0-0000-1000-8000-00805F9B0131",
                          // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                          characteristicId: "0003CDD2-0000-1000-8000-00805F9B0131",
                          // 这里的value是ArrayBuffer类型
                          value: buffer,
                          success: function (res) {
                            console.log('writeBLECharacteristicValue success', res.errMsg)
                          }
                        })

                      }
                    })
                  },

                  complete: function (res) {
                    console.log(res)
                  }
                })

              }, 2000)

            }, 5000) //延迟时间 这里是1秒  
          }
        })
      }
    })

    

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
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


wx.onBluetoothDeviceFound(function (devices) {
  console.log('new device list has founded')
  console.dir(devices)
  // if (devices[0].name == "NB_Termial")
  // {
  //   wx.stopBluetoothDevicesDiscovery({
  //     success: function (res) {
  //       console.log(res)
  //     }
  //   })
    
  // }
  // console.log(ab2hex(devices[0].advertisData))
});


wx.onBLEConnectionStateChange(function (res) {
  // 该方法回调中可以用于处理连接意外断开等异常情况
  console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
})