var util = require('../../utils/util.js');  // 引用公共接口

// history.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        historyData: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;

        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '测试记录列表'
        });

        /** 获取缓存数据（历史记录） */
        wx.getStorage({
            key: 'CMIOT_D5310A_HistoryData',
            success: function (res) {
                that.setData({
                    historyData: res.data,
                })
            },
            fail: function(res) {
                console.log(res);
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
            if ((that.data.bleRecvStr).indexOf("<Request>") != -1 && (that.data.bleRecvStr).indexOf("</Request>") != -1) {
                // 历史记录
                if ((that.data.bleRecvStr).indexOf("<historyList>") != -1 && (that.data.bleRecvStr).indexOf("</historyList>") != -1) {
                    
                    util.cm_ble_write("<Response>44242647216478296478239462719846214962398461278946</Response>");
                }

                // 历史记录数据
                if ((that.data.bleRecvStr).indexOf("<historyData>") != -1 && (that.data.bleRecvStr).indexOf("</historyData>") != -1) {

                    util.cm_ble_write("<Response>111111111111111111111111111111111111111111111111111111111111111</Response>");
                }

                that.setData({
                    bleRecvStr: "",
                })
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
    },
    // 历史记录条目点击回调
    onHistoryListViewClicked: function (e) {
        var id = e.target.id;
        console.log("Button ID: " + id);
        wx.navigateTo({
            url: '../history_view/history_view?id=' + id,
        })
    },
    // 清除全部历史记录
    onClearButtonClicked: function() {
        var that = this;
        wx.removeStorage({
            key: 'CMIOT_D5310A_HistoryData',
            success: function (res) {
                console.log(res.data)
                wx.showToast({
                    title: '已删除',
                    icon: "success",
                })
                /**更新数据 */
                that.setData({
                    historyData: [],
                })
            },
            fail: function(res) {
                console.log(res);
                wx.showModal({
                    title: '错误',
                    content: '删除出现未知错误，请重试！',
                    showCancel: false,
                })
            }
        })
    },

    // 删除记录点击回调
    onHistoryListDelClicked: function (e) {
        var that = this;
        var id = e.target.id;
        console.log("Del Button ID: " + id);
        var tempData = that.data.historyData;
        for (var i = 0; i < tempData.length; i++) {
            if (tempData[i].timeStamp_t == id) {
                tempData.splice(i,1);
                wx.setStorage({
                    key: 'CMIOT_D5310A_HistoryData',
                    data: tempData,
                    success: function() {
                        wx.showToast({
                            title: '删除成功',
                            icon: "success",
                            duration: 1500,
                        })
                        /**更新数据 */
                        that.setData({
                            historyData: tempData,
                        })
                    },
                    fail: function(res) {
                        wx.showToast({
                            title: '删除失败',
                            icon: "none",
                            duration: 1500,
                        })
                    }
                })
            }
        }
    }
})
