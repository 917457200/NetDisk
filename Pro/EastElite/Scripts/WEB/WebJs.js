$(function () {

    //获取URL参数:jQuery 参数获取url已解密
    $.getUrlParam = function (name) {
        /*
        encodeURI();加密url
        decodeURI();解密url
        */
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return null;
    }
    $.getQueryStringByName = function (name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    }
    //转换字符串，错误数据显示空白
    $.toString = function (str) {
        if (typeof str == "undefined" || (str + "") == "" || str == null || str == "") {
            return "";
        } else {
            return str + "";
        }
    }

    //转换int，错误数据显示0
    $.toInt = function (str) {
        if (typeof str == "undefined" || str == null || str == "" || isNaN(parseInt(str))) {
            return 0;
        } else if (parseInt(str) < 0) {
            return 0;
        } else {
            return parseInt(str);
        }
    }
    $.isInteger = function (objid) {
        reg = /[^\-?\d]/g;
        var obj = $(objid);
        if (reg.test(obj)) {
            obj.val((obj.val().replace(reg, "")));

        }
    }
    //转换浮点数，错误数据显示0
    $.toFloat = function (str) {
        if (typeof str == "undefined" || str == null || str == "" || isNaN(parseFloat(str))) {
            return 0;
        } else {
            return $.toFixed(str, 2);
        }
    }

    //转换成XX.XX为小数，默认两位
    $.toFixed = function (str, length) {
        length = arguments.length > 1 ? length : 2;
        if (typeof str == "undefined" || str == null || str == "" || isNaN(parseFloat(str))) {
            return 0;
        } else {
            return parseFloat(parseFloat(str).toFixed(length));
        }
    }

    ///删除首位逗号
    $.toTrimComma = function (str) {
        return str.replace(/,$/g, "").replace(/^,/g, "")

    }
    $.currentDate = function () {
        /// <summary>日期格式化</summary>     
        /// <returns type="currentDate">The area.</returns>
        var myDate = new Date();

        var currentDate = {};
        currentDate.Year = myDate.getFullYear().toString();
        currentDate.Month = (myDate.getMonth() + 1).toString().length < 2 ? "0" + (myDate.getMonth() + 1).toString() : (myDate.getMonth() + 1).toString();
        currentDate.Day = myDate.getDate().toString().length < 2 ? "0" + myDate.getDate().toString() : myDate.getDate().toString();
        currentDate.Hours = myDate.getHours().toString().length < 2 ? "0" + myDate.getHours().toString() : myDate.getHours().toString();
        currentDate.Minutes = myDate.getMinutes().toString().length < 2 ? "0" + myDate.getMinutes().toString() : myDate.getMinutes().toString();
        currentDate.Seconds = myDate.getSeconds().toString().length < 2 ? myDate.getSeconds().toString() : myDate.getSeconds().toString();
        currentDate.ShortDate = currentDate.Year + "-" + currentDate.Month + "-" + currentDate.Day;
        currentDate.ShortTime = currentDate.Hours + ":" + currentDate.Minutes + ":" + currentDate.Seconds;
        currentDate.DateTime = currentDate.ShortDate + " " + currentDate.ShortTime;
        return currentDate;
    }
    //关闭页面弹出
    $.closezhezhao = function (elem, fullbg) {
        $("#" + fullbg).fadeOut(500);
        $("#" + elem).fadeOut(500);
        $("#" + fullbg).css("display", "none");
        $("#" + elem).css("display", "none");
        $("#" + elem).html("");
    }
    //定位及显示
    $.dingwei = function (elem, fullbg, whereTransfer) {
        var overlay, container, h, w;
        if (whereTransfer == "parent") {
            overlay = parent.$("#" + fullbg);
            container = parent.$("#" + elem);
            h = parent.document.documentElement;
            w = ($(parent.document).width() - container.width()) / 2;
        } else {
            overlay = $("#" + fullbg);
            container = $("#" + elem);
            h = document.documentElement;
            w = ($(document).width() - container.width()) / 2;
        }
        container.css("top", ((h.clientHeight - container.height()) / 2) + "px");
        container.css("left", w + "px");
        overlay.fadeIn(1000);
        container.fadeIn(1000);

        var dv = parent.document.getElementById("popup_title");
        var d = parent.document, x, y;
        dv.onselectstart = function () { return false; };
        dv.onmousedown = function (e) {
            e = e || window.event;
            x = e.clientX - container[0].offsetLeft;
            y = e.clientY - container[0].offsetTop;
            dv.onmousemove = function (e) {
                e = e || window.event;
                var el = e.clientX - x;
                var et = e.clientY - y;
                container.css("left", el + "px");
                container.css("top", et + "px");
            };

            d.onmouseup = function () { dv.onmousemove = null; };
        };


    }
    $.yan = function (elem, fullbg) {
        sign = String(random(1111, 999999));
    }

    $.Browser = function () {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
        var isSafari = userAgent.indexOf("Safari") > -1; //判断是否Safari浏览器
        var isChrome = userAgent.indexOf("Chrome") > -1;//判断是否Chrome浏览器
        if (isIE) {
            return "IE";
        }//isIE end
        if (isFF) {
            return "FF";
        }
        if (isChrome) {
            return "Chrome";
        }
        if (isOpera) {
            return "Opera";
        }
        if (isSafari) {
            return "Safari";
        }
    }
});
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
/*Ajax方法
  data：需要上传的数据
  beforeback：Ajax执行之前(回调函数)
  callback：Ajax获取请求后的数据(回调函数)
  url：请求地址
  datatype：数据类型
  lodingState：是否显示loding
  lodingMsg：loding 提示语
  async:：是否异步，默认异步
*/

function EDUCAjax() {
    var data = arguments[0];
    var beforeback = arguments[1];
    var callback = arguments[2];
    var url = arguments[3] + "?" + Math.random();
    var datatype = arguments.length > 4 ? arguments[4] : "json";
    var lodingState = arguments.length > 5 ? arguments[5] : false;
    var lodingMsg = arguments.length > 6 ? arguments[6] : "数据加载中，请耐心等待...";
    var async = arguments.length > 7 ? arguments[7] : true;

    // var loding = $("#id_loding");//loading提示
    $.ajax({
        type: "POST",
        dataType: datatype.toLowerCase(),
        //contentType: "application/json;charset=utf-8",
        url: url + "&" + Math.random(),
        async: async,
        beforeSend: function () {
            //显示loding提示
            if (lodingState) {
                //$("#id_lodingMsg").html(lodingMsg);
                //loding.show();
            }
            beforeback();
        },
        data: data,
        success: function (res) {
            //if (lodingState) {
            //    loding.hide();
            //}
            callback(res);
        },
        error: function () { }

    });
}

var getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
var delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
var setCookie = function (name, value, time) {
    var strsec = arguments.length > 2 ? getsec(arguments[2]) : getsec('d30');
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec * 1);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
}
function getsec(str) {

    var str1 = str.substring(1, str.length) * 1;
    var str2 = str.substring(0, 1);
    if (str2 == "s") {
        return str1 * 1000;
    }
    else if (str2 == "h") {
        return str1 * 60 * 60 * 1000;
    }
    else if (str2 == "d") {
        return str1 * 24 * 60 * 60 * 1000;
    }
}
//跳转地址，加随机数url:跳转路径，isparent是否从父窗体打开，默认false
function gotourl(url, isparent) {
    /*
     encodeURI();加密url
     decodeURI();解密url
     */
    isparent = arguments.length > 1 ? isparent : false;
    var par = '';
    if (url.indexOf('?') < 0) {
        par = '?';
    }
    else {
        par = '&';
    }
    if (isparent) {
        //window.parent.location.href = encodeURI(url + par + 'v=' + String(random(1111, 999999)));
        window.open(encodeURI(url + par + 'v=' + String(random(1111, 999999))));
    } else {
        location.href = encodeURI(url + par + 'v=' + String(random(1111, 999999)));
    }
}

$(window).resize(function () {
    var pTar = window.frames["left"];
    lowheight(pTar);
})

// 加载iframe 主窗体高度
function lowheight(iframe) {
    if (iframe != null) {
        iframe.height = $(window).height() - 120;
    }
}
function Laryer(Name, FunName) {
    var args = arguments.length > 2 ? arguments[2] : "";
    var args2 = arguments.length > 3 ? arguments[3] : "";
    var args3 = arguments.length > 4 ? arguments[4] : "";
    var args4 = arguments.length > 5 ? arguments[5] : "";

    var container, kuan = "";
    container = parent.$("#popup_container");
    container.html(kuan);
    kuan = kuan + "<div class=\"ui-draggable\"> <h1 id=\"popup_title\"class=\"widgettitle YIdong\" style=\"cursor: move;\">提示</h1><div id=\"popup_content\" class=\"widgetcontent\">";
    kuan = kuan + "  <div id=\"popup_message\" style=\" padding: 20px 15px;text-align: center;\">确定" + Name + "吗？</div>  <div style=\" padding: 10px 0px 20px;text-align: center;\" id=\"popup_panel\">";
    kuan = kuan + " <input type=\"button\" id=\"popup_ok\" style=\"min-width: 100px\" class=\"widgetcontent\" value=\"确定\" onclick=\"window.frames['left']." + FunName + "('" + args + "','" + args2 + "','" + args3 + "','" + args4 + "')\">";
    kuan = kuan + "  <input type=\"button\" id=\"popup_cancel\" style=\"min-width: 100px\" class=\"widgetcontent\" onclick=\"$.closezhezhao('popup_container','popup_overlay')\" value=\"取消\"></div></div></div>";
    container.append(kuan);
    $.dingwei('popup_container', 'popup_overlay', 'parent');
}