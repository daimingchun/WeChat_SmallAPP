
//获取应用实例
var app = getApp()

var util = require('../../utils/util.js');  // 引用公共接口
var wxCharts = require('../../utils/wxcharts.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        signal: false,
        register: false,
        ping: false,
        comprehensive: false,
        signal_data: {
            earfcn: "",
            ecl: "",
            plmn: "",
            band: "",
            t3324: "",
            t3412: "",
            cellid: "",
            canvasLabels: [],
            timestamp: "",
            address_name: "",
            address_addr: "",
            comment: "",
        },
        register_data: {
            averageRegisterTime: 0,
            maxRegisterTime: 0,
            minRegisterTime: 0,
            registerCounts: 0,
            registerFailCounts: 0,
            successRate: 0,
            canvasLabels: [],
            timestamp: "",
            address_name: "",
            address_addr: "",
            comment: "",
        },
        ping_data: {
            averagepingTime: 0,
            maxpingTime: 0,
            minpingTime: 0,
            pingCounts: 0,
            pingFailCounts: 0,
            successRate: 0,
            canvasLabels: [],
            timestamp: "",
            address_name: "",
            address_addr: "",
            comment: "",
        },
        comprehensive_data: {
            registerAvrTimes: 0,
            registerMaxTimes: 0,
            registerMinTimes: 0,
            registerSuccessRate: 0,
            rssiAvr: 0,
            rssiMin: 0,
            rssiMax: 0,
            rssiSuccessRate: 0,
            snrAvr: 0,
            snrMin: 0,
            snrMax: 0,
            pingAvr: 0,
            pingMin: 0,
            pingMax: 0,
            pingSuccessRate: 0,
            canvasLabels: [],
            timestamp: "",
            address_name: "",
            address_addr: "",
            comment: "",
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var id = options.id;
        console.log("History id: " + id);
        wx.showLoading({
            title: '正在加载',
        })

        // 修改顶部导航条内容
        wx.setNavigationBarTitle({
            title: '查看记录'
        });

        wx.getStorage({
            key: 'CMIOT_D5310A_HistoryData',
            success: function (res) {
                console.log(res);
                var historyData = res.data;
                for (var i = 0; i < historyData.length; i++) {
                    if (historyData[i].timeStamp_t == id) {
                        if (historyData[i].testType == "信号测试") {

                            var tempData = {
                                earfcn : historyData[i].earfcn_t,
                                ecl : historyData[i].ecl_t,
                                plmn : historyData[i].plmn_t,
                                band : historyData[i].band_t,
                                t3324 : historyData[i].t3324_t,
                                t3412 : historyData[i].t3412_t,
                                cellid : historyData[i].cellid_t,
                                timestamp : historyData[i].timeStamp_t,
                                address_name : historyData[i].address_name,
                                comment : historyData[i].comment,
                                address_addr : historyData[i].address_addr,
                                apn: historyData[i].apn_t,
                            };

                            /**更新数据 */
                            that.setData({
                                signal: true,
                                signal_data: tempData,
                            })

                            that.data.signal_data.canvasLabels = historyData[i].canvasLabels_t;
                            // 绘制RSSI走势图
                            app.deviceInfo.then(function (deviceInfo) {
                                console.log('设备信息', deviceInfo)
                                new wxCharts({
                                    canvasId: 'signal_Canvas',
                                    type: 'line',
                                    categories: that.data.signal_data.canvasLabels,
                                    series: [{
                                        name: "RSSI(dBm)",
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].rssiData_t,
                                    },
                                    {
                                        name: "RSRQ(dBm)",
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].rsrqData_t,
                                    },
                                    {
                                        name: "RSRP(dBm)",
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].rsrpData_t,
                                    }],

                                    yAxis: {
                                        title: '信号强度',
                                        format: function (val) {
                                            return val.toFixed(1);
                                        },
                                        min: 0
                                    },
                                    dataLabel: false,
                                    width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                    height: 180,
                                    animation: false
                                });
                            })
                            // 绘制SNR走势图
                            app.deviceInfo.then(function (deviceInfo) {
                                console.log('设备信息', deviceInfo)
                                new wxCharts({
                                    canvasId: 'signal_snrCanvas',
                                    type: 'line',
                                    categories: that.data.signal_data.canvasLabels,
                                    series: [{
                                        name: 'SNR',
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].snrData_t,
                                    }],

                                    yAxis: {
                                        title: 'SNR (信噪比)',
                                        format: function (val) {
                                            return val.toFixed(1);
                                        },
                                        min: 0
                                    },
                                    dataLabel: false,
                                    width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                    height: 180,
                                    animation: false
                                });
                            })
                            // 绘制RSRQ走势图
                            // app.deviceInfo.then(function (deviceInfo) {
                            //     console.log('设备信息', deviceInfo)
                            //     new wxCharts({
                            //         canvasId: 'signal_rsrqCanvas',
                            //         type: 'line',
                            //         categories: that.data.signal_data.canvasLabels,
                            //         series: [{
                            //             name: "RSRQ(dBm)",
                            //             format: function (val) {
                            //                 return val.toFixed(0);
                            //             },
                            //             data: historyData[i].rsrqData_t,
                            //         }],

                            //         yAxis: {
                            //             title: 'RSRQ (参考信号接收质量)',
                            //             format: function (val) {
                            //                 return val.toFixed(1);
                            //             },
                            //             min: 0
                            //         },
                            //         dataLabel: false,
                            //         width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                            //         height: 180,
                            //         animation: false
                            //     });
                            // })
                        }
                        else if (historyData[i].testType == "驻网测试") {
                            var tempData = {
                                averageRegisterTime : historyData[i].averageRegisterTime_t,
                                maxRegisterTime : historyData[i].maxRegisterTime_t,
                                minRegisterTime : historyData[i].minRegisterTime_t,
                                registerCounts : historyData[i].registerCounts_t,
                                registerFailCounts : historyData[i].registerFailCounts_t,
                                successRate : historyData[i].successRate_t,
                                timestamp : historyData[i].timeStamp_t,
                                address_name : historyData[i].address_name,
                                comment : historyData[i].comment,
                                address_addr : historyData[i].address_addr,
                            }

                            /**更新数据 */
                            that.setData({
                                register: true,
                                register_data: tempData,
                            })

                            that.data.register_data.canvasLabels = historyData[i].canvasLabels_t;
                            // 绘制驻网时间走势图
                            app.deviceInfo.then(function (deviceInfo) {
                                console.log('设备信息', deviceInfo)
                                new wxCharts({
                                    canvasId: 'registerCanvas',
                                    type: 'line',
                                    categories: that.data.register_data.canvasLabels,
                                    series: [{
                                        name: '驻网时间（s）',
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].registerTime_t,
                                    }],

                                    yAxis: {
                                        title: '驻网时间（s）',
                                        format: function (val) {
                                            return val.toFixed(1);
                                        },
                                        min: 0
                                    },
                                    dataLabel: false,
                                    width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                    height: 180,
                                    animation: false
                                });
                            })
                        }
                        else if (historyData[i].testType == "PING测试") {
                            var tempData = {
                                averagepingTime : historyData[i].averagepingTime_t,
                                maxpingTime : historyData[i].maxpingTime_t,
                                minpingTime : historyData[i].minpingTime_t,
                                pingCounts : historyData[i].pingCounts_t,
                                pingFailCounts : historyData[i].pingFailCounts_t,
                                successRate : historyData[i].successRate_t,
                                timestamp : historyData[i].timeStamp_t,
                                address_name : historyData[i].address_name,
                                comment : historyData[i].comment,
                                address_addr : historyData[i].address_addr,
                            }

                            /**更新数据 */
                            that.setData({
                                ping: true,
                                ping_data: tempData,
                            })
                            that.data.ping_data.canvasLabels = historyData[i].canvasLabels_t;
                            // 绘制网络延时时间走势图
                            app.deviceInfo.then(function (deviceInfo) {
                                console.log('设备信息', deviceInfo)
                                new wxCharts({
                                    canvasId: 'pingCanvas',
                                    type: 'line',
                                    categories: that.data.ping_data.canvasLabels,
                                    series: [{
                                        name: '网络延迟（ms）',
                                        format: function (val) {
                                            return val.toFixed(0);
                                        },
                                        data: historyData[i].pingTime_t,
                                    }],

                                    yAxis: {
                                        title: '网络延迟（ms）',
                                        format: function (val) {
                                            return val.toFixed(1);
                                        },
                                        min: 0
                                    },
                                    dataLabel: false,
                                    width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                    height: 180,
                                    animation: false
                                });
                            })
                        }
                        else if (historyData[i].testType == "综合测试") {
                            var tempData = {
                                registerAvrTimes : historyData[i].registerAvrTimes_t,
                                registerMaxTimes : historyData[i].registerMaxTimes_t ,
                                registerMinTimes : historyData[i].registerMinTimes_t ,
                                registerSuccessRate : historyData[i].registerSuccessRate_t ,
                                rssiAvr : historyData[i].rssiAvr_t ,
                                rssiMin : historyData[i].rssiMin_t ,
                                rssiMax : historyData[i].rssiMax_t ,
                                rssiSuccessRate : historyData[i].rssiSuccessRate_t ,
                                snrAvr : historyData[i].snrAvr_t ,
                                snrMin : historyData[i].snrMin_t ,
                                snrMax : historyData[i].snrMax_t ,
                                pingAvr : historyData[i].pingAvr_t ,
                                pingMin : historyData[i].pingMin_t ,
                                pingMax : historyData[i].pingMax_t ,
                                pingSuccessRate : historyData[i].pingSuccessRate_t ,
                                timestamp: historyData[i].timeStamp_t,
                                address_name: historyData[i].address_name,
                                comment: historyData[i].comment,
                                address_addr: historyData[i].address_addr,
                            }
                            
                            /**更新数据 */
                            that.setData({
                                comprehensive: true,
                                comprehensive_data: tempData,
                            })

                            that.data.comprehensive_data.canvasLabels = historyData[i].canvasLabels_t;

                            /** 绘制驻网时间走势图 */
                            if (1) {
                                app.deviceInfo.then(function (deviceInfo) {
                                    console.log('设备信息', deviceInfo)
                                    new wxCharts({
                                        canvasId: 'comprehensive_registerCanvas',
                                        type: 'line',
                                        categories: that.data.comprehensive_data.canvasLabels,
                                        series: [{
                                            name: "驻网时间（秒）",
                                            format: function (val) {
                                                return val.toFixed(0);
                                            },
                                            data: historyData[i].attachTime_t,
                                        }],

                                        yAxis: {
                                            title: '驻网时间（秒）',
                                            format: function (val) {
                                                return val.toFixed(1);
                                            },
                                            min: 0
                                        },
                                        dataLabel: false,
                                        width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                        height: 180,
                                        animation: false
                                    });
                                })
                            }

                            /** 绘制网络延时走势图 */
                            if (1) {
                                app.deviceInfo.then(function (deviceInfo) {
                                    console.log('设备信息', deviceInfo)
                                    new wxCharts({
                                        canvasId: 'comprehensive_pingCanvas',
                                        type: 'line',
                                        categories: that.data.comprehensive_data.canvasLabels,
                                        series: [{
                                            name: "网络延时（ms）",
                                            format: function (val) {
                                                return val.toFixed(0);
                                            },
                                            data: historyData[i].pingDelay_t,
                                        }],

                                        yAxis: {
                                            title: '网络延时（ms）',
                                            format: function (val) {
                                                return val.toFixed(1);
                                            },
                                            min: 0
                                        },
                                        dataLabel: false,
                                        width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                        height: 180,
                                        animation: false
                                    });
                                })
                            }

                            /** 绘制RSSI走势图 */
                            if (1) {
                                app.deviceInfo.then(function (deviceInfo) {
                                    console.log('设备信息', deviceInfo)
                                    new wxCharts({
                                        canvasId: 'comprehensive_rssiCanvas',
                                        type: 'line',
                                        categories: that.data.comprehensive_data.canvasLabels,
                                        series: [{
                                            name: "RSSI(dBm)",
                                            format: function (val) {
                                                return val.toFixed(0);
                                            },
                                            data: historyData[i].rssi_t,
                                        }],

                                        yAxis: {
                                            title: 'RSSI(dBm)',
                                            format: function (val) {
                                                return val.toFixed(1);
                                            },
                                            min: 0
                                        },
                                        dataLabel: false,
                                        width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                        height: 180,
                                        animation: false
                                    });
                                })
                            }

                            /** 绘制SNR走势图 */
                            if (1) {
                                app.deviceInfo.then(function (deviceInfo) {
                                    console.log('设备信息', deviceInfo)
                                    new wxCharts({
                                        canvasId: 'comprehensive_snrCanvas',
                                        type: 'line',
                                        categories: that.data.comprehensive_data.canvasLabels,
                                        series: [{
                                            name: "SNR",
                                            format: function (val) {
                                                return val.toFixed(0);
                                            },
                                            data: historyData[i].snr_t,
                                        }],

                                        yAxis: {
                                            title: 'SNR',
                                            format: function (val) {
                                                return val.toFixed(1);
                                            },
                                            min: 0
                                        },
                                        dataLabel: false,
                                        width: Math.floor((deviceInfo.windowWidth) * 0.95), //canvas宽度
                                        height: 180,
                                        animation: false
                                    });
                                })
                            }
                    

                        }

                        wx.hideLoading();
                        wx.showToast({
                            title: '加载完成',
                            icon: "success",
                        })

                        return;
                    }
                }
                wx.hideLoading();
                wx.showModal({
                    title: '错误',
                    content: '数据匹配失败',
                })
            },
            fail: function (res) {
                console.log(res);
                wx.hideLoading();
                wx.showModal({
                    title: '错误',
                    content: '数据加载失败',
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
        // 重定向到首页
        wx.redirectTo({
            url: '../index/index',
        })
    },
})