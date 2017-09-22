/// <reference path="../ZeroClipboard.js" />
var ReNameFileId = "";//存储要重命名的文件id

var DFBGFlie = { Flie: {} }
DFBGFlie.Flie.FlieOperation = {
    AjaxHtml: function () {
        var url = arguments[0];
        var data = arguments[1];
        var callback = arguments[2];
        var async = arguments[3];
        var datatype = arguments.length > 4 ? arguments[4] : "html";
        var complete = arguments.length > 5 ? arguments[5] : function () { };
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: datatype,
            async: async,
            success: function (msg) {
                callback(msg);
            },
            complete: function (XMLHttpRequest, textStatus) {
                complete(XMLHttpRequest, textStatus);
            }
        });
    },
    AjaxList: function () {
        var url = arguments[0];
        var data = arguments[1];
        var callback = arguments[2];
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: "json",
            beforeSend: function (XMLHttpRequest) {
            },
            success: function (msg, status) {
                callback(msg, status);
            },
            complete: function (XMLHttpRequest, textStatus) {

            },
            error: function (e, x) {
            }
        });
    },
    //显示
    ImgShow: function () {
        ///父级遮罩层隐藏
        parent.$(".b-panel").fadeOut(500);
        parent.$(".module").fadeOut(500);
        parent.$(".module").html("");
    },
    //分享提示框
    ShareTransfer: function () {
        var _base = DFBGFlie.Flie.FlieOperation;
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareType = arguments.length > 1 ? arguments[1] : "";//非空返回列表页
        _base.AjaxList("../Ajax/GetShare", "", function (data) {
            var Str = "";
            Str += "<div id=\"ReNameId\" style=\" min-width: 650px; \" class=\"ui-draggable\">";
            Str += "<h1 id=\"popup_title\" class=\"widgettitle YIdong\" style=\"cursor: move;\">分享文件</h1>";
            Str += "<span onclick=\"$.closezhezhao('popup_container2','popup_overlay2')\" class=\"icon-fullscreen1\"></span>";
            Str += "<div id=\"popup_content2\" class=\"widgetcontent\">";

            Str += "<div style=\"text-align:center;\"> ";
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    switch (data[i].ShareTypeId) {
                        case 1001:
                        case 1002:
                            Str += "<input type=\"button\" onclick=\"DFBGFlie.Flie.FlieOperation.SchoolShare('" + FileId + "','" + data[i].ShareTypeId + "')\" value=\"" + data[i].ShareTypeName + "\" />";
                            break;
                        case 1003:
                            Str += "<input type=\"button\" onclick=\"DFBGFlie.Flie.FlieOperation.UserGroupShare('" + FileId + "','" + data[i].ShareTypeId + "')\" value=\"" + data[i].ShareTypeName + "\" />";
                            break;
                        default:
                            Str += "<input type=\"button\" onclick=\"DFBGFlie.Flie.FlieOperation.ShareMethod('" + FileId + "','" + data[i].ShareTypeId + "','" + ShareType + "')\" value=\"" + data[i].ShareTypeName + "\" />";
                            break;
                    }
                }
            }
            Str += "</div>";
            Str += "</div>";
            Str += "</div>";
            parent.$("#popup_container2").append(Str);
            $.dingwei('popup_container2', 'popup_overlay2', 'parent');
        }
     );
    },
    //分享
    ShareMethod: function (FileId, ShareTypeId) {
        var ShareType = arguments.length > 2 ? arguments[2] : "";//分享类型 非空返回列表页
        DFBGFlie.Flie.FlieOperation.OnShare(FileId, ShareTypeId, ShareType);
    },
    //分享
    OnShare: function () {
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareTypeId = arguments.length > 1 ? arguments[1] : "";
        var ShareType = arguments.length > 2 ? arguments[2] : "";
        var swich = getCookie("ShowType");
        //判断如果是大图标展示，获取大图标展示中选择的id
        if (FileId == "") {
            if (swich == "grid") {
                var cssId = window.frames["left"].$(".item-active");
                for (var i = 0; i < cssId.length; i++) {
                    FileId += cssId[i].id + ",";
                }
            }
            else {
                //获取要分享的文件id(获取list列表展示中的id)
                var list = window.frames["left"].$("input[type=checkbox][name=cheName]");
                for (var i = 0; i < list.length; i++) {
                    if (list[i].checked) {
                        FileId += list[i].value + ",";
                    }
                }
            }
        }

        if (FileId == "" || FileId == undefined) {
            alert("请选择要分享的文件!");
            return false;
        }
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/ShareMethod", { FileId: FileId, ShareTypeId: ShareTypeId }, function (data) {
            if (data == "suc") {
                alert("分享成功！");
                if (ShareTypeId == "1003") {
                    var url = SiShareUrl(FileId);
                    $("#popup_content2").html("<div style=\" padding: 20px 15px;text-align: center;\" id=\"popup_message\">" + url + "</div><div id=\"popup_panel\" style=\" padding: 10px 0px 20px;text-align: center;\"> <input type=\"button\" onclick=\"copyToClipboard('" + url + "')\" value=\"复制地址\"  class=\"widgetcontent\" style=\"min-width: 100px\" id=\"popup_ok\"></div>");

                } else if (ShareType == "") {
                    window.location.href = window.location.href;

                } else {
                    $.closezhezhao('popup_container2', 'popup_overlay2');
                }

            } else if (data == "NoCanShare") {
                alert("文件夹不可分享到部门分享！");
            } else {
                alert("分享失败！")
            }
        }, false);
    },
    //取消分享确定按钮
    NotShare: function () {
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareType = arguments.length > 0 ? arguments[1] : "";//分享类型 非空返回列表页
        if (FileId == "") {
            var list = $("input[name='cheName']");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    FileId += list[i].value + ",";
                }
            }
        }
        if (FileId == "" || FileId == undefined) {
            alert("请选择要取消分享的文件!");
            return false;
        }
        if (confirm("确定要取消分享吗？")) {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/IsShareMethods", { FileId: FileId }, function (data) {
                if (data == "suc") {
                    alert("取消分享成功！");
                    if (ShareType == "") {
                        window.location.href = "/MyFile/MyShare";
                    }
                } else {
                    alert("取消分享失败！")
                }
            }, false);
        }

    },
    //还原确定按钮
    Reduction: function () {
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareType = arguments.length > 0 ? arguments[1] : "";//分享类型 非空返回列表页
        var list = $("input[name='cheName']");
        for (var i = 0; i < list.length; i++) {
            if (list[i].checked) {
                FileId += list[i].value + ",";
            }
        }
        if (FileId == "" || FileId == undefined) {
            alert("请选择要取消分享的文件!");
            return false;
        }
        if (confirm("确定要还原吗？")) {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/Reduction", { FileId: FileId }, function (data) {
                if (data == "suc") {
                    alert("还原成功！");
                    if (ShareType == "") {
                        window.location.href = "/MyFile/Mydel";
                    }
                } else {
                    alert("还原失败！")
                }
            }, false);
        }

    },
    //批量删除
    DelMore: function (Id, whereTransfer) {
        var FileId = "";
        if (Id != "" && Id != undefined) {
            FileId = Id;
        }
        else {
            var swich = getCookie("ShowType");
            //判断如果是大图标展示，获取大图标展示中选择的id
            if (swich == "grid") {
                var cssId = window.frames["left"].$(".item-active");
                for (var i = 0; i < cssId.length; i++) {
                    FileId += cssId[i].id + ",";
                }
            }
            else {
                //获取要删除的文件id(list展示中的id)
                var list = window.frames["left"].$("input[type=checkbox][name=cheName]");
                for (var i = 0; i < list.length; i++) {
                    if (list[i].checked) {
                        FileId += list[i].value + ",";
                    }
                }
            }
        }
        if (FileId == "" || FileId == undefined) {
            alert("请选择要删除的文件!");
            return false;
        }
        else {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/DelMore", { FileIds: FileId }, function (data) {
                if (data == "suc") {
                    if (whereTransfer == "parent") {
                        $.closezhezhao('popup_container', 'popup_overlay');
                        window.frames["left"].window.location.reload();
                    } else {
                        window.location.href = window.location.href;
                    }
                }
            }, false);
        }
    },
    //删除提示框
    Transfer: function (Id, whereTransfer) {
        //whereTransfer (this 当前的，parent父级的)
        var container, kuan = "";
        if (whereTransfer == "parent") {
            container = parent.$("#popup_container");
        } else {
            container = $("#popup_container");
        }
        container.html(kuan);
        kuan = kuan + "<div class=\"ui-draggable\"> <h1 id=\"popup_title\"class=\"widgettitle YIdong\" style=\"cursor: move;\">提示</h1><div id=\"popup_content\" class=\"widgetcontent\">";
        kuan = kuan + "  <div id=\"popup_message\" style=\" padding: 20px 15px;text-align: center;\">确定删除吗？</div>  <div style=\" padding: 10px 0px 20px;text-align: center;\" id=\"popup_panel\">";
        kuan = kuan + " <input type=\"button\" id=\"popup_ok\" style=\"min-width: 100px\" class=\"widgetcontent\" value=\"确定\" onclick=\"DFBGFlie.Flie.FlieOperation.DelMore('" + Id + "','" + whereTransfer + "')\">";
        kuan = kuan + "  <input type=\"button\" id=\"popup_cancel\" style=\"min-width: 100px\" class=\"widgetcontent\" onclick=\"$.closezhezhao('popup_container','popup_overlay')\" value=\"取消\"></div></div></div>";
        container.append(kuan);
        $.dingwei('popup_container', 'popup_overlay', whereTransfer);
    },
    //选多个文件下载
    DownFileMore: function () {
        var FileId = "";
        var swich = getCookie("ShowType");
        //判断如果是大图标展示，获取大图标展示中选择的id
        if (swich == "grid") {
            var cssId = $(".item-active");
            for (var i = 0; i < cssId.length; i++) {
                FileId += cssId[i].id + ",";
            }
        }
        else {
            //获取要下载的文件id(list列表)
            var list = $("input[type=checkbox][name=cheName]");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    FileId += list[i].value + ",";
                }
            }
        }
        if (FileId == "" || FileId == undefined) {
            alert("请选择要下载的文件!");
            return false;
        }
        else {
            try {
                var url = "/File/DownFileMore?FileIds=" + FileId;
                var elemIF = document.createElement("iframe");
                elemIF.src = url;
                elemIF.style.display = "none";
                document.body.appendChild(elemIF);
            }
            catch (e) {
                alert("下载失败！");
            }
        }
    },
    //选多个文件下载javascript:DFBGFlie.Flie.FlieOperation.MoveFile()
    DownLoad: function (FileId) {
        try {
            var url = "/File/DownFile?FileId=" + FileId;
            var elemIF = document.createElement("iframe");
            elemIF.src = url;
            elemIF.style.display = "none";
            document.body.appendChild(elemIF);
        }
        catch (e) {
            alert("下载失败！");
        }
    },
    //新建文件夹
    NewsFile: function () {

        $(".aGMvFtb").hide();
        //获取显示类型（大图标显示/list列表显示）
        var showType = getCookie("ShowType");
        var html = "";
        if (showType == "grid") {
            html += "<li class=\"grid-view-item open-enable\" style=\"display: block;\">";
            html += "<div class=\"FileShow\">";
            html += "<div class=\"fileicon dir-large\">";
            html += "</div>";
            html += "</div>";
            html += "<div class=\"file-name\"><input  class=\"GadHyA\" onblur=\"DFBGFlie.Flie.FlieOperation.FileOnblur('a1','sp1')\" type=\"text\" value=\"新建文件夹\" id=\"a1\" /><span id=\"sp1\"></span></div> </li>";

            $("#FileShow").append(html);
            //$("#a1").focus();//获取焦点$("#a1")[0].focus();
            //将光标移到文本最后面
            MoveCursor("a1");
        }
        else {//列表
            html += "<dd class=\"g-clearfix list-view-item open-enable hover-item  item-active\">";
            html += "<input type=\"checkbox\" class=\"checkbox1\" name=\"cheName\" />";
            html += "<div class=\"fileicon  dir-small\"></div>";
            html += "<div style=\"width: 60%\" class=\"file-name\">";
            html += "<div class=\"text\">";
            html += "<a  class=\"filename\" href=\"#\"><input  class=\"filename\" onblur=\"DFBGFlie.Flie.FlieOperation.FileOnblur('a1','sp1')\" type=\"text\" value=\"新建文件夹\" id=\"a1\" /><span id=\"sp1\"></span></div>";
            html += "<div class=\"operate\">";
            html += "<div style=\"position: absolute; top: 0px; padding-top: 0px; line-height: normal;\">";
            //分享
            html += "<a href=\"javascript:void(0);\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"分享\" class=\"icon icon-share-blue\"></em> </span></a>";
            //下载      
            html += "<a href=\"javascript:void(0);\" class=\"g-button\" style=\"\"><span class=\"g-button-right\"><em title=\"下载\" class=\"icon icon-download-blue\"></em></span></a>";
            html += "<span class=\"g-dropdown-button\">";
            //更多
            html += "<a href=\"javascript:void(0);\" class=\"g-button\"><span class=\"g-button-right\"></span></a>";
            html += "<span class=\"menu\" style=\"width: 64px;display:none;\">";
            html += "<a href=\"javascript:void(0);\" class=\"g-button-menu rename\">重命名</a>";
            html += "<a href=\"javascript:void(0);\" class=\"g-button-menu delete\">删除</a>";
            html += "</span></span>";
            html += "    </div>";
            html += "</div>";
            html += "</div>";
            html += "<div style=\"width: 16%\" class=\"file-size\">-</div>";
            var date = new Date();
            html += "<div style=\"width: 23%\" class=\"ctime\">" + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日"; "</div>";
            html += "</dd>";
            $("#FileShowList").append(html);
            //$("#a1").focus();//获取焦点$("#a1")[0].focus()
            //将光标移到文本最后面
            MoveCursor("a1");

        }
    },
    //给创建的文件夹命名
    FileOnblur: function (inputId, spanId) {
        var Name = $("#" + inputId + "").val();

        if (Name.trim() == "") {
            $(window.document).off();
            Name = "新建文件夹";
        }
        var Share = $("#Share").val();
        if (Share != undefined) {
            Share == "1001";
        } else {
            Share = "";
        }
        $("#" + spanId + "").html(Name);
        $("#" + inputId + "").remove();

        //将新建的文件夹保存到库中
        var ParentFileId = $("#HidFileId").val();//获取父级文件夹id
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/MyFile/AddFile", { ParentFileId: ParentFileId, FileName: Name, Share: Share }, function (data) {
            if (data.indexOf("Suc") > -1) {
                window.location.reload();
            } else if (data == "FileNameIsHas") {
                alert("文件夹重名，创建失败！");
                window.location.reload();
            } else {
                alert("创建失败！");
            }
        }, false);

    },
    //重命名确定按钮
    OnReName: function (FileId) {
        var name = $("#ReNameInfo").val();

        if (name.trim() == "") {
            alert("请输入文件夹名称");
            $("#ReNameInfo").focus();
            return;
        } else {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/ReNameMethod", { FileId: FileId, Name: name },
                       function (data) {
                           if (data == "suc") {
                               $.closezhezhao('popup_container', 'popup_overlay');
                               window.frames["left"].location.reload();
                           } else {
                               alert("重命名失败！")
                           }
                       }, false);
        }

    },

    OnReNameFor: function () {
        var FileId = "";
        var OldName = "";
        var swich = getCookie("ShowType");
        //判断如果是大图标展示，获取大图标展示中选择的id
        if (swich == "grid") {
            var cssId = $(".item-active");
            for (var i = 0; i < cssId.length; i++) {
                FileId = cssId[i].id.replace("add", "");
                OldName = $("#" + cssId[i].id).children(".file-name").find(".filename").attr("title");
            }
        }
        else {
            //获取要删除的文件id(list展示中的id)
            var list = $("input[type=checkbox][name=cheName]");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    FileId += list[i].value;
                    OldName = $(list[i]).next().next().children(".text").children("a").text();
                }
            }
        }
        if (FileId != "") {
            var _Base = DFBGFlie.Flie.FlieOperation;
            ReNameMethod(FileId, "", OldName);
        }
    },
    //计算文件大小
    GetFileSize: function (Size) {
        if (Size < 0) {
            if (-Size > 1048576) {
                Size = (parseFloat(Size) / 1024 / 1024).toFixed(2);
                return Size + "G";
            } else if (-Size > 1024) {
                Size = (parseFloat(Size) / 1024).toFixed(2);
                return Size + "MB";
            } else if (-Size == "0") {
                return "-";
            } else {
                return Size + "KB";
            }
        }
        if (Size > 1048576) {
            Size = (parseFloat(Size) / 1024 / 1024).toFixed(2);
            return Size + "G";
        } else if (Size > 1024) {
            Size = (parseFloat(Size) / 1024).toFixed(2);
            return Size + "MB";
        } else if (Size == "0") {
            return "-";
        } else {
            return Size + "KB";
        }
    },
    //根据类型显示
    FileShowControl: function (FileExtName, FileId) {
        if ($(".module-tip").length == 0) {
            $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -77.5px;\"></div>");
        }
        $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-loading\"></i><span class=\"tip-msg\">正在打开文件，请稍候…</span></div></span></div>");
        $(".module-tip").css("display", "block");

        $(document).on('mousemove', function (e) { });

        var _base = DFBGFlie.Flie.FlieOperation;

        switch (FileExtName) {
            case ".jpg":
            case ".png":
            case ".jpeg":
            case ".gif":
            case ".bmp":
                var parentFileId = $.toString($("#HidFileId").val());
                DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/Img", { FileId: FileId, ParentFileId: parentFileId }, function (data) {
                    if (data != "") {
                        _base.Layer();
                        parent.$(".module").append(data);
                        parent.$(".b-panel").fadeIn(1000);
                        parent.$(".module").fadeIn(1000);
                    }
                }, true);
                break;
            case ".docx":
            case ".doc":
            case ".xls":
            case ".xlsx":
            case ".ppt":
            case ".pptx":
                DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/Office", { FileId: FileId }, function (data) {
                    if (data != "") {
                        _base.Layer();
                        parent.$("#popup_container2").html(data);
                        parent.$("#popup_container2").css({ "position": "absolute", "top": 0, "left": 0, "right": "0px", "bottom": "0px", "display": "block", "max-height": "100%" });
                        parent.$("#popup_overlay").css({ "display": "block" });
                    }
                }, true);

                break;
            case ".pdf":
                DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/Pdf", { FileId: FileId }, function (data) {
                    if (data != "") {
                        _base.Layer();
                        parent.$("#popup_container2").html(data);
                        parent.$("#popup_container2").css({ "position": "absolute", "top": 0, "left": 0, "right": "0px", "bottom": "0px", "display": "block", "max-height": "100%" });
                        parent.$("#popup_overlay").css({ "display": "block" });
                    }
                }, true);

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

                DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/Video", { FileId: FileId }, function (data) {
                    if (data != "") {
                        _base.Layer();
                        parent.$("#popup_container").html(data);
                        $.dingwei('popup_container', 'popup_overlay', 'parent');
                    }
                }, false);

                break;
            case ".mp3":
            case ".wma":
            case ".wav":
                DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/Audio", { FileId: FileId }, function (data) {
                    if (data != "") {
                        _base.Layer();
                        parent.$("#popup_container").html(data);
                        $.dingwei('popup_container', 'popup_overlay', 'parent');
                    }
                }, false);
                break;
            case ".txt":
            case ".rar":
            case ".zip":
            case ".exe":
            case ".psd":
            case ".xmind":
                _base.Layer();
                DFBGFlie.Flie.FlieOperation.DownLoad(FileId);
                break;
            default:
                _base.Layer();
                DFBGFlie.Flie.FlieOperation.DownLoad(FileId);
                break;
        }
    },
    //移动文件
    MoveShow: function (MoveType) {
        //MoveType 1复制 2移动
        DFBGFlie.Flie.FlieOperation.AjaxHtml("/Details/FileMove", { MoveType: MoveType }, function (data) {
            if (data != "") {
                parent.$("#popup_container").append(data);
                $.dingwei('popup_container', 'popup_overlay', 'parent');
            }
        }, true);
    },
    //加载目录信息
    Move: function (treeview, obj, Pl, Share, GroupId) {
        var url = "/Details/folderData";
        var par = {
            ParentFileId: treeview,
            Share: Share,
            GroupId: GroupId
        }
        EDUCAjax(par, function () {
        },
        function (re) {
            var date = re;
            var _base = DFBGFlie.Flie.FlieOperation;
            var Next = "";
            for (var i = 0; i < date.length; i++) {
                Next += "<li>";
                Next += "<div style=\"padding-left:" + (parseInt(Pl) + 15) + "px\" class=\"treeview-node " + (parseInt(date[i]["IsChildFolder"]) > 0 ? "" : "treenode-empty") + "\" _childfolder=\"" + date[i]["IsChildFolder"] + "\" >";
                Next += "<span class=\"treeview-node-handler\">";
                Next += "<em class=\"b-in-blk plus icon-operate \"></em> ";
                Next += "<dfn class=\"b-in-blk treeview-ic\"></dfn> ";
                Next += "<span class=\"treeview-txt\" treeview=\"" + date[i]["FileId"] + "\">" + date[i]["FileName"] + "</span>";
                Next += "</span>";
                Next += "</div>";
                Next += "<ul class=\"treeview  treeview-content treeview-collapse\"></ul>";
                Next += "</li>";
            }
            $(obj).next().html(Next);
            _base.treeview(Share);
        }, url, "json", false, "数据加载中，请耐心等待...", false);
    },
    //移动文件弹出层添加文件夹
    MoveAddFile: function () {
        var AddFile = "";
        var Folder = $("#plus-createFolder");
        var _base = DFBGFlie.Flie.FlieOperation;
        if (Folder.length > 0) {
            $("._disk_id_4").focus().select();
        } else {
            var Pl = $(".treeview-node-on").css("padding-left").replace("px", "");
            var treeview = $(".treeview-node-on").children().children("span").attr("treeview");
            AddFile += "<li id=\"plus-createFolder\">";
            AddFile += "<div style=\"padding-left:" + (parseInt(Pl) + 15) + "px\" class=\"treeview-node treenode-empty\">";
            AddFile += "<span class=\"treeview-node-handler\">";
            AddFile += "<em class=\"b-in-blk plus sprite-ic2 icon-operate\"></em> ";
            AddFile += "<dfn class=\"b-in-blk treeview-ic\"></dfn>";
            AddFile += " <span class=\"plus-create-folder\">";
            AddFile += "<input type=\"text\" value=\"新建文件夹\" class=\"input _disk_id_4\">";
            AddFile += "<span class=\"sure _disk_id_2\" pId=" + treeview + " ></span>";
            AddFile += "<span class=\"cancel _disk_id_3\"></span></span></span>";
            AddFile += "</div><ul _pl=\"75\" class=\"treeview treeview-content treeview-collapse\"></ul></li>";
            $(".treeview-node-on").next("ul").append(AddFile);
            $("._disk_id_4").focus().select();
            $("._disk_id_3").click(function () {
                $(this).parent().parent().parent().parent("li").remove();
            });
            $("._disk_id_2").click(function () {
                var Name = $("._disk_id_4").val();
                var pId = $(this).attr("pId");
                if (Name.trim() != "") {
                    DFBGFlie.Flie.FlieOperation.AjaxHtml("/MyFile/AddFile", { ParentFileId: pId, FileName: Name }, function (data) {
                        if (data.indexOf("Suc") > -1) {
                            $("._disk_id_4").parent().removeClass("plus-create-folder").addClass("treeview-txt").html(Name).attr("treeview", data.replace("Suc", ""));
                            $("#plus-createFolder").removeAttr("id");
                            $(".treeview-node-on").removeClass("treenode-empty").addClass("_minus").attr("_childfolder", "1").children().children("em").toggleClass("minus");
                            var _base = DFBGFlie.Flie.FlieOperation;
                            _base.treeview();
                        }
                    }, false);
                }
            })
        }
    },
    //展开/不展开
    treeview: function (Share) {
        $(".treeview-node").off().hover(function () {
            $(this).toggleClass("treeview-node-hover");
        }).click(function () {
            $(".treeview-node").removeClass("treeview-node-on");
            $(this).addClass("treeview-node-on").next("ul").toggleClass("treeview-collapse");
            if (parseInt($(this).attr("_childfolder")) > 0) {
                var ul = $(this).next().children();
                if (ul.length == 0) {
                    var treeview = $(this).children().children("span").attr("treeview");
                    var Pl = $(this).css("padding-left").replace("px", "");
                    var _base = DFBGFlie.Flie.FlieOperation;
                    _base.Move(treeview, this, Pl, Share);
                }
                $(this).toggleClass("_minus").children().children("em").toggleClass("minus");
            }
        })
    },
    //移动文件
    MoveFile: function () {
        var MoveFileId = "";
        var treeviewId = $(".treeview-node-on").children().children("span").attr("treeview");
        //MoveType 1复制 2移动
        var MoveType = $("#fileTreeDialog").attr("_movetype");
        var MoveStr = "";
        var swich = getCookie("ShowType");
        var Share = window.frames["left"].$("#Share").val();
        if (Share == undefined || Share == "") {
            Share = "";
        }
        //判断如果是大图标展示，获取大图标展示中选择的id
        if (swich == "grid") {
            var cssId = window.frames["left"].$(".item-active");
            for (var i = 0; i < cssId.length; i++) {
                MoveFileId += cssId[i].id + ",";
            }
        }
        else {
            //获取要删除的文件id(list展示中的id)
            var list = window.frames["left"].$("input[type=checkbox][name=cheName]");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    MoveFileId += list[i].value + ",";
                }
            }
        }
        if (MoveFileId == "") {
            return;
        }
        var url = "../File/FileMoveTo";
        var par = { FileIdList: MoveFileId, WhereId: treeviewId, MoveType: MoveType, Share: Share }
        if (MoveType == "1") {
            MoveStr = "复制";
        } else {
            MoveStr = "移动";
        }
        EDUCAjax(par, function () {
            $.closezhezhao('popup_container', 'popup_overlay');
            if ($(".module-tip").length == 0) {
                $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -77.5px;\"></div>");
            }
            $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-loading\"></i><span class=\"tip-msg\">正在" + MoveStr + "文件，请稍候…</span></div></span></div>");
            $(".module-tip").css("display", "block");
        },
        function (data) {
            if (data == "suc") {
                if ($(".module-tip").length == 0) {
                    $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
                } else {
                    $(".module-tip").css("margin-left", "-48.5px");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件" + MoveStr + "成功</span></div>");
                $(".module-tip").css("display", "block");
                window.frames["left"].location.reload();
                setTimeout("$(\".module-tip\").hide()", 5000);
            } else {
                if ($(".module-tip").length == 0) {
                    $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
                } else {
                    $(".module-tip").css("margin-left", "-48.5px");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件" + MoveStr + "失败</span></div>");
                $(".module-tip").css("display", "block");
                window.frames["left"].location.reload();
                setTimeout("$(\".module-tip\").hide()", 5000);
            }
        }, url, "html", false, "", false);
    },
    Layer: function () {
        if ($(".module-tip").length == 0) {
            $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
        } else {
            $(".module-tip").css("margin-left", "-48.5px");
        }
        $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件打开成功</span></div>");
        $(".module-tip").css("display", "block");
        setTimeout("$(\".module-tip\").hide()", 2000);
    },
    //清空回收站
    ClearDel: function () {
        if (confirm("确定要清空吗？")) {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/ClearDel", {}, function (data) {
                if (data == "suc") {
                    alert("清空成功！");
                    window.location.href = "/MyFile/Mydel";
                } else {
                    alert("清空失败！")
                }
            }, false);
        }
    },
    TrueDel: function () {
        var FileId = arguments.length > 0 ? arguments[0] : "";
        if (FileId == "") {
            var list = $("input[name='cheName']");
            for (var i = 0; i < list.length; i++) {
                if (list[i].checked) {
                    FileId += list[i].value + ",";
                }
            }
            if (FileId == "" || FileId == undefined) {
                alert("请选择要永久删除的文件!");
                return false;
            }
        }

        if (confirm("确定要永久删除吗？")) {
            DFBGFlie.Flie.FlieOperation.AjaxHtml("/File/TrueDel", { FileIds: FileId }, function (data) {
                if (data == "suc") {
                    alert("删除成功！");
                    window.location.href = "/MyFile/Mydel";
                } else {
                    alert("删除失败！")
                }
            }, false);
        }
    },
    //计算宽高
    SetContainerHeight: function () {
        var ShowCookieType = getCookie("ShowType");
        if (ShowCookieType == "List") {
            $(".list-view-container").css({ "height": $(window).height() - 124 });
        } else if (ShowCookieType == "grid") {
            $(".list-view-container").css({ "height": $(window).height() - 81 });
        }
    },
    ///学校/部门分享
    SchoolShare: function () {
        $.closezhezhao('popup_container2', 'popup_overlay2');
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareTypeId = arguments.length > 1 ? arguments[1] : "";
        var GroupId = arguments.length > 2 ? arguments[2] : "";

        DFBGFlie.Flie.FlieOperation.AjaxHtml("/SchoolShare/SchoolFileMove", { FileId: FileId, ShareTypeId: ShareTypeId, GroupId: GroupId }, function (data) {
            if (data != "") {
                parent.$("#popup_container").html("");
                parent.$("#popup_container").append(data);
                $.dingwei('popup_container', 'popup_overlay', 'parent');
            }
        }, true);
    },
    ///学校/部门分享
    SchoolShareFile: function () {

        var MoveFileId = arguments.length > 0 ? arguments[0] : "";
        var ShareTypeId = arguments.length > 1 ? arguments[1] : "";
        var GroupId = arguments.length > 2 ? arguments[2] : "";

        var treeviewId = $(".treeview-node-on").children().children("span").attr("treeview");
        if (MoveFileId == "") {
            var MoveStr = "";
            var swich = getCookie("ShowType");
            //判断如果是大图标展示，获取大图标展示中选择的id
            if (swich == "grid") {
                var cssId = window.frames["left"].$(".item-active");
                for (var i = 0; i < cssId.length; i++) {
                    MoveFileId += cssId[i].id + ",";
                }
            }
            else {
                //获取要删除的文件id(list展示中的id)
                var list = window.frames["left"].$("input[type=checkbox][name=cheName]");
                for (var i = 0; i < list.length; i++) {
                    if (list[i].checked) {
                        MoveFileId += list[i].value + ",";
                    }
                }
            }
        }
        if (MoveFileId == "") {
            return;
        }
        var url = "../SchoolShare/SchoolShareFile";
        var par = { FileIdList: MoveFileId, WhereId: treeviewId, ShareTypeId: ShareTypeId, GroupId: GroupId }

        EDUCAjax(par, function () {
            $.closezhezhao('popup_container', 'popup_overlay');
            if ($(".module-tip").length == 0) {
                $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -77.5px;\"></div>");
            }
            $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-loading\"></i><span class=\"tip-msg\">正在分享文件，请稍候…</span></div></span></div>");
            $(".module-tip").css("display", "block");
        },
        function (data) {
            if (data == "suc") {
                if ($(".module-tip").length == 0) {
                    $("body").append("<div class=\"module-tip\" style=\"top: 190px; left: 50%; margin-left: -48.5px\"></div>");
                } else {
                    $(".module-tip").css("margin-left", "-48.5px");
                }
                $(".module-tip").html("<div class=\"tip-inner\"><i class=\"tip-icon tip-icon-success\"></i><span class=\"tip-msg\">文件分享成功</span></div>");
                $(".module-tip").css("display", "block");
                window.frames["left"].location.reload();
                setTimeout("$(\".module-tip\").hide()", 5000);
            }
        }, url, "html", false, "", false);
    },
    //是否选中
    isSelect: function () {
        var FileisSelect = false;
        var cssId = $(".item-active");
        if (cssId.length > 0) {
            FileisSelect = true;
        }
        if (FileisSelect) {
            $(".number").html(cssId.length);
            $(".FlieOperation").css("display", "inline-block");
        } else {
            $(".FlieOperation").hide();
        }


    },
    //用户组分享
    UserGroupShare: function () {
        var _base = DFBGFlie.Flie.FlieOperation;
        var FileId = arguments.length > 0 ? arguments[0] : "";
        var ShareTypeId = arguments.length > 1 ? arguments[1] : "";
        $("#popup_title").text("选择用户组");
        _base.AjaxList("../UserGroup/GetAllGroupList", "", function (data) {
            var Str = "";
            Str += "<div style=\"height:315px; overflow-y:auto;padding:5px\" id=\"UserList\">";
            if (data.model.length > 0) {
                for (var i = 0; i < data.model.length; i++) {
                    Str += "<div  class=\"btn userGroup\" onclick=\"DFBGFlie.Flie.FlieOperation.SchoolShare('" + FileId + "','" + ShareTypeId + "','" + data.model[i].GroupId + "')\" >";
                    Str += data.model[i].GroupName;
                    Str += "</div>";
                }
            }
            Str += "</div>";
            $("#popup_content2").html(Str);
            $.dingwei('popup_container2', 'popup_overlay2', 'parent');

        })
    }
}
//获取焦点后将光标移到文本的末尾
function MoveCursor(Id) {
    var obj = $("#" + Id);
    obj.focus().select();
}
//给文件重命名
function ReNameMethod(FileId, hidId, OldName) {
    var Str = "";
    Str += "<div id=\"ReNameId\" style=\" min-width: 400px; max-width: 400px;\" class=\"ui-draggable\">";
    Str += "<h1 id=\"popup_title\" class=\"widgettitle YIdong\" style=\"cursor: move;\">重命名</h1>";
    Str += "<span onclick=\"$.closezhezhao('popup_container','popup_overlay')\" class=\"icon-fullscreen1\"></span>";
    Str += "<div id=\"popup_content2\" class=\"widgetcontent\">";
    Str += "<div id=\"popup_message2\">";
    Str += "名称：";
    Str += "<input type=\"text\" id=\"ReNameInfo\" class=\"input1\" style=\"border: 1px solid #2a84e9; height: 21px; padding: 2px 5px; width: 300px; \" value=\"" + OldName + "\" />";
    Str += "</div>";
    Str += "<div style=\"text-align:center;\"> <input type=\"button\" value=\"确定\" onclick=\"DFBGFlie.Flie.FlieOperation.OnReName('" + FileId + "')\" /></div>";
    Str += "</div>";
    Str += "</div>";
    parent.$("#popup_container").append(Str);
    $.dingwei('popup_container', 'popup_overlay', 'parent');
}

function SiShareUrl(FileId) {
    var host = "http://" + window.location.host;
    var num1 = GetRandomNum(5);
    var num2 = GetRandomNum(5);
    var num3 = GetRandomNum(5);
    return host + "/SchoolShare/ShareDetails?url=" + encodeURIComponent(encodeURIComponent(num1 + FileId + num2 + num3));
}
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function GetRandomNum(n) {
    var res = "";
    for (var i = 0; i < n ; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    return res;
}
function copyToClipboard(txt) {
    if (window.clipboardData) {
        window.clipboardData.clearData();
        clipboardData.setData("Text", txt);
        alert("复制成功！");

    } else if (navigator.userAgent.indexOf("Opera") != -1) {
        window.location = txt;
    } else if (window.netscape) {
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将 'signed.applets.codebase_principal_support'设置为'true'");
        }
        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
        if (!clip)
            return;
        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if (!trans)
            return;
        trans.addDataFlavor("text/unicode");
        var str = new Object();
        var len = new Object();
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        var copytext = txt;
        str.data = copytext;
        trans.setTransferData("text/unicode", str, copytext.length * 2);
        var clipid = Components.interfaces.nsIClipboard;
        if (!clip)
            return false;
        clip.setData(trans, null, clipid.kGlobalClipboard);
        alert("复制成功！");
    }
}