// pages/networkRegister/networkRegister.js

var wxCharts = require('../../utils/wxcharts.js');  // 引用公共接口

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        seriesData: [{
            //name:'test',
            format: function(val){
                return val.toFixed(2) + '万';
            },
            data: [11, 12, 13, 31, 21, 23, 23, 23, 23, 23, 24, 25, 24, 23, 22, 21, 21, 21]
        }],
    },

    addTestData: function(){
        var that = this;
        this.setData({
            seriesData: [{
                name: 'CSQ',
                format: function (val) {
                    return val.toFixed(2) + '万';
                },
                data: [10.15, null, 31, 0.37, 0.4, 0.8, 0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 0.15, 0.2, 0.45, 0.37, 0.4, 0.5,0.2,0.3]
            }]
        })
        console.log(this.data.seriesData);
        new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            series: that.data.seriesData,

            yAxis: {
                title: 'CSQ信号强度',
                format: function (val) {
                    return val.toFixed(1);
                },
                min: 0
            },
            dataLabel: false,
            width: 320,
            height: 200,
            animation: false
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: ['10:12:20', '10:12:21', '10:12:22', '10:12:23', '10:12:24', '10:12:25', '10:12:26', '10:12:27', '10:12:28', '10:12:29', '10:12:20', '10:12:20', '10:12:20', '10:12:20', '10:12:20', '10:12:20', '10:12:20', '10:12:20'],
            series: that.data.seriesData,
            // [{
            //     name: '成交量1',
            //     data: [0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 0.15, 0.2, 0.45, 0.37, 0.4, 1.5],
            //     format: function (val) {
            //         return val.toFixed(2) + '万';
            //     }
            // }, {
            //     name: '成交量2',
            //     data: [0.30, 0.37, 0.65, 0.78, 0.69, 0.94, 0.30, 0.37, 0.65, 0.78, 0.69, 0.94, 0.30, 0.37, 0.65, 0.78, 0.69, 3.5],
            //     format: function (val) {
            //         return val.toFixed(2) + '万';
            //     }
            // }],
            yAxis: {
                title: '成交金额 (万元)',
                format: function (val) {
                    return val.toFixed(1);
                },
                min: 0
            },
            dataLabel: false,
            width: 320,
            height: 200,
            animation :false,
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

    }
})

