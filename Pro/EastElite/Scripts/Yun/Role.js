///分页检索
///参数pageIndex：页码
function Query(pageIndex) {
    DFBGFlie.Flie.FlieOperation.AjaxList("/Role/GetAgencyCodeNameList", {}, function (data) {
        var datalist = data.AgencyList;
        var AgencyList = $("#AgencyList")
        for (var i = 0; i <datalist.length; i++) {

            AgencyList.append("  <option value=\"" + datalist[i].AgencyCode + "\">" + datalist[i].RootName + "-" + datalist[i].AgencyName + "</option>");
        }
    }, true);

    var values = ["StaffCode", "StaffName", "AgencyName", "操作"];//列对应的字段值
    var postUrl = '/Ajax/GetUserList';
    var SubAgencyCode = $("#AgencyList").val().trim();//处室/教研组
    var UserName = $("#UserName").val().trim();//角色列表
    var strWhere = "";
    if (SubAgencyCode != null && SubAgencyCode != "")
        strWhere = SubAgencyCode;
    if (UserName != null && UserName != "")
        strWhere += "★" + UserName;
    GetData(postUrl, values, pageIndex, strWhere);
}

//设置表格的操作列内的button
//参数model:本行数据
function SetOperate(model) {
    var str = "<td align=\"center\">"
    str += "<span class='btn btn-primary' style=\"color:#fff;\" onclick=\"RoleShow('" + model.StaffCode + "')\">分配权限</span>";
    str += "</td>";
    return str;
}
function RoleShow(UserId) {
    DFBGFlie.Flie.FlieOperation.AjaxHtml("/Role/RoleShow", { UserId: UserId }, function (data) {
        if (data != "") {
            parent.$("#popup_container").html(data);
            $.dingwei('popup_container', 'popup_overlay', 'parent');
        }
    }, true);
}
