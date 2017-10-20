
var DFBGShare = { FlieShare: {} }
var OptionFile = (function (opt) {
    var o = {
        length: 0
    };
    var o = $.extend(o, opt),
        _body = $('body'),
        boxBg = '<div id="select"></div>';

    return {
        actionLock: false, //移动锁定
        releaseTarget: false, //释放锁定
        keyCode: null,   //当前按键 键值
        //鼠标按下操作
        optionDown: function (length, type, evt) {
            this.releaseTarget = false;
            this.getImgList(length);
            var currentX = evt.pageX;
            var currentY = evt.pageY;
            $('#select').css({
                top: currentY + 1,
                left: currentX + 1
            })
        },
        //鼠标移动操作
        optionMoving: function (length, type, evt) {
            if (this.actionLock) {
                this.optionDown(length, type, evt);
            }
        },
        getImgList: function (length) {

            if (length > 10) {
                length = parseInt(length / 10);
            }
            if (length > 100) {
                length = parseInt(length / 100);
            }
            if (!this.actionLock) {
                _body.append(boxBg);
                var movingBox = '<em>' + length + '</em>';
                $("#select").html(movingBox);
            }
            this.actionLock = true;
        },
        //放开鼠标操作(回调函数，返回按键键值和当前目标)
        closeOption: function (func) {
            var _this = this;
            $(document).keydown(function (event) {
                _this.keyCode = event.keyCode;
                $(document).on('mouseup', function (e) {
                    if (!_this.releaseTarget) {
                        $('.moving-box').remove();
                        _this.actionLock = false;
                        $(document).unbind('mousemove');
                        _this.releaseTarget = true;
                        func(e, _this.keyCode);                  //返回当前 释放的  目标元素  ，  和按键code
                        $(document).unbind('keydown');
                        _this.keyCode = null;
                    }
                })
            });
            $(document).trigger("keydown");
            $(document).keyup(function (event) {
                $(document).unbind('keyup');
                $(document).unbind('keydown');
                _this.keyCode = null;
            })
        }
    }
})
DFBGShare.FlieShare.Flie = {
    //我的网盘页面数据加载
    MyFileLoad: function (FileId, Name) {
        var _base = DFBGFlie.Flie.FlieOperation;
        var _base2 = DFBGShare.FlieShare.Flie;

        _base.AjaxList("/SchoolShare/FileLoad", { FileId: FileId, SearchName: Name },
            function (re, status) {
                var data = re.model;
                if (status == "success") {
                    var htmlInfo = "";//大图标展示
                    var htmlList = "";//列表展示
                    if (data.length != 0) {
                        //共多少个文件
                        $("#SumNum").html("已全部加载，共" + data.length + "个");

                        for (var i = 0; i < data.length; i++) {
                            var model = data[i];

                            htmlInfo += "<li id=\"add" + model.FileId + "\" href=\"javascript:;\" class=\"grid-view-item open-enable\" style=\"display: block;\">";
                            htmlInfo += " <div class=\"FileShow\"  title=\"" + model.FileName + "\">";
                            //****图标***
                            //判断是否是文件夹，如果是文件夹连接为打开文件夹，如果不是文件夹，连接为下载连接
                            if (model.IsFolder == true) {
                                htmlInfo += " <div onclick=\"DFBGShare.FlieShare.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\">";
                                //------ 修改文件夹样式
                            }
                            else {

                                htmlInfo += " <div onclick=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\">";
                            }
                            //判断文件的类型，调用不同的文件图片样式
                            if (model.IsFolder == true) {//文件夹
                                htmlInfo += "<span  class=\"fileicon dir-large\">";
                            }
                            else {
                                switch (model.FileExtName) {
                                    case ".jpg":
                                    case ".png":
                                    case ".jpeg":
                                    case ".gif":
                                    case ".bmp":
                                        //图片
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-pic fileicon-all\">";
                                        htmlInfo += "<img class=\"thumb db-none\" style=\"width:100px;height:100px;\" data-url=\"/File/ImgSuoLue?FileId=" + model.FileId + "\" src=\"\">";
                                        break;
                                    case ".docx":
                                    case ".doc":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-doc\">";
                                        break;
                                    case ".xls":
                                    case ".xlsx":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-xls\">";
                                        break;
                                    case ".txt":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-txt\">";
                                        break;
                                    case ".rar":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-rar\">";
                                        break;
                                    case ".zip":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-zip\">";
                                        break;
                                    case ".pdf":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-pdf\">";
                                        break;
                                    case ".flv":
                                    case ".mp4":
                                    case ".mkv":
                                    case ".rmvb":
                                    case ".avi":
                                    case ".swf":
                                    case ".wmv":
                                    case ".3gp":
                                    case ".mpeg":
                                    case ".mpg":
                                    case ".rm":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-video\">";
                                        break;
                                    case ".exe":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-exe\">";
                                        break;
                                    case ".psd":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-psd\">";
                                        break;
                                    case ".mp3":
                                    case ".wma":
                                    case ".wav":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-mp3\">";
                                        break;
                                    case ".ppt":
                                    case ".pptx":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-ppt\">";
                                        break;
                                    case ".xmind":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-xmind\">";
                                        break;
                                    default:
                                        htmlInfo += "<span  class=\"fileicon fileicon-all\">";
                                        break;
                                }
                            }
                            htmlInfo += "</span>";

                            htmlInfo += "</div>";
                            htmlInfo += "<label onmousedown=\"ClickSelCss('add" + model.FileId + "')\" class=\"checkbox\"></label>";
                            htmlInfo += "</div>";


                            if (model.FileName.length > 6) {
                                htmlInfo += "<div class=\"file-name\"><span title=\"" + model.FileName + "\" class=\"filename\">" + model.FileName.substr(0, 6) + "..." + model.FileExtName + "</span></div> ";
                            }
                            else {
                                htmlInfo += "<div class=\"file-name\"><span title=\"" + model.FileName + "\" href=\"javascript:void(0);\" class=\"filename\">" + model.FileName + "</span></div>";
                            }
                            htmlInfo += "</li>";
                            //****图标***


                            //****List方式展示***
                            htmlList += "<div class=\"g-clearfix list-view-item open-enable\">";

                            //判断文件的类型调不同的图标样式
                            if (model.IsFolder == true) {//文件夹
                                //---GYF 新增
                                htmlList += "<input type=\"checkbox\" onclick=\"YzCheAll()\" class=\"checkbox1\" name=\"cheName\" value=\"" + model.FileId + "\" />";
                                //--------
                                htmlList += "<div class=\"fileicon  dir-small\"></div>";
                                //htmlList += "<span class=\"checkbox\"></span>";
                            }
                            else {
                                //非文件夹放选择框
                                htmlList += "<input type=\"checkbox\" onclick=\"YzCheAll()\" class=\"checkbox1\" name=\"cheName\" value=\"" + model.FileId + "\" />";
                                //图片
                                switch (model.FileExtName) {
                                    case ".jpg":
                                    case ".png":
                                    case ".jpeg":
                                    case ".jpg":
                                    case ".gif":
                                    case ".bmp":
                                        //图片
                                        htmlList += "<div  class=\"fileicon fileicon-small-pic\"></div>";

                                        break;
                                    case ".docx":
                                    case ".doc":
                                        htmlList += "<div  class=\"fileicon fileicon-small-doc\"></div>";
                                        break;
                                    case ".xls":
                                    case ".xlsx":
                                        htmlList += "<div  class=\"fileicon fileicon-small-xls\"></div>";
                                        break;
                                    case ".txt":
                                        htmlList += "<div  class=\"fileicon fileicon-small-txt\"></div>";
                                        break;
                                    case ".rar":
                                        htmlList += "<div  class=\"fileicon fileicon-small-rar\"></div>";
                                        break;
                                    case ".zip":
                                        htmlList += "<div  class=\"fileicon fileicon-small-zip\"></div>";
                                        break;
                                    case ".pdf":
                                        htmlList += "<div  class=\"fileicon fileicon-small-pdf\"></div>";
                                        break;
                                    case ".flv":
                                    case ".mp4":
                                    case ".mkv":
                                    case ".rmvb":
                                    case ".avi":
                                    case ".swf":
                                    case ".wmv":
                                    case ".3gp":
                                    case ".mpeg":
                                    case ".mpg":
                                    case ".rm":
                                        htmlList += "<div  class=\"fileicon fileicon-small-video\"></div>";
                                        break;
                                    case ".exe":
                                        htmlList += "<div  class=\"fileicon fileicon-small-exe\"></div>";
                                        break;
                                    case ".psd":
                                        htmlList += "<div  class=\"fileicon fileicon-small-psd\"></div>";
                                        break;
                                    case ".mp3":
                                    case ".wma":
                                    case ".wav":
                                        htmlList += "<div  class=\"fileicon fileicon-small-mp3\"></div>";
                                        break;
                                    case ".ppt":
                                    case ".pptx":
                                        htmlList += "<div  class=\"fileicon fileicon-small-ppt\"></div>";
                                        break;
                                    case ".xmind":
                                        htmlList += "<div  class=\"fileicon fileicon-small-xmind\"></div>";
                                        break;
                                    default:
                                        htmlList += "<div  class=\"fileicon fileicon-small\"></div>";
                                        break;
                                }

                            }
                            htmlList += "<div style=\"width: 50%\" class=\"file-name\">";
                            htmlList += "<div class=\"text\">";
                            //判断是否是文件夹，如果是文件夹连接为打开文件夹
                            if (model.IsFolder == true) {
                                htmlList += "<a onclick=\"DFBGShare.FlieShare.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\"  class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                            }
                            else {
                                htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\" class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                            }

                            htmlList += "<div class=\"operate\">";
                            htmlList += "<div style=\"position: absolute; top: 0px; padding-top: 0px; line-height: normal;\">";

                            //（文件夹不放下载按钮和分享按钮）  
                            if (model.IsFolder != true) {
                                htmlList += "<a href=\"/File/DownFile?FileId=" + model.FileId + "\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"下载\" class=\"icon icon-download-blue\"></em></span></a>";
                            }
                            else {
                                //htmlList += "<a class=\"g-button\"></a><a class=\"g-button\"></a>";
                            }
                          
                            htmlList += "    </div>";
                            htmlList += "</div>";
                            htmlList += "</div>";

                            htmlList += "<div style=\"width: 16%\" class=\"file-size\">" + DFBGFlie.Flie.FlieOperation.GetFileSize(model.FileSizeKb) + "</div>";

                            var date = new Date(parseInt(model.FileCreateTime.replace("/Date(", "").replace(")/", ""), 10));
                            htmlList += "<div style=\"width: 10%\" class=\"ctime\">已分享</div>";
                            htmlList += "<div style=\"width: 10%\" class=\"ctime\">" + model.CreateName + "</div>";
                            htmlList += "<div style=\"width: 13%\" class=\"ctime\">" + date.Format("yyyy-MM-dd hh:mm") + "</div>";

                            htmlList += "</div>";
                            htmlList += "</div>";


                        }

                    } else {
                        htmlList += "<div class=\"aGMvFtb\">";
                        htmlList += "<div class=\"hqvyGW05 wegnv3JM\">";
                        htmlList += "<p class=\"ggEQwFb\">";
                        htmlList += " 还没分享文件哦";
                        htmlList += "</p>";
                        htmlList += "</div>";
                        htmlList += "</div>";
                        htmlInfo = htmlList;
                    }
                    //***List列表显示默认加一个文件夹放项目文件
                    $("#FileShowList").html(htmlList);

                    //***图标显示默认加一个文件夹放项目文件
                    $("#FileShow").html(htmlInfo);

                    $(".module-list-view .list-view-item").hover(function () {
                        $(this).children(".file-name").children(".operate").toggle();
                    });
                    if ($(".list-view-item").length > 3) {
                        $(".list-view-item:last .operate .menu").css({ "left": "-40px", "top": "-50px" });
                    }
                    var optionImg = new OptionFile();
                    $(".module-grid-view .grid-view li").on("mousedown", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var activelength = $(".item-active").length;
                        var loop = setTimeout(function () {
                            optionImg.optionDown(activelength, 1, e);
                            $(document).mousemove(function (e) {
                                optionImg.optionMoving(activelength, 1, e);
                                optionImg.closeOption(function (e, keycode) {
                                    var target = e.target.className;//目标位置  可以判断目标不同位置执行不同操作
                                    $("#select").remove();
                                    if (target == "filename" || target == "fileicon dir-large" || target == "grid-view-item open-enable") {
                                        var MoveFileId = "";
                                        var treeviewId = "";
                                        var swich = getCookie("ShowType");
                                        if (swich == "grid") {
                                            var cssId = $(".item-active");
                                            for (var i = 0; i < cssId.length; i++) {
                                                MoveFileId += cssId[i].id + ",";
                                            }
                                        }

                                        switch (target) {
                                            case "filename":
                                                treeviewId = $(e.target).parent().parent().attr("id").replace("add", "");
                                                break;
                                            case "fileicon dir-large":
                                                treeviewId = $(e.target).parent().parent().parent().attr("id").replace("add", "");
                                                break;
                                            case "grid-view-item open-enable":
                                                treeviewId = $(e.target).attr("id").replace("add", "");
                                                break;
                                            default:

                                                break;
                                        }
                                        if (treeviewId != "") {
                                            _base2.TuoMoVe(MoveFileId, treeviewId);
                                        }
                                    }
                                });
                            });
                        }, 200);
                        $(document).mouseup(function () {
                            clearTimeout(loop);
                        });
                    })
                    _base.SetContainerHeight();
                    $("img").load(function () {
                        //图片默认隐藏  
                        $(this).hide();
                        //使用fadeIn特效  
                        $(this).stop().fadeIn("5000");
                    });
                    // 异步加载图片，实现逐屏加载图片
                    $(".grid-view-item").scrollLoading();

                }
            }
         );
    },
    InFileOnlode: function (fileId) {
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/ShareFileALLNavigation", { parentFileId: fileId }, function (data) {
            if (data != "") {
                $("#TitleIds").append(data);
            }
        }, true);
    },
    FileClick: function (fileId) {
        window.location.href = "/SchoolShare/School?FileId=" + fileId;
    },
    ShareFileMethod: function () {
        window.location.href = "/SchoolShare/School?FileId=";
    },
    TuoMoVe: function (MoveFileId, treeviewId) {
        var url = "../File/FileMoveTo";
        var par = { FileIdList: MoveFileId, WhereId: treeviewId, MoveType: 2, Share: "1001" }

        EDUCAjax(par, function () {
            $.closezhezhao('popup_container', 'popup_overlay');
            if ($(".module-tip").length == 0) {
                $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -77.5px;\"></div>");
            }
            $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-loading\"></i><span class=\"tip-msg\">正在移动文件，请稍候…</span></div></span></div>");
            $(".module-tip").css("display", "block");
        },
        function (data) {
            if (data == "suc") {
                if ($(".module-tip").length == 0) {
                    $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
                } else {
                    $(".module-tip").css("margin-left", "-48.5px");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件移动成功</span></div>");
                $(".module-tip").css("display", "block");
                window.location.reload();
                setTimeout("$(\".module-tip\").hide()", 5000);
            } else {
                if ($(".module-tip").length == 0) {
                    $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
                } else {
                    $(".module-tip").css("margin-left", "-48.5px");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件移动失败</span></div>");
                $(".module-tip").css("display", "block");
                window.location.reload();
                setTimeout("$(\".module-tip\").hide()", 5000);
            }
        }, url, "html", false, "", false);
    }
}
