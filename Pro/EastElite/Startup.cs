using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(EastElite.Startup))]
namespace EastElite
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
