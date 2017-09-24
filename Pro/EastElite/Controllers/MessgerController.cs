using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class MessgerController : Controller
    {
        BLL.Messger.Messger M = new BLL.Messger.Messger();
        BLL.Cookie GetCookie = new BLL.Cookie();

        // GET: /Messger/
        public ActionResult List()
        {
            return View();
        }
        public ActionResult GetManageList( int pageIndex, string strWhere )
        {
            string GroupName = "", UserName = "";
            if( strWhere != "" )
            {
                string[] str = strWhere.Split( '★' );
                if( strWhere.IndexOf( '★' ) > -1 )
                {
                    GroupName = str[0].ToString();
                    UserName = str[1].ToString();
                }
                else
                {
                    GroupName = str[0].ToString();
                }
            }
            int pageSize = 10;//每页条数
            int Count = 0;//总条数
            string UserCode = GetCookie.GetUserCookie().userCode;
            List<Model.MassgeInfo> model = M.GetManageList( pageIndex, pageSize, GroupName, UserName, UserCode, ref Count );
            int pageCount = ( Count + pageSize - 1 ) / pageSize;//页码
            return Json( new { model, pageCount, pageIndex }, JsonRequestBehavior.AllowGet );
        }
        public ActionResult GetManage()
        {
            int Count = M.WeiDuMessgerCount( GetCookie.GetUserCookie().userCode );
            return Json( new { Count }, JsonRequestBehavior.AllowGet );
        }
    }
}