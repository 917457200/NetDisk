
var DFBG = { FlieOAImg: {} }
var src = "";//根据屏幕加载适应尺寸的图片
var rotateindex = 0;//旋转度
DFBG.FlieOAImg.FlieImg = {

    dirName: function (ParentFileId) {
        //点击文件夹返回主界面
        var _base = DFBGFlie.Flie.FlieOperation;
        if (ParentFileId != "") {
            parent.window[0].window.location.href = "/MyFile/MyFile?FileId=" + ParentFileId;
        }
        _base.ImgShow();
    },
    ImgDownLoad: function () {
        var FileId = $("#viewpic-image").attr("fileid");
        DFBGFlie.Flie.FlieOperation.DownLoad(FileId);
    },
    ImgShareMethod: function () {
        var FileId = $("#viewpic-image").attr("fileid");
        DFBGFlie.Flie.FlieOperation.ShareTransfer(FileId, 'img');
    },
    Transfer: function (obj) {
        var FileId = $("#viewpic-image").attr("fileid");
        DFBGFlie.Flie.FlieOperation.Transfer(FileId, obj);
    },
    Onload: function () {
        var WWidth = $(window).width();
        if (WWidth < 1024) {
            WWidth = 1024;
        }
        var retractWidth = 0;
        if (!$(".retract").hasClass("retract-icon-hide")) {
            retractWidth = 253;
        }

        //自适应加载图片外围框架
        $(".dlg-bd").css({ "width": WWidth - retractWidth + "px", "height": $(window).height() + "px" });
        $(".module-thumbnailPic").css("width", WWidth - retractWidth + "px");
        $(".module-showPic").css({ "width": WWidth - (retractWidth + 120) + "px", "height": $(window).height() + "px" });
        $(".module-thumbnailPic").children().css("width", WWidth - retractWidth + "px");
        var image = $("#viewpic-image");//图片DOM

        var base = DFBG.FlieOAImg.FlieImg;
        //自适应加载图片
        base.imageSizeReload(retractWidth, image);
    },
    imageSizeReload: function (retractWidth, image) {
        //自适应加载图片宽高
        var _base = DFBG.FlieOAImg.FlieImg;
        var ThisAttribute = _base.ImageAttribute(image);
        var w = 0, h = 0;

        if (src == "") {
            //设置图片路径
            var fileid = image.attr("fileid");
            src = "/File/ImgLow?FileId=" + fileid + "&W=" + ThisAttribute.windowWidth + "&H=" + ThisAttribute.windowHeight;
            image.attr("src", src);
        }
        //是否超出以前宽高
        if (ThisAttribute.YuanWidth <= ThisAttribute.windowWidth && ThisAttribute.YmageHeight <= ThisAttribute.windowHeight) {
            image.css("height", ThisAttribute.YmageHeight + "px");
            image.css("width", ThisAttribute.YuanWidth + "px");
            w = (ThisAttribute.windowWidth - ThisAttribute.YuanWidth) / 2;
            h = (ThisAttribute.windowHeight - ThisAttribute.YmageHeight) / 2;
            image.css({ "top": h + "px", "left": w + "px" });
            return;
        }
        //进行等比例缩放
        var resultWidth = ThisAttribute.windowWidth;
        var resultHeight = resultWidth * ThisAttribute.YmageHeight / ThisAttribute.YuanWidth;
        if (resultHeight > ThisAttribute.windowHeight) {
            resultHeight = ThisAttribute.windowHeight;
            resultWidth = resultHeight * ThisAttribute.YuanWidth / ThisAttribute.YmageHeight;
            if (resultWidth > ThisAttribute.windowWidth) {
                resultWidth = ThisAttribute.windowWidth;
            }
        }
        //设置宽高及定位
        image.css("height", resultHeight + "px");
        image.css("width", resultWidth + "px");
        w = (ThisAttribute.windowWidth - resultWidth) / 2;
        h = (ThisAttribute.windowHeight - resultHeight) / 2;
        image.css({ "top": h + "px", "left": w + "px" });
    },
    XuanZhuan: function (direction) {
        var image = $("#viewpic-image");//图片DOM
        var _base = DFBG.FlieOAImg.FlieImg;
        var ThisAttribute = _base.ImageAttribute(image);///获取图片属性
        var w = 0, h;
        if (direction == "left") {
            rotateindex++;
        } else {
            rotateindex--;
        }
        image.addClass("transform");
        var deg = rotateindex * 90 + 'deg';
        image.css({ 'transform': 'rotate(' + deg + ')', "transform-origin": "50% 50%" });
        //是否超出以前宽高
        if (ThisAttribute.YuanWidth <= ThisAttribute.windowWidth && ThisAttribute.YmageHeight <= ThisAttribute.windowHeight) {
            w = (ThisAttribute.windowWidth - ThisAttribute.imageWidth) / 2;
            h = (ThisAttribute.windowHeight - ThisAttribute.imageHeight) / 2;
            image.css({ "top": h + "px", "left": w + "px" });
            return;
        }
        if (rotateindex % 2 != 0) {
            //设置宽高及定位
            image.css("height", ThisAttribute.imageHeight * ThisAttribute.YmageHeight / ThisAttribute.YuanWidth + "px");
            image.css("width", ThisAttribute.imageHeight + "px");
            w = (ThisAttribute.windowWidth - ThisAttribute.imageHeight) / 2;
            h = (ThisAttribute.windowHeight - ThisAttribute.imageHeight * ThisAttribute.YmageHeight / ThisAttribute.YuanWidth) / 2;
        } else {
            //设置宽高及定位
            image.css("height", ThisAttribute.imageWidth + "px");
            image.css("width", ThisAttribute.imageWidth * ThisAttribute.YuanWidth / ThisAttribute.YmageHeight + "px");
            w = (ThisAttribute.windowWidth - ThisAttribute.imageWidth * ThisAttribute.YuanWidth / ThisAttribute.YmageHeight) / 2;
            h = (ThisAttribute.windowHeight - ThisAttribute.imageWidth) / 2;
        }
        image.css({ "top": h + "px", "left": w + "px" });
    },
    ImageAttribute: function (image) {
        //图像属性集合
        var Attribute = {
            imageWidth: image.width(),//图片宽
            imageHeight: image.height(),//图片高
            YuanWidth: image.attr("width"),//图片原来宽
            YmageHeight: image.attr("height"),//图片原来高
            windowWidth: $(".module-showPic").width(),///父容器宽
            windowHeight: $(".module-showPic").height()///父容器高
        }
        return Attribute;
    },
    PreArrow: function (fileid, arrow, parentFileId) {
        var _base = DFBG.FlieOAImg.FlieImg;
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/ImgNext", { FileId: fileid, Arrow: arrow, ParentFileId: parentFileId }, function (data) {
            var Browser = $.Browser();
            if (data.FileInfo != null) {
                var image = $("#viewpic-image");//图片DOM
                image.hide();
                if (Browser == "IE") {
                    $(".loading-gif").show();
                } else {
                    $(".loading-container").show();
                }
                src = "/File/ImgLow?FileId=" + data.FileInfo.FileId + "&W=" + $(".module-showPic").width() + "&H=" + $(".module-showPic").height();
                image.attr({ "src": src, "fileid": data.FileInfo.FileId, "width": data.Width, "height": data.Height });
                $(".large-pic a").attr("href", src);
                image.load(function () {
                    _base.Onload();
                    $(this).show();
                    $(".loading-container").hide();
                    $(".loading-gif").hide();
                });

            } else {
                var str = "";
                if (arrow == "left") {
                    str = "已经是第一张图片啦";
                } else {
                    str = "已经是最后一张图片啦";
                }
                if ($(".module-tip").length == 0) {
                    $(".module").append("<div class=\"module-tip\" style=\"top: 65px; left: 50%; margin-left: -66.5px;\"></div>");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-caution\"></i><span class=\"tip-msg\">" + str + "</span></div>");
                $(".module-tip").show();
                setTimeout("$(\".module-tip\").hide()", 2000);
            }
        }, false, "json");

    }
}
