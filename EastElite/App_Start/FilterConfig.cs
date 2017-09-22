using System.Web;
using System.Web.Mvc;
using Web.Core;

namespace EastElite
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            filters.Add(new LoginNeedsFilter() { IsCheck = true });
        }
    }
}
