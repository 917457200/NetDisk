using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace BLL
{
    /// <summary>
    /// 文件辅助类
    /// </summary>
    public sealed class FileHelper
    {
        public static string VIR_PATH = "~/Upload/";

        public static readonly string CurrentBaseDir = string.Empty;

        static FileHelper()
        {
            CurrentBaseDir = AppDomain.CurrentDomain.BaseDirectory;
        }

        /// <summary>
        /// 获取文件上传的路径
        /// </summary>
        public static string UploadPath
        {
            get
            {
                //VIR_PATH = System.Configuration.ConfigurationManager.AppSettings["UploadPath"] ?? VIR_PATH;
                var context = HttpContext.Current;
                //var dateTimeDir = DateTime.Now.ToString("yyyyMMdd");
                var dateYear = DateTime.Now.Year.ToString();
                var dateMonth = DateTime.Now.Month.ToString();
                var dateDay = DateTime.Now.Day.ToString();
                if( context != null )
                {
                    return System.IO.Path.Combine( context.Server.MapPath( VIR_PATH ), dateYear, dateMonth, dateDay );
                }
                VIR_PATH = VIR_PATH.TrimStart( '~' ).TrimStart( '/' );
                return System.IO.Path.Combine( CurrentBaseDir, VIR_PATH, dateYear, dateMonth, dateDay );
            }
        }

        /// <summary>
        /// 获取文件上传的基路径
        /// </summary>
        public static string UploadPathBase
        {
            get
            {
                //VIR_PATH = System.Configuration.ConfigurationManager.AppSettings["UploadPath"] ?? VIR_PATH;
                var context = HttpContext.Current;
                if( context != null )
                {
                    return context.Server.MapPath( VIR_PATH );
                }
                VIR_PATH = VIR_PATH.TrimStart( '~' ).TrimStart( '/' );
                return VIR_PATH;
            }
        }

        /// <summary>
        /// 获取物理路径
        /// </summary>
        /// <param name="relativePath">相对路径</param>
        /// <returns></returns>
        public static string MapPath( string relativePath )
        {
            relativePath = relativePath.TrimStart( '/' ).TrimStart( '\\' ).Replace( @"/", @"\" );
            return Path.Combine( CurrentBaseDir, relativePath );
        }

        /// <summary>
        /// 获取文件的后缀名
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static string GetExtension( string fileName )
        {
            return Path.GetExtension( fileName );
        }

        /// <summary>
        /// 获取文件类型
        /// </summary>
        /// <param name="ext"></param>
        /// <returns></returns>
        public static string GetFileType( string ext )
        {
            ext = ( ext ?? "" ).ToLower();
            string[] zip = new string[] { ".zip", ".rar" };
            string[] doc = new string[] { ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt" };
            string[] video = new string[] { ".avi", ".mp4", ".rm", ".rmvb" };
            string[] audio = new string[] { ".mp3", ".wma" };
            string[] picture = new string[] { ".jpg", ".png", ".gif", ".jpeg", ".bmp" };
            //System.IO.Path.

            Dictionary<string, string[]> _t = new Dictionary<string, string[]>();
            _t.Add( "压缩包", zip );
            _t.Add( "文档", doc );
            _t.Add( "视频", video );
            _t.Add( "音频", audio );
            _t.Add( "图片", picture );
            foreach( var k in _t )
            {
                if( k.Value.Contains( ext ) )
                {
                    return k.Key;
                }
            }
            return "其它";
        }

        /// <summary>
        /// 获取文件上传大小 
        /// </summary>
        /// <param name="fileName">物理文件名称</param>
        /// <returns></returns>
        public static int ComputeSize( string fileName )
        {
            if( !System.IO.File.Exists( fileName ) )
            {
                throw new System.IO.FileNotFoundException( fileName );
            }
            using( var strem = System.IO.File.OpenRead( fileName ) )
            {
                return (int) strem.Length;
            }
        }

        /// <summary>
        /// 计算文件的MD5值
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        public static string ComputeHashMd5( string filePath )
        {
            using( var stream = System.IO.File.OpenRead( filePath ) )
            {
                var md5 = System.Security.Cryptography.MD5.Create();
                byte[] data = md5.ComputeHash( stream );
                return BitConverter.ToString( data ).Replace( "-", "" );
            }
        }

        /// <summary>  
        /// 复制大文件  
        /// </summary>  
        /// <param name="fromPath">源文件的路径</param>  
        /// <param name="toPath">文件保存的路径</param>  
        /// <param name="eachReadLength">每次读取的长度</param>  
        /// <returns>是否复制成功</returns>  
        public static bool CopyFile( string fromPath, string toPath, int eachReadLength )
        {
            try
            {
                if( !System.IO.Directory.Exists( Path.GetDirectoryName( toPath ) ) )
                {
                    //不存在创建文件
                    System.IO.Directory.CreateDirectory( Path.GetDirectoryName( toPath ) );
                }
                //将源文件 读取成文件流  
                using(  FileStream fromFile = new FileStream( fromPath, FileMode.Open, FileAccess.Read ) )
                {
                    //已追加的方式 写入文件流  
                    FileStream toFile = new FileStream( toPath, FileMode.Append, FileAccess.Write );
                    //实际读取的文件长度  
                    int toCopyLength = 0;
                    //如果每次读取的长度小于 源文件的长度 分段读取  
                    if( eachReadLength < fromFile.Length )
                    {
                        byte[] buffer = new byte[eachReadLength];
                        long copied = 0;
                        while( copied <= fromFile.Length - eachReadLength )
                        {
                            toCopyLength = fromFile.Read( buffer, 0, eachReadLength );
                            fromFile.Flush();
                            toFile.Write( buffer, 0, eachReadLength );
                            toFile.Flush();
                            //流的当前位置  
                            toFile.Position = fromFile.Position;
                            copied += toCopyLength;
                        }
                        int left = (int) ( fromFile.Length - copied );
                        toCopyLength = fromFile.Read( buffer, 0, left );
                        fromFile.Flush();
                        toFile.Write( buffer, 0, left );
                        toFile.Flush();

                    }
                    else
                    {
                        //如果每次拷贝的文件长度大于源文件的长度 则将实际文件长度直接拷贝  
                        byte[] buffer = new byte[fromFile.Length];
                        fromFile.Read( buffer, 0, buffer.Length );
                        fromFile.Flush();
                        toFile.Write( buffer, 0, buffer.Length );
                        toFile.Flush();
                    }

                    fromFile.Close();
                    toFile.Close();
                    return true;  
                }
            }
            catch( Exception )
            {
                return false;
                throw;
            }


        }
        /// <summary>  
        /// 是否存在  
        /// </summary>  
        public static bool ExitFile( string Path)
        {
            try
            {
                if( File.Exists( Path ) )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch( Exception )
            {
                return false;
                throw;
            }


        }
    }
}
