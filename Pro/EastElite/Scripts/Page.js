//分页绑定
//注意事项:
//1、处于页面中将要绑定的<table>标签内 必须有 class="gridView"，用于获取表格
//2、表格宽度在<th>中设置
//3、页面引用本文件后，需要在当前页面写Query(pageIndex) 与function SetOperate(model)方法
//4、SetOperate方法是用于加载操作按钮，参数是当前行的数据集合，可用于判断
//5、post请求Controllers返回json类型，类型包含三个元素，数据集合（List<Model>）,记录总数pageCount，页码pageIndex


//设置表格的操作列内的button
//参数model:本行数据
function SetOperate(model) {
    return "<td>操作</td>";
}
//分页表格数据绑定
function GetData(postUrl, values, pageIndex, strWhere) {
    if (pageIndex <= 0) { pageIndex = 1;}
    $.post(postUrl, { pageIndex: pageIndex, strWhere: strWhere }, function (Data) {
        pageIndex = Data.pageIndex;
        BondData(Data.model, values, pageIndex);//绑定数据
        Page(pageIndex, Data.pageCount, values.length);//设置分页
    })
}
//分数数据绑定
//参数Data为后台检索到的数据
//values为各列所需要显示的个字段名，要求其要与表格<th>标签顺序相对应
function BondData(Data, values, pageIndex) {
    if (Data != null && Data.length > 0) {
        //获取表头
        var table = $(".gridView tr")[0];
        $(".gridView  tr:not(:first)").remove("");
        var rows = Data.length;
        for (i = 0; i < rows; i++) {
            var result = "<tr>";
            for (j = 0; j < values.length; j++) {
                if (values[j] == "操作") {//当需要加载操作列时，执行SetOperate()方法 
                    var operate = SetOperate(Data[i]);
                    result = result + operate;//加载操作按钮
                }else if (values[j] == "序号") {
                    result = result + "<td  align=\"center\"><input name=\"Checkbox\" type=\"checkbox\" value =\"" + Data[i].Id + "\" /></td>";
                } else if (values[j] == "状态") {
                    var operate = SetState(Data[i]);
                    result = result + operate;//加载状态
                } else {
                    //普通列数据加载
                    if (Data[i][values[j]] != null) {
                        var value = Data[i][values[j]].toString();
                        if (value.indexOf("Date") > -1) {
                            result = result + "<td  align=\"center\">" + Todata(value) + "</td>";
                        } else {
                            result = result + "<td  align=\"center\">" + value + "</td>";
                        }

                    }
                    else {
                        result = result + "<td>&nbsp;</td>";
                    }
                   
                }
            }
            result = result + "</tr>"
            $(".gridView").append(result);
        }

    } else {
        $(".gridView  tr:not(:first)").remove("");
    }
}
//展示分页
//参数pageIndex：页码
//参数pageCount：总页数
function Page(pageIndex, pageCount, i) {
    if (pageCount > 0) {
        var result = "<tr><td colspan =\"" + i + "\" style='padding:0px;' > <div id=\"dyntable_info\" class=\"dataTables_info\"> &nbsp;  <ul class=\"dataTables_paginate paging_full_numbers\">";

        if (pageIndex == 1 && (pageCount == 1)) {//当分页数仅为一页的情况
            result = result + " <li class=\"NoNothink\"><a class=\"first paginate_button paginate_button_disabled NoNothink2\">首页</a></li>";
            result = result + "<li class=\"NoNothink\"><a class=\"previous paginate_button paginate_button_disabled NoNothink2\">上一页</a></li>";
            result = result + "<li class=\"NoNothink\"><a class=\"next paginate_button paginate_button_disabled NoNothink2\">下一页</a></li>";
            result = result + "<li class=\"NoNothink\"><a class=\"last paginate_button paginate_button_disabled NoNothink2\">尾页</a></li>";
        }
        else if (pageIndex == 1) {//首页
            result = result + " <li class=\"NoNothink\"><a class=\"first paginate_button paginate_button_disabled NoNothink2\">首页</a></li>";
            result = result + " <li class=\"NoNothink\"><a class=\"previous paginate_button paginate_button_disabled NoNothink2\">上一页</a></li>";
            result = result + " <li class=\"NoNothink\"><a onclick=Query(" + (pageIndex + 1) + ") class=\"next paginate_button NoNothink2\">下一页</a></li>";
            result = result + " <li class=\"NoNothink\"><a class=\"next paginate_button NoNothink2\" onclick=Query(" + pageCount + ")>尾页</a></li>";
        } else if (pageIndex == pageCount) {//尾页
            result = result + " <li class=\"NoNothink\"><a  onclick=Query(1) class=\"first paginate_button NoNothink2\">首页</a></li>";
            result = result + " <li class=\"NoNothink\"><a onclick=Query(" + (pageIndex - 1) + ") class= \"first paginate_button NoNothink2\">上一页</a></li>";
            result = result + " <li class=\"NoNothink\"><a class=\"next paginate_button paginate_button_disabled NoNothink2\">下一页</a></li>";
            result = result + "<li class=\"NoNothink\"><a class=\"last paginate_button paginate_button_disabled NoNothink2\">尾页</a></li>";
        } else {
            result = result + " <li class=\"NoNothink\"><a  onclick=Query(1) class=\"first paginate_button NoNothink2\">首页</a></li>";
            result = result + "<li class=\"NoNothink\"><a onclick=Query(" + (pageIndex - 1) + ") class= \"first paginate_button NoNothink2\">上一页</a></li>";
            result = result + " <li class=\"NoNothink\"><a onclick=Query(" + (pageIndex + 1) + ") class=\"next paginate_button NoNothink2\">下一页</a></li>";
            result = result + " <li class=\"NoNothink\"><a class=\"next paginate_button NoNothink2\" onclick=Query(" + pageCount + ")>尾页</a></li>";
        }
        result = result + ToPageSelect(pageIndex, pageCount);
        result = result + "</td></tr>"
        $(".gridView").append(result);
    }
}

//分页跳转选择框
function ToPageSelect(pageIndex, pageCount) {
    var result = "<select id=\"CurrentPage\" onchange=Query(this.value) class=\"goto\">";
    for (i = 1; i <= pageCount; i++) {
        if (i == pageIndex) {//当页码与选择框value相等时，设置状态为选中状态
            result = result + "<option selected=\"selected\" value=" + i + ">" + i + "</option>";
        } else {
            result = result + "<option value=" + i + ">" + i + "</option>";
        }
    }
    result = result + "</select>";
    return result;
}

function Todata(value) {
    value = eval(value.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"));
    var date = new Date(value);
    return date.Format("yyyy-MM-dd");
}

