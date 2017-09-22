using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace BLL
{
    public class Cookie : System.Web.UI.Page
    {
        /// <summary>
        /// 设置Cookie内容
        /// </summary>
        /// <param name="cookieName">cookie名称</param>
        /// <param name="list">IDictionary<string, double>，泛型键值对</param>
        /// <param name="expires">有效期</param>
        public void SetCookie(string cookieName, IDictionary<string, double> list, int expires = 1)
        {
            var cookies = HttpContext.Current.Request.Cookies[cookieName]; //创建Cookie并命名
            if (cookies == null)
            {
                cookies = new HttpCookie(cookieName);
            }
            else
            {
                cookies.Expires = DateTime.Today.AddDays(expires - 10);
                cookies = new HttpCookie(cookieName);
            }
            foreach (string key in list.Keys)
            {
                cookies.Values.Add(key, list[key].ToString());
            }
            cookies.Expires = DateTime.Today.AddDays(expires);
        }

        /// <summary>
        /// 获取Cookie
        /// </summary>
        /// <param name="cookieName">Cookie名称</param>
        /// <returns></returns>
        public IDictionary<string, double> GetCookie(string cookieName)
        {
            var cookies = HttpContext.Current.Request.Cookies[cookieName]; //创建Cookie并命名
            if (cookies == null)
            {
                return null;
            }
            IDictionary<string, double> list = new Dictionary<string, double>();
            for (int i = 0; i < cookies.Values.Count; i++)
            {
                list.Add(new KeyValuePair<string, double>(cookies.Values.AllKeys[i], Convert.ToDouble(cookies.Value[i])));
            }

            return list;
        }

        public void SetCookie(string cookieName, string value, int expires = 1)
        {
            var cookies = HttpContext.Current.Request.Cookies[cookieName]; //创建Cookie并命名
            if (cookies == null)
            {
                cookies = new HttpCookie(cookieName);
            }
            else
            {
                cookies.Expires = DateTime.Now.AddDays(expires);
                cookies = new HttpCookie(cookieName);
            }
            cookies.Value = value;
            cookies.Expires = DateTime.Now.AddDays( expires );
            HttpContext.Current.Response.Cookies.Add(cookies);
        }
        /// <summary>
        /// 
        /// </summary>
        public void DelCookeis(string cookiename)
        {
            HttpCookie cookies = HttpContext.Current.Request.Cookies[cookiename];
            if (cookies != null)
            {
                cookies.Expires = DateTime.Now.AddYears(-1);
                HttpContext.Current.Response.Cookies.Add(cookies);
                HttpContext.Current.Request.Cookies.Remove(cookiename);
            }
        }
        /// <summary>
        /// 获取Cookie
        /// </summary>
        /// <param name="cookieName">Cookie名称</param>
        /// <returns></returns>
        public string GetCookieToString(string cookieName)
        {
            var cookies = HttpContext.Current.Request.Cookies[cookieName]; //创建Cookie并命名
            if (cookies == null)
            {
                return null;
            }
            return cookies.Value;
        }
      
        /// <summary>
        //Cookie 验证
        /// </summary>
        /// <returns></returns>
        public void ExistCookie()
        {

            var cookies = HttpContext.Current.Request.Cookies["Dfbg_OAUser"]; //创建Cookie并命名
            if (cookies == null)
            {
                Context.Response.Redirect("~/Home/Login");
            }
            else
            {
                cookies.Expires = DateTime.Now.AddDays(1);
                HttpContext.Current.Response.Cookies.Add(cookies);
            }
        }
        /// <summary>
        //Cookie 获取
        /// </summary>
        /// <returns></returns>
        public TeUser GetUserCookie()
        {
            TeUser U = new TeUser();

            string UserStr = GetCookieToString( "Dfbg_OAUser" );
            var cookies = HttpContext.Current.Request.Cookies["Dfbg_OAUser"]; 

            if( string.IsNullOrEmpty( UserStr ) )
            {
                Context.Response.Redirect( "~/Home/Login" );
                return null;
            }
            else
            {
                U = Newtonsoft.Json.JsonConvert.DeserializeObject<TeUser>( UserStr );
                U.userName = HttpContext.Current.Server.UrlDecode( HttpContext.Current.Server.UrlDecode( U.userName ) );
                cookies.Expires = DateTime.Now.AddDays( 1 );
                HttpContext.Current.Response.Cookies.Add( cookies );
                return U;
            }

        }
        /// <summary>
        // 获取用户名
        /// </summary>
        /// <returns></returns>
        public TeUser GetUserNameForSerVice( string Josn )
        {
            Newtonsoft.Json.Linq.JObject LoginUser = (Newtonsoft.Json.Linq.JObject) Newtonsoft.Json.JsonConvert.DeserializeObject<object>( Josn );
            TeUser user = new TeUser();
            if( LoginUser != null )
            {
                string U = LoginUser["data"]["result"].ToString().Replace( "[", "" ).Replace( "]", "" );
                user = Newtonsoft.Json.JsonConvert.DeserializeObject<TeUser>( U );
            }
            return user;
        }
        [Serializable]
        public partial class TeUser
        {
            public string userCode { get; set; }
            public string userType { get; set; }
            public string userName { get; set; }
            public string roleCode { get; set; }
            public string unitCode { get; set; }
            public string unitName { get; set; }
            public string schoolCode { get; set; }
            public string rootCode { get; set; }
            public string rootName { get; set; }
            public string rootType { get; set; }
        }
    }
}
