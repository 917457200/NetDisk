using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Security;
using Web.Core;


namespace EastElite.Controllers
{
    public class HomeController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();

        // GET: /Home/
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult Login()
        {
            return View();
        }
        //登陆
        [HttpPost]
        [ValidateAntiForgeryToken]
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult ToLogin()
        {
            //登录接口加载
            EastEliteICMSWS.EastEliteICMSWSSoapClient Service = new EastEliteICMSWS.EastEliteICMSWSSoapClient();
            //登录错误信息
            string err = "";

            StringBuilder script = new StringBuilder();
            BLL.Cookie.TeUser U = new BLL.Cookie.TeUser();

            //加载数据
            string UserCode = Request.Form["inputUserCode"].ToString();
            string Password = Request.Form["inputPassword"].ToString();
            byte userType = byte.Parse( Request.Form["inputUserType"].ToString() );
            //验证
            if( string.IsNullOrEmpty( UserCode ) )
            {
                err = "姓名或代码不能为空！";
                script.Append( String.Format( "<script>alert('{0}');location.href='{1}'</script>", err, Url.Action( "Login" ) ) );
                return Content( script.ToString(), "Text/html" );
            }
            if( string.IsNullOrEmpty( Password ) )
            {
                err = "密码不能为空！";
                script.Append( String.Format( "<script>alert('{0}');location.href='{1}'</script>", err, Url.Action( "Login" ) ) );
                return Content( script.ToString(), "Text/html" );
            }

            //Password = BLL.MD5.Lower32(Password);//用户密码加密
            string result = Service.CheckUserLoginDeviceItem( UserCode, userType, Password );//访问接口验证登录

            ///登录失败
            if( result.IndexOf( "FAIL" ) > -1 )
            {
                int Start = result.IndexOf( "FAIL" ) + 9;
                int End = result.IndexOf( "!" ) + 1;
                err = result.Substring( Start, End - Start );
                script.Append( String.Format( "<script>alert('{0}');location.href='{1}'</script>", err, Url.Action( "Login" ) ) );
                return Content( script.ToString(), "Text/html" );
            }
            else if( result.IndexOf( "SUCC" ) > -1 )//登录成功
            {
                U = GetCookie.GetUserNameForSerVice( result );
                U.userName = U.userName;
                GetCookie.SetCookie( "Dfbg_OAUser", Newtonsoft.Json.JsonConvert.SerializeObject( U ), 1);
                FormsAuthentication.SetAuthCookie( UserCode, false );
                return Redirect( "~/Manage/Index" );
            }
            else
            {
                //非法登录
                script.Append( String.Format( "<script>alert('{0}');location.href='{1}'</script>", "非法登录", Url.Action( "Login" ) ) );
                return Content( script.ToString(), "Text/html" );
            }


        }
        /// <summary>
        /// 退出登录
        /// </summary>
        /// <returns></returns>
        public ActionResult OutLogin()
        {
            //Cookie 验证
            GetCookie.DelCookeis( "Dfbg_OAUser" );
            return View( "Login" );
        }
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult ToToLogin()
        {
            StringBuilder script = new StringBuilder();
            script.Append( "<script> alert(\"登录超时，请重新登录！\");parent.location.href = \"/Home/Login\";</script>" );
            return Content( script.ToString(), "Text/html" );
        }
    }
}