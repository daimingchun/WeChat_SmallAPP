
const app = getApp()

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

// 字符串转ArrayBuffer
function char2buf(str) {
    var out = new ArrayBuffer(str.length);
    var u8a = new Uint8Array(out);
    var strs = str.split("");
    for (var i = 0; i < strs.length; i++) {
        u8a[i] = strs[i].charCodeAt();
    }
    return out;
}


function cm_ble_write_offset(str, offset) {
    if (offset + 20 < str.length) {
        wx.writeBLECharacteristicValue({
            // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
            deviceId: app.globalData.bleConnectedDeviceId,
            // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
            serviceId: app.globalData.bleUsrServiceId,
            // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
            characteristicId: app.globalData.bleUsrWriteCharacteristicId,
            // 这里的value是ArrayBuffer类型
            value: char2buf(str.slice(offset, offset + 20)),
            complete: function (res) {
                console.log(res);
                offset += 20;
                // 递归发送数据
                cm_ble_write_offset(str, offset);
            },
        })
    }
    else {
        wx.writeBLECharacteristicValue({
            // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
            deviceId: app.globalData.bleConnectedDeviceId,
            // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
            serviceId: app.globalData.bleUsrServiceId,
            // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
            characteristicId: app.globalData.bleUsrWriteCharacteristicId,
            // 这里的value是ArrayBuffer类型
            value: char2buf(str.slice(offset, str.length)),
            complete: function (res) {
                console.log(res);
            },
        })
    }
}


// 发送蓝牙数据
function cm_ble_write(str) {
    console.log("cm_ble_write(" + str + ")");
    cm_ble_write_offset(str, 0);
}


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


function hexCharCodeToStr(hexCharCodeStr) {
        var len = hexCharCodeStr.length;
        if (len % 2 !== 0) {
            console.log("Error HexString: " + hexCharCodeStr);
            return "";
        }
        console.log("HexString: " + hexCharCodeStr);
        var curCharCode;
        var resultStr = [];
        for (var i = 0; i < len; i = i + 2) {
            curCharCode = parseInt(hexCharCodeStr.substr(i, 2), 16);
            resultStr.push(String.fromCharCode(curCharCode));
        }
        return resultStr.join("");
}


function pageScrollToBottom () {
    wx.createSelectorQuery().select('#atPage').boundingClientRect(function (rect) {
        // 使页面滚动到底部
        wx.pageScrollTo({
            scrollTop: rect.bottom,
        })
    }).exec()
}


module.exports = {
    formatTime: formatTime,
    cm_ble_write: cm_ble_write,
    char2buf: char2buf,
    ab2hex: ab2hex,
    hexCharCodeToStr: hexCharCodeToStr,
    pageScrollToBottom: pageScrollToBottom,
}
