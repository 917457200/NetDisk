using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace BLL
{
    public class FileResult : IHttpHandler
    {
        public void ProcessRequest( HttpContext context )
        {
            try
            {
                string path = context.Request.PhysicalPath;
                if( !File.Exists( path ) )
                {
                    context.Response.End();
                }
                else
                {

                    string serverHost = context.Request.Url.Host;
                    Uri u = context.Request.UrlReferrer;
                    if( u == null || u.Host.ToLower() != serverHost.ToLower() )
                    {
                        string str = "";
                        if( u != null )
                            str += u.Host;
                        context.Response.Write( "禁止访问" + str );
                    }
                    else
                    {
                        DownLoad( path );
                        //context.Response.WriteFile(path);
                        //context.Response.Flush();
                        //context.Response.End();
                    }
                }
            }
            catch( Exception ex )
            {
                context.Response.Write( "禁止访问" );
            }
        }
        public bool IsReusable
        {
            get { return true; }
        }
        /// <summary>
        /// 下载
        /// </summary>
        /// <param name="FileName">文件虚拟路径</param>
        public static void DownLoad( string FileName )
        {
            //string filePath = MapPathFile(FileName);
            string filePath = FileName;
            long chunkSize = 1024000;             //指定块大小 
            byte[] buffer = new byte[chunkSize]; //建立一个1M的缓冲区 
            long dataToRead = 0;                 //已读的字节数   
            FileStream stream = null;
            try
            {
                //打开文件   
                stream = new FileStream( filePath, FileMode.Open, FileAccess.Read, FileShare.Read );
                dataToRead = stream.Length;

                //添加Http头   
                HttpContext.Current.Response.ContentType = "application/octet-stream";
                HttpContext.Current.Response.AddHeader( "Content-Disposition", "attachement;filename=" + HttpUtility.UrlEncode( Path.GetFileName( filePath ) ) );
                HttpContext.Current.Response.AddHeader( "Content-Length", dataToRead.ToString() );

                while( dataToRead > 0 )
                {
                    if( HttpContext.Current.Response.IsClientConnected )
                    {
                        int length = stream.Read( buffer, 0, Convert.ToInt32( chunkSize ) );
                        HttpContext.Current.Response.OutputStream.Write( buffer, 0, length );
                        HttpContext.Current.Response.Flush();
                        HttpContext.Current.Response.Clear();
                        dataToRead -= length;
                    }
                    else
                    {
                        dataToRead = -1; //防止client失去连接 
                    }
                }
            }
            catch( Exception ex )
            {
                HttpContext.Current.Response.Write( "Error:" + ex.Message );
            }
            finally
            {
                if( stream != null ) stream.Close();
                HttpContext.Current.Response.Close();
            }
        }
    }
}
