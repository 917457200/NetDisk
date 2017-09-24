using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace BLL
{
    public class VideoConverter : System.Web.UI.Page
    {
        static string[] strArrMencoder = new string[] { "rmvb", "rm", "swf", "DV" };
        static string[] strArrFfmpeg = new string[] { "asf", "avi", "3gp", "mov", "wmv", "m4a", "mpeg", "mpg" };
        #region 配置
        public static string ffmpegtool = HttpContext.Current.Server.MapPath( "\\Application\\jwplayer-6.12.0\\ffmpeg.exe" );
        public static string mencodertool = HttpContext.Current.Server.MapPath( "\\Application\\jwplayer-6.12.0\\mencoder.exe" );
        public static string sizeOfImg = "240x180";
        public static string widthOfFile = "900";
        public static string heightOfFile = "600";
        #endregion
        public VideoConverter()
        {
        }
        #region 获取文件扩展名和转换类型
        /// <summary>
        /// 获取文件扩展名
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static string GetFileExtension( string fileName )
        {
            int i = fileName.LastIndexOf( "." ) + 1;

            return fileName.Substring( i );
        }
        /// <summary>
        /// 检查使用转换工具的类型
        /// ffmpeg或mencoder
        /// </summary>
        /// <param name="extension"></param>
        /// <returns></returns>
        public static string CheckExtension( string extension )
        {
            string m_strReturn = "";
            foreach( string var in strArrFfmpeg )
            {
                if( var.ToUpper() == extension.ToUpper() )
                {
                    m_strReturn = "ffmpeg"; break;
                }
            }
            if( m_strReturn == "" )
            {
                foreach( string var in strArrMencoder )
                {
                    if( var.ToUpper() == extension.ToUpper() )
                    {
                        m_strReturn = "mencoder"; break;
                    }
                }
            }
            return m_strReturn;
        }
        #endregion
        #region 不分类型转换文件入口(这里是绝对路径)
        /// <summary>
        /// 转换文件
        /// </summary>
        /// <param name="tempFilePath"></param>
        /// <param name="playFile"></param>
        /// <param name="imgFile"></param>
        /// <returns></returns>
        public string ChangeFile( string tempFilePath, string playFile, string imgFile )
        {
            string m_strExtension = GetFileExtension( tempFilePath ).ToLower();
            string Extension = CheckExtension( m_strExtension );

            if( Extension == "ffmpeg" )
            {
                return FChangeFilePhy( tempFilePath, playFile, imgFile );
            }
            else if( Extension == "mencoder" )
            {
                return MChangeFilePhy( tempFilePath, playFile, imgFile );
            }
            else
            {
                return string.Empty;
            }
        }
        #endregion

        #region 运行FFMpeg的视频解码(这里是绝对路径)
        /// <summary>
        /// 转换文件并保存在指定文件夹下面(这里是绝对路径)
        /// </summary>
        /// <param name="fileName">上传视频文件的路径（原文件）</param>
        /// <param name="playFile">转换后的文件的路径（网络播放文件）</param>
        /// <param name="imgFile">从视频文件中抓取的图片路径</param>
        /// <returns>成功:返回图片虚拟地址; 失败:返回空字符串</returns>
        public string FChangeFilePhy( string fileName, string playFile, string imgFile )
        {
            //取得ffmpeg.exe的路径,路径配置在Web.Config中,
            //如:<add key="ffmpeg" value="E:\51aspx\ffmpeg.exe" />
            //string ffmpeg = Server.MapPath(PublicMethod.ffmpegtool);
            //string ffmpeg = @"G:\视频转换\ffmpeg\ffmpeg.exe";
            string ffmpeg = VideoConverter.ffmpegtool;
            if( ( !System.IO.File.Exists( ffmpeg ) ) || ( !System.IO.File.Exists( fileName ) ) )
            {
                return "";
            }

            //获得图片和(.flv)文件相对路径/最后存储到数据库的路径,如:/Web/User1/00001.jpg
            string flv_file = System.IO.Path.ChangeExtension( playFile, ".flv" );

            //截图的尺寸大小,配置在Web.Config中,如:<add key="CatchFlvImgSize" value="240x180" />
            string FlvImgSize = VideoConverter.sizeOfImg;

            System.Diagnostics.ProcessStartInfo FilestartInfo = new System.Diagnostics.ProcessStartInfo( ffmpeg );

            FilestartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;

            FilestartInfo.Arguments = " -i " + fileName + " -ab 56 -ar 22050 -b 500 -r 15 -s " + widthOfFile + "x" + heightOfFile + " " + flv_file;

            //转换
            Process prc = System.Diagnostics.Process.Start( FilestartInfo );
            //截图
            FCatchImg( fileName, imgFile );

            while( !prc.HasExited )
            {
                Thread.Sleep( 1000 );
            }

            return "";
        }

        /// <summary>
        /// 生成截图
        /// </summary>
        /// <param name="fileName"></param>
        /// <param name="imgFile"></param>
        /// <returns></returns>
        public string FCatchImg( string fileName, string imgFile )
        {
            string ffmpeg = VideoConverter.ffmpegtool;
            string flv_img = imgFile + ".jpg";
            string FlvImgSize = VideoConverter.sizeOfImg;

            System.Diagnostics.ProcessStartInfo ImgstartInfo = new System.Diagnostics.ProcessStartInfo( ffmpeg );
            ImgstartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
            ImgstartInfo.Arguments = " -i " + fileName + " -y -f image2 -ss 2 -vframes 1 -s " + FlvImgSize + " " + flv_img;

            Process prc = System.Diagnostics.Process.Start( ImgstartInfo );

            while( !prc.HasExited )
            {
                Thread.Sleep( 1000 );
            }

            if( System.IO.File.Exists( flv_img ) )
            {
                return flv_img;
            }
            return "";
        }
        #endregion

        #region 运行mencoder的视频解码器转换(这里是绝对路径)
        /// <summary>
        /// 运行mencoder的视频解码器转换
        /// </summary>
        /// <param name="vFileName"></param>
        /// <param name="playFile"></param>
        /// <param name="imgFile"></param>
        /// <returns></returns>
        public string MChangeFilePhy( string vFileName, string playFile, string imgFile )
        {
            string tool = VideoConverter.mencodertool;
            //Server.MapPath(PublicMethod.mencodertool);

            //string mplaytool = Server.MapPath(PublicMethod.ffmpegtool);
            if( ( !System.IO.File.Exists( tool ) ) || ( !System.IO.File.Exists( vFileName ) ) )
            {
                return "";
            }
            string flv_file = System.IO.Path.ChangeExtension( playFile, ".flv" );

            //截图的尺寸大小,配置在Web.Config中,如:<add key="CatchFlvImgSize" value="240x180" />
            string FlvImgSize = VideoConverter.sizeOfImg;

            System.Diagnostics.ProcessStartInfo FilestartInfo = new System.Diagnostics.ProcessStartInfo( tool );
            FilestartInfo.UseShellExecute = false;
            FilestartInfo.CreateNoWindow = true;
            FilestartInfo.RedirectStandardInput = true;
            FilestartInfo.RedirectStandardOutput = true;
            FilestartInfo.RedirectStandardError = true;

            FilestartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;

            //FilestartInfo.Arguments = " " + vFileName + " -o " + flv_file + " -of lavf -lavfopts i_certify_that_my_video_stream_does_not_use_b_frames -oac mp3lame -lameopts abr:br=56 -ovc lavc -lavcopts vcodec=flv:vbitrate=200:mbd=2:mv0:trell:v4mv:cbp:last_pred=1:dia=-1:cmp=0:vb_strategy=1 -vf scale=" + widthOfFile + ":" + heightOfFile + " -ofps 12 -srate 22050";
            FilestartInfo.Arguments = " " + vFileName + " -o " + flv_file + " -of lavf -oac mp3lame -lameopts abr:br=56 -ovc lavc -lavcopts vcodec=flv:vbitrate=200:mbd=2:mv0:trell:v4mv:cbp:last_pred=1:dia=-1:cmp=0:vb_strategy=1 -vf scale=512:512 -ofps 12 -srate 22050";

            Process prc = System.Diagnostics.Process.Start( FilestartInfo );
            while( !prc.HasExited )
            {
                Thread.Sleep( 1000 );
            }

            //获取图片
            FCatchImg( flv_file, imgFile );

            return "";
        }
        #endregion
    }
}