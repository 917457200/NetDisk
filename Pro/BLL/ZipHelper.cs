﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using ICSharpCode.SharpZipLib;
using ICSharpCode.SharpZipLib.Zip;
using ICSharpCode.SharpZipLib.Checksums;
using System.IO.Compression;

namespace CLeopardZip
{
    /// <summary>   
    /// 适用与ZIP压缩   
    /// </summary>   
    public static class ZipHelper
    {
        #region 压缩

        /// <summary>   
        /// 递归压缩文件夹的内部方法   
        /// </summary>   
        /// <param name="folderToZip">要压缩的文件夹路径</param>   
        /// <param name="zipStream">压缩输出流</param>   
        /// <param name="parentFolderName">此文件夹的上级文件夹</param>   
        /// <returns></returns>   
        private static bool ZipDirectory( string folderToZip, ZipOutputStream zipStream, string parentFolderName )
        {
            bool result = true;
            string[] folders, files;
            ZipEntry ent = null;
            FileStream fs = null;
            Crc32 crc = new Crc32();

            try
            {
                ent = new ZipEntry( Path.Combine( parentFolderName, Path.GetFileName( folderToZip ) + "/" ) );
                zipStream.PutNextEntry( ent );
                zipStream.Flush();

                files = Directory.GetFiles( folderToZip );
                foreach( string file in files )
                {
                    fs = File.OpenRead( file );

                    byte[] buffer = new byte[fs.Length];
                    fs.Read( buffer, 0, buffer.Length );
                    ent = new ZipEntry( Path.Combine( parentFolderName, Path.GetFileName( folderToZip ) + "/" + Path.GetFileName( file ) ) );
                    ent.DateTime = DateTime.Now;
                    ent.Size = fs.Length;

                    fs.Close();

                    crc.Reset();
                    crc.Update( buffer );

                    ent.Crc = crc.Value;
                    zipStream.PutNextEntry( ent );
                    zipStream.Write( buffer, 0, buffer.Length );
                }

            }
            catch
            {
                result = false;
            }
            finally
            {
                if( fs != null )
                {
                    fs.Close();
                    fs.Dispose();
                }
                if( ent != null )
                {
                    ent = null;
                }
                GC.Collect();
                GC.Collect( 1 );
            }

            folders = Directory.GetDirectories( folderToZip );
            foreach( string folder in folders )
                if( !ZipDirectory( folder, zipStream, folderToZip ) )
                    return false;

            return result;
        }

        /// <summary>   
        /// 压缩文件夹    
        /// </summary>   
        /// <param name="folderToZip">要压缩的文件夹路径</param>   
        /// <param name="zipedFile">压缩文件完整路径</param>   
        /// <param name="password">密码</param>   
        /// <returns>是否压缩成功</returns>   
        public static bool ZipDirectory( string folderToZip, string zipedFile, string password )
        {
            bool result = false;
            if( !Directory.Exists( folderToZip ) )
                return result;

            ZipOutputStream zipStream = new ZipOutputStream( File.Create( zipedFile ) );
            zipStream.SetLevel( 6 );
            if( !string.IsNullOrEmpty( password ) ) zipStream.Password = password;

            result = ZipDirectory( folderToZip, zipStream, "" );

            zipStream.Finish();
            zipStream.Close();

            return result;
        }

        /// <summary>   
        /// 压缩文件夹   
        /// </summary>   
        /// <param name="folderToZip">要压缩的文件夹路径</param>   
        /// <param name="zipedFile">压缩文件完整路径</param>   
        /// <returns>是否压缩成功</returns>   
        public static bool ZipDirectory( string folderToZip, string zipedFile )
        {
            bool result = ZipDirectory( folderToZip, zipedFile, null );
            return result;
        }

        /// <summary>   
        /// 压缩文件   
        /// </summary>   
        /// <param name="fileToZip">要压缩的文件全名</param>   
        /// <param name="zipedFile">压缩后的文件名</param>   
        /// <param name="password">密码</param>   
        /// <returns>压缩结果</returns>   
        public static bool ZipFile( string fileToZip, string zipedFile, string password )
        {
            bool result = true;
            ZipOutputStream zipStream = null;
            FileStream fs = null;
            ZipEntry ent = null;

            if( !File.Exists( fileToZip ) )
                return false;

            try
            {
                fs = File.OpenRead( fileToZip );
                byte[] buffer = new byte[fs.Length];
                fs.Read( buffer, 0, buffer.Length );
                fs.Close();

                fs = File.Create( zipedFile );
                zipStream = new ZipOutputStream( fs );
                if( !string.IsNullOrEmpty( password ) ) zipStream.Password = password;
                ent = new ZipEntry( Path.GetFileName( fileToZip ) );
                zipStream.PutNextEntry( ent );
                zipStream.SetLevel( 6 );

                zipStream.Write( buffer, 0, buffer.Length );

            }
            catch
            {
                result = false;
            }
            finally
            {
                if( zipStream != null )
                {
                    zipStream.Finish();
                    zipStream.Close();
                }
                if( ent != null )
                {
                    ent = null;
                }
                if( fs != null )
                {
                    fs.Close();
                    fs.Dispose();
                }
            }
            GC.Collect();
            GC.Collect( 1 );

            return result;
        }

        /// <summary>   
        /// 压缩文件   
        /// </summary>   
        /// <param name="fileToZip">要压缩的文件全名</param>   
        /// <param name="zipedFile">压缩后的文件名</param>   
        /// <returns>压缩结果</returns>   
        public static bool ZipFile( string fileToZip, string zipedFile )
        {
            bool result = ZipFile( fileToZip, zipedFile, null );
            return result;
        }

        /// <summary>   
        /// 压缩文件或文件夹   
        /// </summary>   
        /// <param name="fileToZip">要压缩的路径</param>   
        /// <param name="zipedFile">压缩后的文件名</param>   
        /// <param name="password">密码</param>   
        /// <returns>压缩结果</returns>   
        public static bool Zip( string fileToZip, string zipedFile, string password )
        {
            bool result = false;
            if( Directory.Exists( fileToZip ) )
                result = ZipDirectory( fileToZip, zipedFile, password );
            else if( File.Exists( fileToZip ) )
                result = ZipFile( fileToZip, zipedFile, password );

            return result;
        }

        /// <summary>   
        /// 压缩文件或文件夹   
        /// </summary>   
        /// <param name="fileToZip">要压缩的路径</param>   
        /// <param name="zipedFile">压缩后的文件名</param>   
        /// <returns>压缩结果</returns>   
        public static bool Zip( string fileToZip, string zipedFile )
        {
            bool result = Zip( fileToZip, zipedFile, null );
            return result;

        }
        
        #endregion
    }
}