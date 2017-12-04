
var DFBG = { FlieOA: {} }
var maxListnum = 0, maxGridnum = 0;
var SumListNum = 0;
var SumGridNum = 0;

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
DFBG.FlieOA.Flie = {
    //我的网盘页面数据加载
    MyFileLoad: function (FileId, Name) {
        var _base = DFBGFlie.Flie.FlieOperation;
        var _base2 = DFBG.FlieOA.Flie;

        _base.AjaxList("/MyFile/MyFileLoad", { FileId: FileId, SearchName: Name },
            function (re, status) {
                var data = re.model;
                if (status == "success") {
                    var htmlInfo = "";//大图标展示
                    var htmlList = "";//列表展示
                    if (data.length != 0) {
                        //共多少个文件
                        $("#SumNum").html("已全部加载，共" + data.length + "个");
                        $("#SumUse").html("磁盘空间已使用：" + DFBGFlie.Flie.FlieOperation.GetFileSize(re.SumSize) + " 未使用：" + DFBGFlie.Flie.FlieOperation.GetFileSize(parseFloat(re.UserSize) - parseFloat(re.SumSize)));

                        for (var i = 0; i < data.length; i++) {
                            var model = data[i];

                            htmlInfo += "<li id=\"add" + model.FileId + "\" class=\"grid-view-item open-enable\" style=\"display: block;\">";
                            htmlInfo += " <div class=\"FileShow\" title=\"" + model.FileName + "\" >";

                            //****图标***
                            //判断是否是文件夹，如果是文件夹连接为打开文件夹，如果不是文件夹，连接为下载连接
                            if (model.IsFolder == true) {
                                htmlInfo += " <div onclick=\"DFBG.FlieOA.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\">";
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
                                    case ".dot":
                                    case ".docm":
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
                                    case ".7z":
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
                                    case ".asf":
                                    case ".mov":
                                    case ".smi":
                                        htmlInfo += "<span  class=\"fileicon fileicon-large-video\">";
                                        break;
                                        //case ".exe":
                                        //    htmlInfo += "<span  class=\"fileicon fileicon-large-exe\">";
                                        //    break;
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
                                    case ".pptm":
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
                                htmlInfo += "<div class=\"file-name\"><span title=\"" + model.FileName + "\" class=\"filename\">" + model.FileName.substring(0, 6) + "...</span></div> ";
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
                                    case ".dot":
                                    case ".docm":
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
                                    case ".7z":
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
                                    case ".asf":
                                    case ".mov":
                                    case ".smi":
                                        htmlList += "<div  class=\"fileicon fileicon-small-video\"></div>";
                                        break;
                                        //case ".exe":
                                        //    htmlList += "<div  class=\"fileicon fileicon-small-exe\"></div>";
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
                                    case ".pptm":
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
                            htmlList += "<div style=\"width: 60%\" class=\"file-name\">";
                            htmlList += "<div class=\"text\">";
                            //判断是否是文件夹，如果是文件夹连接为打开文件夹
                            if (model.IsFolder == true) {
                                htmlList += "<a onclick=\"DFBG.FlieOA.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\"  class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                            }
                            else {
                                htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\" class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                            }

                            htmlList += "<div class=\"operate\">";
                            htmlList += "<div style=\"position: absolute; top: 0px; padding-top: 0px; line-height: normal;\">";

                            //（文件夹不放下载按钮和分享按钮）  
                            if (model.IsFolder != true) {
                                //分享
                                htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.ShareTransfer(" + model.FileId + ")\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"分享\" class=\"icon icon-share-blue\"></em> </span></a>";
                                //下载 
                                htmlList += "<a href=\"/File/DownFile?FileId=" + model.FileId + "\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"下载\" class=\"icon icon-download-blue\"></em></span></a>";
                            }
                            else {
                                //放空标签占位
                                htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.ShareTransfer(" + model.FileId + ")\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"分享\" class=\"icon icon-share-blue\"></em> </span></a>";
                                //htmlList += "<a class=\"g-button\"></a><a class=\"g-button\"></a>";
                            }
                            htmlList += "<span class=\"g-dropdown-button Baiparent\">";
                            //更多
                            htmlList += "<a onclick=\"MoreMethod(" + model.FileId + ")\" href=\"#\" class=\"g-button\"><span class=\"g-button-right\"></span></a>";
                            htmlList += "<span class=\"menu menu" + model.FileId + "\" onmouseout=\"\" style=\"width: 64px;display:none;\">";
                            htmlList += "<a href=\"#\" onclick=\"ReNameMethod(" + model.FileId + ",'menu" + model.FileId + "','" + model.FileName + "')\" class=\"g-button-menu rename\">重命名</a>";
                            htmlList += "<a href=\"#\" onclick=\"DFBGFlie.Flie.FlieOperation.Transfer(" + model.FileId + ",'parent','Yes')\" class=\"g-button-menu delete\">删除</a>";
                            htmlList += "</span></span>";
                            htmlList += "    </div>";
                            htmlList += "</div>";
                            htmlList += "</div>";

                            htmlList += "<div style=\"width: 16%\" class=\"file-size\">" + DFBGFlie.Flie.FlieOperation.GetFileSize(model.FileSizeKb) + "</div>";

                            var date = new Date(parseInt(model.FileCreateTime.replace("/Date(", "").replace(")/", ""), 10));
                            htmlList += "<div style=\"width: 23%\" class=\"ctime\">" + date.Format("yyyy-MM-dd hh:mm") + "</div>";
                            htmlList += "</div>";
                            htmlList += "</div>";
                        }
                    } else {
                        htmlList += "<div class=\"aGMvFtb\">";
                        htmlList += "<div class=\"hqvyGW05 wegnv3JM\">";
                        htmlList += "<p class=\"ggEQwFb\">";
                        htmlList += " 您还没上传过文件哦，点击";
                        htmlList += "<span class=\"cjujvy90 upload-wrapper\" onclick='showLayer();'>";
                        htmlList += " 上传";
                        htmlList += " </span>按钮～";
                        htmlList += "</p>";
                        htmlList += "</div>";
                        htmlList += "</div>";
                        htmlInfo = htmlList;
                    }
                    //htmlInfo += " <div style=\"clear: both\"></div>";
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
    MyGridFileShowLoad: function (Type, Name, pageSize, pageIndex) {
        var _base = DFBGFlie.Flie.FlieOperation;
        var _base2 = DFBG.FlieOA.Flie;

        _base.AjaxList("/MyFile/MyFileShowLoad", { Type: Type, SearchName: Name, pageSize: pageSize, p: pageIndex },
          function (re, status) {
              var data = re.model;
              maxGridnum = parseFloat(re.SumCount) / 49;
              if (status == "success") {
                  var htmlInfo = "";//列表展示
                  if (data.length != 0) {
                      //共多少个文件
                      _base2.GetSumNum(re.SumCount, data.length, pageSize, pageIndex, "grid");

                      for (var i = 0; i < data.length; i++) {
                          var model = data[i];

                          htmlInfo += "<li id=\"add" + model.FileId + "\" href=\"javascript:;\" class=\"grid-view-item open-enable\" style=\"display: block;\">";
                          htmlInfo += " <div class=\"FileShow\"  title=\"" + model.FileName + "\">";
                          //****图标***
                          //判断是否是文件夹，如果是文件夹连接为打开文件夹，如果不是文件夹，连接为下载连接
                          if (model.IsFolder == true) {
                              htmlInfo += " <div onmousedown=\"DFBG.FlieOA.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\">";
                              //------ 修改文件夹样式
                          }
                          else {

                              htmlInfo += " <div onmousedown=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\">";
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
                                  case ".dot":
                                  case ".docm":
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
                                  case ".7z":
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
                                  case ".asf":
                                  case ".mov":
                                  case ".smi":
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
                                  case ".pptm":
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
                              htmlInfo += "<div class=\"file-name\"><span title=\"" + model.FileName + "\" class=\"filename\">" + model.FileName.substring(0, 6) + "...</span></div> ";
                          }
                          else {
                              htmlInfo += "<div class=\"file-name\"><span title=\"" + model.FileName + "\" href=\"javascript:void(0);\" class=\"filename\">" + model.FileName + "</span></div>";
                          }
                          htmlInfo += "</li>";

                      }
                      $("#FileShow").append(htmlInfo);
                      $(".module-grid-view .grid-view li").on("mousedown", function (e) {
                          e.preventDefault();
                          e.stopPropagation();
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
                  else {
                      if (re.SumCount == "0") {
                          _base2.GetCont0();
                      }
                  }
              }
          });
    },
    MyListFileShowLoad: function (Type, Name, pageSize, pageIndex) {
        var _base = DFBGFlie.Flie.FlieOperation;
        var _base2 = DFBG.FlieOA.Flie;
        _base.AjaxList("/MyFile/MyFileShowLoad", { Type: Type, SearchName: Name, pageSize: pageSize, p: pageIndex },
          function (re, status) {
              var data = re.model;
              maxListnum = parseFloat(re.SumCount) / 15;

              if (status == "success") {
                  var htmlList = "";//列表展示
                  if (data.length != 0) {
                      //共多少个文件
                      _base2.GetSumNum(re.SumCount, data.length, pageSize, pageIndex, "List");

                      for (var i = 0; i < data.length; i++) {
                          var model = data[i];
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
                                  case ".gif":
                                  case ".bmp":
                                      //图片
                                      htmlList += "<div  class=\"fileicon fileicon-small-pic\"></div>";

                                      break;
                                  case ".docx":
                                  case ".doc":
                                  case ".dot":
                                  case ".docm":
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
                                  case ".7z":
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
                                  case ".asf":
                                  case ".mov":
                                  case ".smi":
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
                                  case ".pptm":
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
                          htmlList += "<div style=\"width: 60%\" class=\"file-name\">";
                          htmlList += "<div class=\"text\">";
                          //判断是否是文件夹，如果是文件夹连接为打开文件夹
                          if (model.IsFolder == true) {
                              htmlList += "<a onclick=\"DFBG.FlieOA.Flie.FileClick('" + model.FileId + "','" + model.FileName + "')\"  class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                          }
                          else {
                              htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\" class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                          }

                          htmlList += "<div class=\"operate\">";
                          htmlList += "<div style=\"position: absolute; top: 0px; padding-top: 0px; line-height: normal;\">";

                          //（文件夹不放下载按钮和分享按钮）  
                          if (model.IsFolder != true) {
                              //分享
                              htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.ShareTransfer(" + model.FileId + ")\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"分享\" class=\"icon icon-share-blue\"></em> </span></a>";
                              //下载 
                              htmlList += "<a href=\"/File/DownFile?FileId=" + model.FileId + "\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"下载\" class=\"icon icon-download-blue\"></em></span></a>";
                          }
                          else {
                              //放空标签占位
                              htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.ShareTransfer(" + model.FileId + ")\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"分享\" class=\"icon icon-share-blue\"></em> </span></a>";
                              //htmlList += "<a class=\"g-button\"></a><a class=\"g-button\"></a>";
                          }
                          htmlList += "<span class=\"g-dropdown-button Baiparent\">";
                          //更多
                          htmlList += "<a onclick=\"MoreMethod(" + model.FileId + ")\" href=\"#\" class=\"g-button\"><span class=\"g-button-right\"></span></a>";
                          htmlList += "<span class=\"menu menu" + model.FileId + "\" style=\"width: 64px;display:none;\">";
                          htmlList += "<a href=\"#\" onclick=\"ReNameMethod(" + model.FileId + ",'menu" + model.FileId + "','" + model.FileName + "')\" class=\"g-button-menu rename\">重命名</a>";
                          htmlList += "<a href=\"#\" onclick=\"DFBGFlie.Flie.FlieOperation.Transfer(" + model.FileId + ",'parent','Yes')\" class=\"g-button-menu delete\">删除</a>";
                          htmlList += "</span></span>";
                          htmlList += "    </div>";
                          htmlList += "</div>";
                          htmlList += "</div>";

                          htmlList += "<div style=\"width: 16%\" class=\"file-size\">" + DFBGFlie.Flie.FlieOperation.GetFileSize(model.FileSizeKb) + "</div>";

                          var date = new Date(parseInt(model.FileCreateTime.replace("/Date(", "").replace(")/", ""), 10));
                          htmlList += "<div style=\"width: 23%\" class=\"ctime\">" + date.Format("yyyy-MM-dd hh:mm") + "</div>";
                          htmlList += "</div>";
                          htmlList += "</div>";
                      }
                      $("#FileShowList").append(htmlList);
                      _base.SetContainerHeight();
                      $(".module-list-view .list-view-item").hover(function () {
                          $(this).children(".file-name").children(".operate").toggle();
                      });
                      if ($(".list-view-item").length > 3) {
                          $(".list-view-item:last .operate .menu").css({ "left": "-40px", "top": "-50px" });
                      }

                  } else {
                      if (re.SumCount == "0") {
                          _base2.GetCont0();
                      }
                  }

              }
          }
         );
    },

    GetSumNum: function (SumCount, PartCount, pageSize, pageIndex, ShowType) {
        maxnum = parseInt(SumCount / pageSize);
        var ShowCookieType = getCookie("ShowType");
        maxnum = parseFloat(SumCount % pageSize) > 0 ? maxnum + 1 : maxnum;
        if (ShowType == "List") {
            if (maxnum == pageIndex) {
                $("#SumListNum").html("已全部加载，共" + SumCount + "个");
            } else {
                SumListNum += PartCount;
                $("#SumListNum").html("已部分加载" + SumListNum + "个资源！");
            }
        }
        else {
            if (maxnum == pageIndex) {
                $("#SumGridNum").html("已全部加载，共" + SumCount + "个");
            } else {
                SumGridNum += PartCount;
                $("#SumGridNum").html("已部分加载" + SumGridNum + "个资源！");
            }
        }
        if (ShowCookieType == "List") {
            $("#SumListNum").show();
            $("#SumGridNum").hide();
        } else {
            $("#SumGridNum").show();
            $("#SumListNum").hide();
        }
    },
    GetCont0: function () {
        var htmlList = "<div class=\"aGMvFtb\">";
        htmlList += "<div class=\"hqvyGW05 wegnv3JM\">";
        htmlList += "<p class=\"ggEQwFb\">";
        htmlList += " 您还没上传过文件哦";
        htmlList += "</p>";
        htmlList += "</div>";
        htmlList += "</div>";
        $("#FileShowList").html(htmlList);
        $("#FileShow").html(htmlList);
    },
    FileClick: function (fileId) {
        window.location.href = "/MyFile/MyFile?FileId=" + fileId;
    },
    InFileOnlode: function (fileId) {
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/FileALLNavigation", { parentFileId: fileId }, function (data) {
            if (data != "") {
                $("#TitleIds").append(data);
            }
        }, true);
    },
    isSelect: function () {
        var FileisSelect = false;
        var RenameStade = 0;
        var swich = getCookie("ShowType");
        //判断如果是大图标展示，获取大图标展示中选择的id
        if (swich == "List") {
            //获取要分享的文件id(获取list列表展示中的id)
            var list = $("input[type=checkbox][name=cheName]");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    FileisSelect = true;
                    RenameStade++;
                }
            }
        } else {
            var cssId = $(".item-active");
            if (cssId.length > 0) {
                FileisSelect = true;
            }
            RenameStade = cssId.length;
        }
        if (FileisSelect) {
            $(".FlieOperation").css("display", "inline-block");
        } else {
            $(".FlieOperation").hide();
        }
        if (RenameStade == 1) {
            $(".Renamed").show();
        } else {
            $(".Renamed").hide();
        }

    },
    TuoMoVe: function (MoveFileId, treeviewId) {
        var url = "../File/FileMoveTo";
        var par = { FileIdList: MoveFileId, WhereId: treeviewId, MoveType: 2, Share: "" }

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
    },
    showLayer: function () {
        var FileId = $("#HidFileId").val();
        var Share = $("#Share").val();
        if (Share != undefined) {
            Share = Share;
        } else {
            Share = "";
        }
        var GroupOrAgencyId = $("#GroupOrAgencyId").val();
        if (GroupOrAgencyId == undefined) {
            GroupOrAgencyId == "";
        }
        parent.showLayer(FileId, Share, GroupOrAgencyId);
    }
}
parent.window.onresize = function () {
    var swich = getCookie("ShowType");
    if (swich == "List") {
        $(".list-view-container").css({ "height": $(window).height() - 124 });
    }
    else {
        $(".list-view-container").css({ "height": $(window).height() - 81 });
    }
}
//全部文件
function AllFileMethod() {
    window.location.href = "/MyFile/MyFile?FileId=";
}
//搜索文件
function SearchFileMethod() {
    //将搜索框的值存在cookie中
    setCookie("SearchInfo", $("#SearchId").val(), "d1");
    window.location.reload();
}

//点击选择图标方式
function SelShowType(swich) {
    setCookie("ShowType", swich, "d1");
    if (swich == "List") {
        $(".list-grid-switch").removeClass("grid-switched-on");
        $(".list-grid-switch").addClass("list-switched-on");
        $("#TypeShow").val("List");
        $("#FileShow").hide();
        $(".FileShowList").css({ "display": "block", "height": "100%" });
        $("#FileShow").css({ "display": "none", "height": "auto" });
        $("#FileShow").parent().css({ "height": "auto" });
        $("#FileShowList").parent().css({ "height": "100%" });

        $(".list-view-container").css({ "height": $(window).height() - 124 });
        $("#SumListNum").show();
        $("#SumGridNum").hide();
    }
    else {
        $(".list-grid-switch").removeClass("list-switched-on");
        $(".list-grid-switch").addClass("grid-switched-on");
        $("#TypeShow").val("Tu");
        $("#FileShow").show();
        $(".FileShowList").css({ "display": "none", "height": "100%" });
        $("#FileShowList").parent().css({ "height": "auto" });
        $("#FileShow").css({ "display": "block", "height": "auto" });
        $("#FileShow").parent().css({ "height": "100%" });
        $(".list-view-container").css({ "height": $(window).height() - 81 });
        $("#SumGridNum").show();
        $("#SumListNum").hide();
    }
    $("img").load(function () {
        //图片默认隐藏  
        $(this).hide();
        //使用fadeIn特效  
        $(this).stop().fadeIn("5000");
    });
    // 异步加载图片，实现逐屏加载图片
    $(".grid-view-item").scrollLoading();
    DFBG.FlieOA.Flie.isSelect();
}

//样式左上角的复选框点击事件（未选中则点击选中，已选中则点击取消）
function ClickSelCss(elem) {
    $("#" + elem).toggleClass("item-active");
    DFBG.FlieOA.Flie.isSelect();
}
//list显示页面点击更多按钮
function MoreMethod(Id) {
    $(".menu" + Id).show();
}

//全选方法
function AllCheck() {
    var AllCheckId = document.getElementById("checkAll");//全选按钮id
    var che = document.getElementsByName("cheName");//复选框name值
    if (AllCheckId.checked == true) {
        for (var i = 0; i < che.length; i++) {
            che[i].checked = "checked";
        }
    }
    else {
        for (var i = 0; i < che.length; i++) {
            che[i].checked = false;
        }
    }
    DFBG.FlieOA.Flie.isSelect();
}
//验证当前页的复选框是否已经全选
function YzCheAll() {
    //判断当前是否全选，动态给全选框状态
    var list = $("input[type=checkbox][name=cheName]");
    var ListCount = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i].checked) {
            ListCount++;
        }
    }
    if (list.length != 0) {
        if ((ListCount == list.length)) {
            $("#checkAll").attr("checked", "true");
        } else {
            $("#checkAll").removeAttr("checked");
        }
        DFBG.FlieOA.Flie.isSelect();
    }
    else {
        $("#checkAll").removeAttr("checked");
    }

}