using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Web.Core
{
    [AttributeUsage( AttributeTargets.All, Inherited = true )]
    public class LoginNeedsFilter : ActionFilterAttribute
    {
        public bool IsCheck { get; set; }
        public override void OnActionExecuting( ActionExecutingContext filterContext )
        {

            if( IsCheck )
            {
                var cookies = HttpContext.Current.Request.Cookies["Dfbg_OAUser"]; //创建Cookie并命名
                if( cookies == null )
                {
                    filterContext.Result = new RedirectToRouteResult( "Default", new RouteValueDictionary( new { controller = "home", action = "ToToLogin" } ) );
                }

            }
            base.OnActionExecuting( filterContext );
        }


        [STAThread]
        public static void TimerMain()
        {
            System.Timers.Timer aTimer = new System.Timers.Timer();
            aTimer.Elapsed += new ElapsedEventHandler( TimeEvent );
            // 设置引发时间的时间间隔　此处设置为１秒（１０００毫秒）
            aTimer.Interval = 1000;
            aTimer.Enabled = true;
        }
        //　当时间发生的时候需要进行的逻辑处理等
        //　　在这里仅仅是一种方式，可以实现这样的方式很多．
        private static void TimeEvent( object source, ElapsedEventArgs e )
        {
            // 得到 hour minute second　如果等于某个值就开始执行某个程序。
            int intHour = e.SignalTime.Hour;
            int intMinute = e.SignalTime.Minute;
            int intSecond = e.SignalTime.Second;
            // 定制时间； 比如 在24：00 ：00 的时候执行某个函数
            int iHour = 24;
            int iMinute = 00;
            int iSecond = 00;
            // 设置　每天的24：00：00开始执行程序
            if( intHour == iHour && intMinute == iMinute && intSecond == iSecond )
            {
                BLL.YunFile.MyFile File = new BLL.YunFile.MyFile();
                File.ClearFile();
            }
        }

    }
}