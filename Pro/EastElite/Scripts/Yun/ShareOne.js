
var HY = { FlieShare: {} }

HY.FlieShare.Flie = {
    //我的网盘页面数据加载
    MyFileLoad: function (FileId, UrlLoad, Url) {
        var _base = DFBGFlie.Flie.FlieOperation;
        _base.AjaxList(UrlLoad, { FileId: FileId },
           function (re, status) {
               var data = re.model;
               if (status == "success") {

                   var htmlList = "";//列表展示
                   if (data.length != 0) {
                       //共多少个文件
                       $("#SumNum").html("已全部加载，共" + data.length + "个");

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
                               htmlList += "<a onclick=\"HY.FlieShare.Flie.FileClick('" + model.FileId + "','" + model.FileName + "','" + Url + "')\"  class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                           }
                           else {
                               htmlList += "<a onclick=\"DFBGFlie.Flie.FlieOperation.FileShowControl('" + model.FileExtName + "','" + model.FileId + "')\" class=\"filename\" href=\"#\" title=\"" + model.FileName + "\">" + model.FileName + "</a></div>";
                           }

                           htmlList += "<div class=\"operate\">";
                           htmlList += "<div style=\"position: absolute; top: 0px; padding-top: 0px; line-height: normal;\">";

                           //（文件夹不放下载按钮和分享按钮）  
                           if (model.IsFolder != true) {
                               htmlList += "<a href=\"/File/DownFile?FileId=" + model.FileId + "\" class=\"g-button\" style=\" border:0;\"><span class=\"g-button-right\"><em title=\"下载\" class=\"icon icon-download-blue\"></em></span></a>";
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

                   $(".module-list-view .list-view-item").hover(function () {
                       $(this).children(".file-name").children(".operate").toggle();
                   });
                   if ($(".list-view-item").length > 3) {
                       $(".list-view-item:last .operate .menu").css({ "left": "-40px", "top": "-50px" });
                   }
               }
           }
         );
    },
    InFileOnlode: function (fileId, Url) {
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/Navigation", { parentFileId: fileId, Url: Url }, function (data) {
            if (data != "") {
                $("#TitleIds").append(data);
            }
        }, true);
    },

    FileClick: function (fileId, FileName, Url) {
        window.location.href = Url + fileId;
    }
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
    }
    else {
        $("#checkAll").removeAttr("checked");
    }

}