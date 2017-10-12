using BLL;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Web.Core;

namespace EastElite.Controllers
{
    public class FileController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        BLL.YunFile.MyFile YunFile = new BLL.YunFile.MyFile();

        public static string VIR_PATH = "/Upload/Yun";

        public ActionResult Upload()
        {
            return View();
        }

        public ActionResult UploadMethod()
        {
            string fullFileName;
            GetCookie.ExistCookie();
            // 如果是文件上传请求
            if( !string.IsNullOrWhiteSpace( this.Request.Params["name"] ) )
            {
                int chunk = Request.Params["chunk"] != null ? int.Parse( Request.Params["chunk"] ) : 0;

                int chunks = Request.Params["chunks"] != null ? int.Parse( Request.Params["chunks"] ) : 0;

                string fileName = Request.Params["uploadfilename"] != null ? Request.Params["uploadfilename"] : "1.jpg";

                string parentFileId = Request.Params["parentFileId"] != null ? Request.Params["parentFileId"] : "";

                string Share = Request.Params["Share"] != null ? Request.Params["Share"].ToString() != "" ? Request.Params["Share"].ToString() : "" : "";

                var Size = chunks * 1024;

                string KZname = System.IO.Path.GetExtension( fileName ).ToLower();//扩展名


                //生成一个新的文件名称
                if( chunk == 0 )
                {
                    fullFileName = string.Format( "{0}", UploadPath( parentFileId, Share ) + "\\" + Guid.NewGuid() + KZname );
                }
                else
                {
                    fullFileName = Session["filename"].ToString();
                }


                Session["filename"] = fullFileName;

                FileStream fs = new FileStream( fullFileName, chunk == 0 ? FileMode.OpenOrCreate : FileMode.Append );

                //write our input stream to a buffer
                Byte[] buffer = null;
                if( Request.ContentType == "application/octet-stream" && Request.ContentLength > 0 )
                {
                    buffer = new Byte[Request.InputStream.Length];
                    Request.InputStream.Read( buffer, 0, buffer.Length );
                }
                else if( Request.ContentType.Contains( "multipart/form-data" ) && Request.Files.Count > 0 && Request.Files[0].ContentLength > 0 )
                {
                    buffer = new Byte[Request.Files[0].InputStream.Length];
                    Request.Files[0].InputStream.Read( buffer, 0, buffer.Length );
                }
                else
                {
                    return Content( "error" );
                }

                //write the buffer to a file.
                fs.Write( buffer, 0, buffer.Length );
                fs.Close();

                string ReturnFileUrl = fullFileName.Substring( FileHelper.CurrentBaseDir.Length );
                if( !ReturnFileUrl.StartsWith( @"\" ) )
                {
                    ReturnFileUrl = @"\" + ReturnFileUrl;
                }
                ReturnFileUrl = ReturnFileUrl.Replace( @"\", @"/" );

                string ReturnFileName = System.IO.Path.GetFileNameWithoutExtension( fileName.ToString() ) + KZname;
                return Content( string.Format( "{0}|{1}|{2}", "上传成功！", ReturnFileUrl, ReturnFileName ) );
            }
            return Content( "error" );
        }
        /// <summary>
        /// 上传文件时判断是否超过个人空间
        /// </summary>
        /// <param name="?">当前上传文件大小</param>
        /// <returns></returns>
        public bool IsOutFileSize( decimal FileSize )
        {
            bool result = false;
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            ////获取当前人的空间大小
            decimal UserSize = YunFile.GetDiskSize( U.userCode );
            decimal SumSize = YunFile.GetlistByCode( U.userCode );



            // 当前人的空间大小 + 当前上传文件大小
            decimal num = SumSize + FileSize / 1024;
            // 是否超出500 M
            if( num > UserSize )
            {
                result = true;
            }
            else
            {
                result = false;
            }
            return result;
        }
        /// <summary>
        /// 获取文件上传的路径
        /// </summary>
        public string UploadPath( string parentFileId, string Share )
        {
            //获取当前登陆人（当前登录人有对应文件如果不存在则创建）
            //Cookie 验证
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            string url = "";
            string GetFileMapPath = "";

            switch( parentFileId )
            {
                case "":
                case "0":
                    switch( Share )
                    {
                        case "1001":
                            url = VIR_PATH + "/School";
                            break;
                        case "1002":
                            url = VIR_PATH + "/Department";
                            break;
                        case "1003":
                            url = VIR_PATH + "/Group";
                            break;
                        default:
                            url = VIR_PATH + "/" + U.userCode;
                            break;
                    }
                    break;
                default:
                    YunFile.GetFileMapPath( parentFileId, Share, ref GetFileMapPath );
                    url = VIR_PATH + "/" + GetFileMapPath;
                    break;
            }

            if( !System.IO.Directory.Exists( Server.MapPath( url ) ) )
            {
                //不存在创建文件
                System.IO.Directory.CreateDirectory( Server.MapPath( url ) );
            }
            return Server.MapPath( url );

        }

        /// <summary>
        /// 向数据库插入上件的文件
        /// </summary>
        /// <returns></returns>
        public JsonResult AddMyYunFiles( string files, string parentFileId )
        {

            Session["filename"] = null;
            try
            {
                BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
                var json = new System.Web.Script.Serialization.JavaScriptSerializer();
                var fileAddresses = json.Deserialize<Model.YUN_FileInfo[]>( ( files ?? "[]" ) );

                if( fileAddresses != null && fileAddresses.Length != default( Int32 ) )
                {
                    using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
                    {
                        for( int i = default( Int32 ); i < fileAddresses.Length; i++ )
                        {
                            Model.YUN_FileInfo model = new Model.YUN_FileInfo();
                            model.FileName = fileAddresses[i].FileName;
                            model.FileExtName = System.IO.Path.GetExtension( fileAddresses[i].FileName );
                            model.FileSizeKb = Convert.ToInt32( fileAddresses[i].FileSizeKb );
                            model.FileCreateTime = DateTime.Now;
                            model.IsFolder = false;
                            model.FileUrl = fileAddresses[i].FileUrl;
                            model.CreateId = U.userCode;
                            model.FileState = true;
                            model.IsShare = false;
                            model.ParentFileId = ( parentFileId == "0" ? "" : parentFileId );
                            model.CreateName = U.userName;
                            model.CreateUnitCode = U.unitCode;
                            model.ShareTypeId = fileAddresses[i].ShareTypeId;
                            model.FileName = YunFile.FileReNameForExit( model.ParentFileId, U.userCode, model.FileName, 0, model.ShareTypeId, "" );

                            if( !string.IsNullOrEmpty( model.ShareTypeId ) )
                            {
                                model.IsShare = true;
                                model.ShareTime = DateTime.Now;
                                model.CreateId = "Admin";
                                if( model.ShareTypeId == "1003" )
                                {
                                    model.ShareGroupId = fileAddresses[i].ShareGroupId;
                                }
                                if( model.ShareTypeId == "1002" )
                                {
                                    model.CreateUnitCode = fileAddresses[i].ShareGroupId;
                                }
                            }
                            Db.YUN_FileInfo.Add( model );
                        }
                        Db.SaveChanges();
                    }
                    return Json( new { s = true } );
                }

                return Json( new { s = false } );
            }
            catch( Exception ex )
            {
                return Json( new { s = false, msg = ex.Message } );
            }
        }

        /// <summary>
        /// 文件下载(直接点击下载，一次下载一个文件)
        /// </summary>
        /// <param name="filePath"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult DownFile( string FileId )
        {
            List<Model.YUN_FileInfo> YunFileList = YunFile.GetFileByDown( "FileId", FileId.Trim( ',' ) );
            string browser = Request.UserAgent.ToUpper();//获得浏览器用户代理信息
            //if (browser.Contains("MS") == true && browser.Contains("IE") == true)//ie模式
            if( browser.Contains( "FIREFOX" ) == false )//判断是否为火狐
            {
                YunFileList[0].FileName = Server.UrlEncode( YunFileList[0].FileName );
            }
            string absoluFilePath = Server.MapPath( System.Configuration.ConfigurationManager.AppSettings["AttachmentPath"] + YunFileList[0].FileUrl );
            return new FileResult( absoluFilePath, YunFileList[0].FileName );
        }

        /// <summary>
        /// 文件下载(选择多个文件)
        /// </summary>
        /// <param name="filePath"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult DownFileMore( string FileIds )
        {
            if( FileIds.Contains( "add" ) )
            {
                FileIds = FileIds.Replace( "add", "" );
            }
            List<Model.YUN_FileInfo> YunFileList = YunFile.GetFileByDown( "FileId", FileIds.Trim( ',' ) );
            string browser = "", absoluFilePath = "";
            if( YunFileList.Count == 1 && YunFileList[0].IsFolder.ToString() != "True" )
            {
                browser = Request.UserAgent.ToUpper();//获得浏览器用户代理信息
                //if (browser.Contains("MS") == true && browser.Contains("IE") == true)//ie模式
                if( browser.Contains( "FIREFOX" ) == false )//判断是否为火狐
                {
                    YunFileList[0].FileName = Server.UrlEncode( YunFileList[0].FileName );
                }
                absoluFilePath = Server.MapPath( System.Configuration.ConfigurationManager.AppSettings["AttachmentPath"] + YunFileList[0].FileUrl );
                return new FileResult( absoluFilePath, YunFileList[0].FileName );
            }

            string[] file = new string[] { };
            int sumnumber = 0;
            if( YunFileList.Count > 0 )
            {
                for( var i = 0; i < YunFileList.Count; i++ )
                {
                    if( YunFileList[i].IsFolder.ToString() == "True" )
                    {
                        List<Model.YUN_FileInfo> YunFileList2 = YunFile.GetFileByDown( "ParentFileId", YunFileList[i].FileId.ToString() );

                        if( YunFileList2.Count > 0 )
                        {
                            foreach( var dr in YunFileList2 )
                            {
                                Array.Resize<string>( ref file, sumnumber + 1 );
                                file[sumnumber] = Server.MapPath( dr.FileUrl.ToString() );
                                sumnumber++;
                            }
                        }
                    }
                    else
                    {
                        Array.Resize<string>( ref file, sumnumber + 1 );
                        file[sumnumber] = Server.MapPath( YunFileList[i].FileUrl.ToString() );
                        sumnumber++;
                    }
                }
            }
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            string zipUrl = "";
            if( U == null )
            {
                zipUrl = "/Upload/Yun/压缩.zip";
            }
            else
            {
                zipUrl = "/Upload/Yun/" + U.userCode + "/压缩.zip";
            }

            string fileName = "下载文件压缩包.zip";


            ZipInfo.ZipSyem zip = new ZipInfo.ZipSyem();
            zip.Zip( Server.MapPath( zipUrl ), 6, file );


            browser = Request.UserAgent.ToUpper();//获得浏览器用户代理信息
            if( browser.Contains( "FIREFOX" ) == false )//判断是否为火狐
            {
                fileName = Server.UrlEncode( fileName );
            }
            absoluFilePath = Server.MapPath( System.Configuration.ConfigurationManager.AppSettings["AttachmentPath"] + zipUrl );

            return new FileResult( absoluFilePath, fileName );
        }
        /// <summary>
        /// 删除文件
        /// </summary>
        /// <param name="FileIds"></param>
        /// <returns></returns>
        public string DelMore( string FileIds )
        {
            string result = "";
            FileIds = FileIds.Trim( ',' );
            if( FileIds.Contains( "add" ) )
            {
                FileIds = FileIds.Replace( "add", "" );
            }

            string isFile = "";
            //删除磁盘中的数据
            List<Model.YUN_FileInfo> YunFileList = YunFile.GetFileByDown( "FileId", FileIds.Trim( ',' ) );
            for( var z = 0; z < YunFileList.Count; z++ )
            {
                //判断当前需要删的是否是文件夹，如果是文件夹则需删除文件夹下的所有文件
                string path = Server.MapPath( YunFileList[z].FileUrl.ToString() );
                isFile = YunFileList[z].IsFolder.ToString();
                if( isFile != "True" )
                {
                    YunFile.FileDelete( path );
                }

            }
            //删除数据库中的数据
            if( FileIds.Contains( ',' ) )
            {
                //批量删除
                string[] array = FileIds.Split( ',' );
                for( var i = 0; i < array.Length; i++ )
                {
                    IsShareMethods( array[i] );
                    if( YunFile.Delete( Convert.ToInt32( array[i] ) ) )
                    {
                        result = "suc";
                    }
                }
            }
            else
            {
                IsShareMethods( FileIds );
                if( YunFile.Delete( Convert.ToInt32( FileIds ) ) )//删除一个文件
                {

                    result = "suc";
                }
            }

            //删除文件夹下数据库中的文件数据
            if( isFile == "True" )
            {
                DeleteFileDg( FileIds );
            }

            return result;
        }

        //清空回收站
        public string ClearDel()
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            if( YunFile.ClearDel( U.userCode ) )
            {
                return "suc";
            }
            else
            {
                return "Err";
            }
        }

        //真正删除文件
        public string TrueDel( string FileIds )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            string result = "";
            FileIds = FileIds.Trim( ',' );
            if( FileIds.Contains( ',' ) )
            {

                string[] array = FileIds.Split( ',' );
                for( var i = 0; i < array.Length; i++ )
                {
                    if( YunFile.TrueDel( int.Parse( array[i].ToString() ) ) )
                    {
                        result = "suc";
                    }
                }
            }
            else
            {
                if( YunFile.TrueDel( int.Parse( FileIds ) ) )///真正删除文件
                {
                    result = "suc";
                }
            }
            return result;
        }

        /// <summary>
        /// 递归删除文件夹下所有文件(数据库中的的文件)
        /// </summary>
        /// <param name="dir"></param>
        public void DeleteFileDg( string Fileid )
        {

            List<Model.YUN_FileInfo> YunFileList = YunFile.GetFileByDown( "ParentFileId", Fileid.ToString() );
            var id = "";
            for( var d = 0; d < YunFileList.Count; d++ )
            {
                id = YunFileList[d].FileId.ToString();
                if( YunFileList[d].IsFolder.ToString() == "False" )
                {
                    YunFile.FileDelete( Server.MapPath( YunFileList[d].FileUrl.ToString() ) );//删磁盘文件
                }
                YunFile.Delete( Convert.ToInt32( YunFileList[d].FileId ) );//删库中数据
                DeleteFileDg( id );
            }
        }

        public string FileALLNavigation( string parentFileId )
        {
            string str = "<li>";
            if( parentFileId == "0" || parentFileId == "" )
            {
                str += "<a href=\"#\" >返回上一级</a>";
            }
            else
            {
                Model.YUN_FileInfo YunFileList = YunFile.GetFileByUp( "FileId", int.Parse( parentFileId ) );
                if( YunFileList != null )
                {
                    str += "<a href=\"/MyFile/MyFile?FileId=" + YunFileList.ParentFileId + "\" >返回上一级</a>";
                }
            }
            str += "<span class=\"historylistmanager-separator\">|</span>";
            str += "<a onclick=\"AllFileMethod()\" href=\"#\">全部文件</a>";
            str += "</li>";
            return str + FileOnClick( parentFileId, false );

        }

        public string ShareFileALLNavigation( string parentFileId )
        {
            string str = "<li>";
            if( parentFileId == "" || parentFileId == "0" )
            {
                str += "<a href=\"#\" >返回上一级</a>";
            }
            else
            {
                Model.YUN_FileInfo YunFileList = YunFile.GetFileByUp( "FileId", int.Parse( parentFileId ) );
                if( YunFileList != null )
                {
                    str += "<a href=\"/SchoolShare/School?FileId=" + YunFileList.ParentFileId + "\" >返回上一级</a>";
                }
            }
            str += "<span class=\"historylistmanager-separator\">|</span>";
            str += "<a onclick=\"DFBGShare.FlieShare.Flie.ShareFileMethod()\" href=\"#\">全部文件</a>";
            str += "</li>";
            return str + FileOnClick( parentFileId, true );

        }

        public string Navigation( string parentFileId, string Url )
        {
            string str = "<li>";
            if( parentFileId == "" || parentFileId == "0" )
            {
                str += "<a href=\"#\" >返回上一级</a>";
            }
            else
            {
                Model.YUN_FileInfo YunFileList = YunFile.GetFileByUp( "FileId", int.Parse( parentFileId ) );
                if( YunFileList != null )
                {
                    str += "<a href=\"" + Url + YunFileList.ParentFileId + "\" >返回上一级</a>";
                }
            }
            str += "<span class=\"historylistmanager-separator\">|</span>";
            str += "<a href=\"" + Url + "\"  href=\"#\">全部文件</a>";
            str += "</li>";
            return str + FileOnClick( parentFileId, true );

        }

        /// <summary>
        /// 获取文件上传的路径
        /// </summary>
        string FileHtml = "";
        public string FileOnClick( string parentFileId, bool Share )
        {
            string isFile = "";
            if( parentFileId == "" || parentFileId == "0" )
            {
                return "";
            }
            else
            {

                Model.YUN_FileInfo YunFileList = YunFile.GetFileByUp( "FileId", int.Parse( parentFileId ) );
                isFile = YunFileList.IsFolder.ToString();
                if( Share )
                {
                    FileHtml = "<li><span class=\"historylistmanager-separator-gt\">&gt;</span><a href=\"/SchoolShare/School?FileId=" + YunFileList.FileId + "\"><span title=\"ping\">" + YunFileList.FileName + "</span></a></li>" + FileHtml;
                }
                else
                {
                    FileHtml = "<li><span class=\"historylistmanager-separator-gt\">&gt;</span><a href=\"/MyFile/MyFile?FileId=" + YunFileList.FileId + "\"><span title=\"ping\">" + YunFileList.FileName + "</span></a></li>" + FileHtml;
                }

                if( isFile == "True" )
                {
                    FileOnClick( YunFileList.ParentFileId, Share );
                }

            }
            return FileHtml;

        }

        /// <summary>
        /// 文件重命名
        /// </summary>
        /// <returns></returns>
        public string ReNameMethod( int FileId, string Name )
        {
            string result = "";
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            Model.YUN_FileInfo Model = YunFile.GetModel( FileId );

            if( YunFile.FileIsExit( Name, FileId, Model.ParentFileId, U.userCode ) )
            {
                if( (bool) Model.IsFolder )
                {
                    Name = Name + "(1)";
                }
                else
                {
                    Name = Path.GetFileNameWithoutExtension( Name ) + "(1)" + Path.GetExtension( Name );
                }
            }
            if( YunFile.ReName( FileId, Name ) )
            {
                result = "suc";
            }
            return result;
        }

        /// <summary>
        /// 分享文件
        /// </summary>
        /// <returns></returns>
        public string ShareMethod( string FileId, string ShareTypeId )
        {
            string result = "";
            FileId = FileId.Trim( ',' );
            if( FileId.Contains( "add" ) )
            {
                FileId = FileId.Replace( "add", "" );
            }
            if( FileId.Contains( ',' ) )
            {
                //批量分享
                string[] array = FileId.Split( ',' );
                for( var i = 0; i < array.Length; i++ )
                {
                    Model.YUN_FileInfo Info = YunFile.GetModel( int.Parse( array[i].ToString() ) );
                    //if( bool.Parse( Info.IsFolder.ToString() ) && ShareTypeId == "1002" )
                    //{
                    //    return "NoCanShare";
                    //}
                    if( YunFile.Share( int.Parse( array[i].ToString() ), ShareTypeId, GetCookie.GetUserCookie().unitCode ) )
                    {
                        result = "suc";
                    }
                }
            }
            else
            {
                Model.YUN_FileInfo Info = YunFile.GetModel( int.Parse( FileId ) );
                //if( bool.Parse( Info.IsFolder.ToString() ) && ShareTypeId == "1002" )
                //{
                //    return "NoCanShare";
                //}
                if( YunFile.Share( int.Parse( FileId ), ShareTypeId, GetCookie.GetUserCookie().unitCode ) )//分享一个文件
                {
                    result = "suc";
                }
            }
            return result;
        }

        /// <summary>
        /// 文件取消分享
        /// </summary>
        /// <returns></returns>
        public string IsShareMethods( string FileId )
        {
            string result = "";
            FileId = FileId.Trim( ',' );
            if( FileId.Contains( "add" ) )
            {
                FileId = FileId.Replace( "add", "" );
            }
            if( FileId.Contains( ',' ) )
            {
                //批量取消分享
                string[] array = FileId.Split( ',' );
                for( var i = 0; i < array.Length; i++ )
                {
                    if( YunFile.IsShare( int.Parse( array[i].ToString() ) ) )
                    {
                        string ShareFileS = YunFile.GetModelByShareFileID( array[i].ToString() );
                        if( ShareFileS != "" )
                        {
                            TrueDel( ShareFileS );
                        }
                        result = "suc";
                    }
                }
            }
            else
            {
                if( YunFile.IsShare( int.Parse( FileId ) ) )
                {
                    string ShareFileS = YunFile.GetModelByShareFileID( FileId );
                    if( ShareFileS != "" )
                    {
                        TrueDel( ShareFileS );
                    }
                    result = "suc";
                }
            }
            return result;
        }
        //缩略图加载
        public FileContentResult ImgSuoLue( int FileId )
        {
            Model.YUN_FileInfo FileInfo = YunFile.GetModel( FileId );
            using( FileStream fs2 = new FileStream( Server.MapPath( FileInfo.FileUrl ), FileMode.Open, FileAccess.Read ) )
            {
                string Type = System.IO.Path.GetExtension( FileInfo.FileUrl ).ToLower().Replace( ".", "" );
                //生成184*180的缩略图
                using( Image photo = Image.FromStream( fs2, true ) )
                {
                    switch( Type )
                    {
                        case "gif":
                            MemoryStream gif = ImageShrink.ShrinkGifToStream( photo, 184, 180 );
                            photo.Dispose();
                            fs2.Close();
                            return File( gif.ToArray(), "image/gif" );
                        case "jpg":
                            MemoryStream jpeg = ImageShrink.ShrinkToStream( photo, 184, 180 );
                            photo.Dispose();
                            fs2.Close();

                            return File( jpeg.ToArray(), "image/jpeg" );
                        case "png":
                            MemoryStream png = ImageShrink.ShrinkToStream( photo, 184, 180 );
                            photo.Dispose();
                            fs2.Close();

                            return File( png.ToArray(), "image/png" );
                        case "bmp":
                            MemoryStream bmp = ImageShrink.ShrinkToStream( photo, 184, 180 );
                            photo.Dispose();
                            fs2.Close();

                            return File( bmp.ToArray(), "image/bmp" );
                        default:
                            MemoryStream jpg = ImageShrink.ShrinkToStream( photo, 184, 180 );
                            photo.Dispose();
                            fs2.Close();

                            return File( jpg.ToArray(), "image/jpeg" );
                    }
                }
            }
        }
        //大图像变小加载
        [LoginNeedsFilter( IsCheck = false )]

        public FileContentResult ImgLow( int FileId, int W, int H )
        {
            Model.YUN_FileInfo FileInfo = YunFile.GetModel( FileId );
            using( FileStream fs2 = new FileStream( Server.MapPath( FileInfo.FileUrl ), FileMode.Open, FileAccess.Read ) )
            {
                string Type = System.IO.Path.GetExtension( FileInfo.FileUrl ).ToLower().Replace( ".", "" );
                //生成缩略图
                Image photo = Image.FromStream( fs2, true );
                int Width = photo.Width > W ? W : photo.Width;
                int Height = photo.Height > H ? H : photo.Height;

                switch( Type )
                {
                    case "gif":
                        MemoryStream gif = ImageShrink.ShrinkGifToStream( photo, Width, Height );
                        photo.Dispose();

                        return File( gif.ToArray(), "image/gif" );
                    case "jpg":
                        MemoryStream jpeg = ImageShrink.ShrinkToStream( photo, Width, Height );
                        photo.Dispose();

                        return File( jpeg.ToArray(), "image/jpeg" );
                    case "png":
                        MemoryStream png = ImageShrink.ShrinkToStream( photo, Width, Height );
                        photo.Dispose();

                        return File( png.ToArray(), "image/png" );
                    case "bmp":
                        MemoryStream bmp = ImageShrink.ShrinkToStream( photo, Width, Height );
                        photo.Dispose();

                        return File( bmp.ToArray(), "image/bmp" );
                    default:
                        MemoryStream jpg = ImageShrink.ShrinkToStream( photo, Width, Height );
                        photo.Dispose();

                        return File( jpg.ToArray(), "image/jpeg" );
                }
            }

        }
        public ActionResult TxtDownload( string path, string FileName )
        {
            string txtname = "~/" + path.Split( '/' )[path.Split( '/' ).Length - 1].ToString();
            string Txtpath = path.Substring( 0, path.Length - txtname.Length );
            return File( new FileStream( AppDomain.CurrentDomain.BaseDirectory + path, FileMode.Open ), "text/plain", FileName );
        }

        /// <summary>
        /// 移动文件、复制文件
        /// </summary>
        /// <param name="FileIdList">要移动的文件Id集合</param>
        /// <param name="WhereId">目标文件夹</param>
        /// <param name="MoveType">类型 1复制 2移动</param>
        /// <returns></returns>
        public string FileMove( string FileIdList, string WhereId, string MoveType, string Share )
        {
            if( FileIdList.Contains( "add" ) )
            {
                FileIdList = FileIdList.Replace( "add", "" );
            }
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            if( YunFile.FileIsExit( FileIdList.Trim( ',' ), WhereId, U.userCode ) )
            {
                return "FileExit";
            }
            else
            {
                FileMoveTo( FileIdList.Trim( ',' ), WhereId, MoveType, Share );

            }
            return "suc";
        }
        /// <summary>
        /// 移动文件、复制文件
        /// </summary>
        /// <param name="FileIdList">要移动的文件Id集合</param>
        /// <param name="WhereId">目标文件夹</param>
        /// <param name="MoveType">类型 1复制 2移动</param>
        /// <returns></returns>
        public string FileMoveTo( string FileIdList, string WhereId, string MoveType, string Share )
        {
            if( FileIdList.Contains( "add" ) )
            {
                FileIdList = FileIdList.Replace( "add", "" );
            }
            int re; bool Copy = false;
            List<Model.YUN_FileInfo> YunFileList = YunFile.GetFileByDown( "FileId", FileIdList.Trim( ',' ) );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

                foreach( var item in YunFileList )
                {
                    if( WhereId == item.FileId.ToString() )
                    {
                        return "";
                    }
                    item.ParentFileId = WhereId;
                    item.FileState = true;
                    item.IsShare = false;
                    if( item.IsFolder == true )
                    {
                        Copy = true;
                    }
                    string FileUrl = item.FileUrl;
                    string FileMapPath = "";
                    YunFile.GetFileMapPath( WhereId, Share, ref FileMapPath );
                    FileMapPath = ( FileMapPath == "" ? "" : FileMapPath );

                    item.FileUrl = "/Upload/Yun/" + FileMapPath + "/" + Path.GetFileName( item.FileUrl );

                    //已有文件
                    if( FileHelper.ExitFile( Server.MapPath( item.FileUrl ) ) )
                    {
                        item.FileUrl = "/Upload/Yun/" + FileMapPath + "/" + Guid.NewGuid() + Path.GetExtension( item.FileUrl );
                        item.FileName = YunFile.FileReNameForExit( item.ParentFileId, U.userCode, item.FileName, 0, Share, "" );
                    }
                    //文件复制
                    if( FileHelper.CopyFile( Server.MapPath( FileUrl ), Server.MapPath( item.FileUrl ), 1024 * 1024 ) )
                    {
                        Copy = true;
                    }
                    int OldId = item.FileId;

                    //移动、复制
                    switch( MoveType )
                    {
                        case "1":
                            if( item.IsFolder == true )
                            {
                                item.FileName = YunFile.FileReNameForExit( item.ParentFileId, U.userCode, item.FileName, 0, Share, "" );
                                Db.YUN_FileInfo.Add( item );
                                Db.SaveChanges();
                                List<Model.YUN_FileInfo> DownFileList = YunFile.GetFileByDown( "ParentFileId", OldId.ToString() );
                                for( int i = 0; i < DownFileList.Count; i++ )
                                {
                                    FileMoveTo( DownFileList[i].FileId.ToString(), item.FileId.ToString(), MoveType, Share );
                                }
                            }
                            else
                            {
                                Db.YUN_FileInfo.Add( item );
                                Db.SaveChanges();
                            }
                            break;
                        case "2":
                            if( Copy )
                            {
                                DbEntityEntry<Model.YUN_FileInfo> entry = Db.Entry<Model.YUN_FileInfo>( item );
                                entry.State = System.Data.Entity.EntityState.Modified;
                                string OldFileMapPath = "";
                                YunFile.GetFileMapPath( OldId.ToString(), Share, ref OldFileMapPath );

                                if( item.IsFolder == true )
                                {
                                    item.FileName = YunFile.FileReNameForExit( item.ParentFileId, U.userCode, item.FileName, 0, Share, "" );
                                    Db.SaveChanges();
                                    if( !System.IO.Directory.Exists( Server.MapPath( "/Upload/Yun/" + FileMapPath ) ) )
                                    {
                                        //不存在创建文件
                                        System.IO.Directory.CreateDirectory( Server.MapPath( "/Upload/Yun/" + FileMapPath ) );
                                    }
                                    List<Model.YUN_FileInfo> DownFileList = YunFile.GetFileByDown( "ParentFileId", OldId.ToString() );
                                    for( int i = 0; i < DownFileList.Count; i++ )
                                    {
                                        FileMoveTo( DownFileList[i].FileId.ToString(), item.FileId.ToString(), MoveType, Share );
                                    }

                                    if( System.IO.Directory.Exists( Server.MapPath( "/Upload/Yun/" + OldFileMapPath ) ) )
                                    {
                                        System.IO.Directory.Delete( Server.MapPath( "/Upload/Yun/" + OldFileMapPath ) );
                                    }
                                }
                                else
                                {
                                    Db.SaveChanges();
                                    YunFile.DeleteFile( Server.MapPath( FileUrl ) );
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }

            }
            return "suc";
        }
        //还原文件
        public string Reduction( string FileId )
        {
            string result = "";
            FileId = FileId.Trim( ',' );
            if( FileId.Contains( "add" ) )
            {
                FileId = FileId.Replace( "add", "" );
            }
            if( FileId.Contains( ',' ) )
            {
                //批量还原
                string[] array = FileId.Split( ',' );
                for( var i = 0; i < array.Length; i++ )
                {
                    if( YunFile.Reduction( int.Parse( array[i].ToString() ) ) )
                    {
                        result = "suc";
                    }
                }
            }
            else
            {
                if( YunFile.Reduction( int.Parse( FileId ) ) )
                {
                    result = "suc";
                }
            }
            return result;
        }
    }

    [LoginNeedsFilter( IsCheck = false )]
    public class FileResult : ActionResult
    {
        /// <summary>
        /// 该类继承了ActionResult，通过重写ExecuteResult方法，进行文件的下载
        /// </summary>
        private readonly string _filePath;//文件路径
        private readonly string _fileName;//文件名称
        [LoginNeedsFilter( IsCheck = false )]
        public FileResult( string filePath, string fileName )
        {
            _filePath = filePath;
            _fileName = fileName;
        }
        [LoginNeedsFilter( IsCheck = false )]
        public override void ExecuteResult( ControllerContext context )
        {
            string fileName = _fileName;
            HttpResponseBase response = context.HttpContext.Response;
            if( File.Exists( _filePath ) )
            {
                FileStream fs = null;
                byte[] fileBuffer = new byte[1024 * 100];//每次读取1024字节大小的数据
                try
                {
                    using( fs = File.OpenRead( _filePath ) )
                    {
                        long totalLength = fs.Length;
                        response.ContentType = "application/octet-stream";
                        response.AddHeader( "Content-Disposition", "attachment; filename=" + fileName );
                        while( totalLength > 0 && response.IsClientConnected )//持续传输文件
                        {
                            int length = fs.Read( fileBuffer, 0, fileBuffer.Length );//每次读取1024个字节长度的内容
                            fs.Flush();
                            response.OutputStream.Write( fileBuffer, 0, length );//写入到响应的输出流
                            response.Flush();//刷新响应
                            totalLength = totalLength - length;
                        }
                        response.Close();//文件传输完毕，关闭相应流
                    }
                }
                catch( Exception ex )
                {
                    response.Write( ex.Message );
                }
                finally
                {
                    if( fs != null )
                        fs.Close();//最后记得关闭文件流
                }
            }
        }

    }
}