using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace BLL.YunFile
{
    public class MyFile
    {
        DataSetToList List = new DataSetToList();
        public string str4 = AppDomain.CurrentDomain.BaseDirectory;    //获取基目录，它由程序集冲突解决程序用来探测程序集。

        /// <summary>
        /// 获取我的网盘数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> MyFileLoad( string FileId, string SearchName, string CreateId )
        {
            string wherestr = "";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr = " and FileName like '%" + SearchName + "%'";
            }
            else
            {
                wherestr = " and ParentFileId='" + FileId + "'";
            }

            if( CreateId != null && CreateId != "" )
            {
                wherestr += " AND [CreateId] = '" + CreateId + "'";
            }
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 " + wherestr + " ORDER BY IsFolder DESC " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取学校分享数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> ShareFileLoad( string FileId, string SearchName )
        {
            string wherestr = "";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr = " and FileName like '%" + SearchName + "%'";
            }
            else
            {
                wherestr = " and ParentFileId='" + FileId + "'";
            }
            wherestr += " AND ShareTypeId ='1001' and( CreateId='User' or CreateId='Admin') ";
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 " + wherestr + " ORDER BY IsFolder DESC " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取部门分享数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> ShareDepartmentLoad( string FileId, string SearchName, string UnitCode )
        {
            string wherestr = "";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr = " and FileName like '%" + SearchName + "%'";
            }
            else
            {
                wherestr = " and ParentFileId='" + FileId + "'";
            }
            wherestr += " AND ShareTypeId ='1002' and CreateUnitCode='" + UnitCode + "' and (CreateId = 'User'OR CreateId = 'Admin')";
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 " + wherestr + " ORDER BY IsFolder DESC " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取用户组分享数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> UserShareLoad( string GroupId, string FileId, string SearchName )
        {
            string wherestr = "";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr = " and FileName like '%" + SearchName + "%'";
            }
            else
            {
                wherestr = " and ParentFileId='" + FileId + "'";
            }
            wherestr += " AND ShareTypeId ='1003' and ShareGroupId='" + GroupId + "' and (CreateId = 'User'OR CreateId = 'Admin')";
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 " + wherestr + " ORDER BY IsFolder DESC " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取我的好友分享数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> MyFriendLoad( string FileIds, string FileId )
        {
            string wherestr = "";
            if( FileId != "" )
            {
                wherestr = " and ParentFileId = " + FileId;
            }
            else
            {
                if( !string.IsNullOrEmpty( FileIds ) )
                {
                    wherestr = " and FileId in (" + FileIds + ")";
                }
                wherestr += " AND ShareTypeId ='1004' ";
            }
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 " + wherestr + " ORDER BY IsFolder DESC " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );
                return result1.ToList();
            }
        }
        /// <summary>
        /// 分类获取我的网盘数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> MyFileShow( string wherestr )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT * From YUN_FileInfo" );
            strSql.Append( " where FileState=1 and IsFolder=0 " + wherestr + " ORDER BY IsFolder DESC " );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取我分享的数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> MyShareOrDelFileLoad( int pageIndex, int pageSize, string wherestr, string Ord )
        {
            int startRow = ( pageIndex - 1 ) * pageSize;
            StringBuilder strSql = new StringBuilder();

            strSql.Append( " SELECT TOP " + pageSize + " *,(SELECT ShareTypeName FROM dbo.ShareInfo WHERE ShareTypeId =A.ShareTypeId) as ShareTypeName From (SELECT ROW_NUMBER() OVER (ORDER BY " + Ord + " desc) AS RowNumber,* FROM YUN_FileInfo where" + wherestr + " ) as A " );
            strSql.Append( "WHERE  RowNumber > " + startRow + " ORDER BY " + Ord + " desc " );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DataSet Dt = SqlQueryForDataTatable1( Db.Database, strSql.ToString() );
                List<Model.YUN_FileInfo> result1 = List.ToList<Model.YUN_FileInfo>( Dt, 0 );

                return result1.ToList();
            }
        }
        /// <summary>
        /// EF SQL 语句返回 dataTable
        /// </summary>
        /// <param name="db"></param>
        /// <param name="sql"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        public DataSet SqlQueryForDataTatable1( Database db, string sql )
        {
            SqlConnection conn = new System.Data.SqlClient.SqlConnection();
            conn = (SqlConnection) db.Connection;
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = sql;
            SqlDataAdapter adapter = new SqlDataAdapter( cmd );
            DataSet table = new DataSet();
            adapter.Fill( table );
            conn.Close();//连接需要关闭
            conn.Dispose();
            return table;
        }
        /// <summary>
        /// 获取总个数
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public int GetCount( string sql )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<int> result2 = Db.Database.SqlQuery<int>( "SELECT count(*) FROM YUN_FileInfo where " + sql );
                return result2.FirstOrDefault();
            }
        }
        /// <summary>
        /// 向下 获取文件
        /// </summary>
        /// <param name="field"></param>
        /// <param name="Ids"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> GetFileByDown( string field, string Ids )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT " );
            strSql.Append( " *" );
            strSql.Append( " FROM YUN_FileInfo where " );
            strSql.Append( string.Format( "{0} In ({1})", field, Ids ) );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }

        /// <summary>
        /// 递归向上 获取文件夹名
        /// </summary>
        /// <param name="parentFileId"></param>
        /// <returns></returns>
        public void GetFileMapPath( string parentFileId, string IsShare, string userCode, ref string path )
        {
            string isFile = "";
            //空值和0 是我的网盘否是最顶部
            switch( parentFileId )
            {
                case "":
                case "0":
                    switch( IsShare )
                    {
                        case "1001":
                            path = "School/" + path;
                            break;
                        case "1002":
                            path = "Department/" + path;
                            break;
                        case "1003":
                            path = "Group/" + path;
                            break;
                        default:
                            path = userCode + "/" + path;
                            break;
                    }
                    break;
                default:
                    Model.YUN_FileInfo YunFileList = GetFileByUp( "FileId", int.Parse( parentFileId ) );
                    if( path == "" )
                    {
                        path = YunFileList.FileId.ToString();
                    }
                    else
                    {
                        path = YunFileList.FileId.ToString() + "/" + path;
                    }
                    isFile = YunFileList.IsFolder.ToString();
                    if( isFile == "True" )
                    {
                        GetFileMapPath( YunFileList.ParentFileId, IsShare, userCode, ref  path );
                    }
                    break;
            }

        }
        /// <summary>
        /// 向上 获取文件夹名
        /// </summary>
        /// <param name="field"></param>
        /// <param name="Ids"></param>
        /// <returns></returns>
        public Model.YUN_FileInfo GetFileByUp( string field, int Ids )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT " );
            strSql.Append( " *" );
            strSql.Append( " FROM YUN_FileInfo where " );
            strSql.Append( string.Format( "{0} = {1}  AND FileState=1 ", field, Ids ) );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );

                return result1.FirstOrDefault();
            }
        }
        /// <summary>
        /// 递归向上 获取文件夹名
        /// </summary>
        /// <param name="parentFileId"></param>
        /// <returns></returns>
        public void GetFileMapPathByDel( string parentFileId, string userCode, string IsShare, ref string path )
        {
            string isFile = "";
            //空值和0 是我的网盘否是最顶部
            switch( parentFileId )
            {
                case "":
                case "0":

                    switch( IsShare )
                    {
                        case "1001":
                            path = "School/" + path;
                            break;
                        case "1002":
                            path = "Department/" + path;
                            break;
                        case "1003":
                            path = "Group/" + path;
                            break;
                        default:
                            path = userCode + "/" + path;
                            break;
                    }
                    break;
                default:
                    Model.YUN_FileInfo YunFileList = GetModel( int.Parse( parentFileId ) );
                    if( path == "" )
                    {
                        path = YunFileList.FileId.ToString();
                    }
                    else
                    {
                        path = YunFileList.FileId.ToString() + "/" + path;
                    }
                    isFile = YunFileList.IsFolder.ToString();
                    if( isFile == "True" )
                    {
                        GetFileMapPathByDel( YunFileList.ParentFileId, userCode, IsShare, ref  path );
                    }
                    break;
            }

        }
        /// <summary>
        /// 获取文件夹(复制文件/剪切文件)
        /// </summary>
        /// <param name="field"></param>
        /// <param name="Ids"></param>
        /// <returns></returns>
        public DataTable GetFileList( string ParentFileId, string CreateId, string Share, string GroupOrAgencyId )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT " );
            switch( Share )
            {
                case "1001":
                    strSql.Append( " *,(SELECT COUNT(*) FROM dbo.YUN_FileInfo WHERE ShareTypeId='1001' and IsFolder = 1 AND FileState = 1 AND ParentFileId = A.FileId  and( CreateId='User' or CreateId='Admin') )as IsChildFolder" );
                    strSql.Append( " FROM dbo.YUN_FileInfo AS A " );
                    strSql.Append( string.Format( "WHERE ShareTypeId='1001' and IsFolder = 1 AND FileState = 1 AND ParentFileId = '{0}'and( CreateId='User' or CreateId='Admin')", ParentFileId ) );
                    break;
                case "1002":
                    strSql.Append( " *,(SELECT COUNT(*) FROM dbo.YUN_FileInfo WHERE  ShareTypeId ='1002' and ( CreateId='User' or CreateId='Admin') and CreateUnitCode='" + GroupOrAgencyId + "' )as IsChildFolder" );
                    strSql.Append( " FROM dbo.YUN_FileInfo AS A " );
                    strSql.Append( string.Format( "WHERE  ShareTypeId ='1002' and IsFolder = 1 AND FileState = 1 and ( CreateId='User' or CreateId='Admin') AND ParentFileId = '{0}' and CreateUnitCode='" + GroupOrAgencyId + "'", ParentFileId ) );
                    break;
                case "1003":
                    strSql.Append( " *,(SELECT COUNT(*) FROM dbo.YUN_FileInfo WHERE  ShareTypeId ='1003' and ( CreateId='User' or CreateId='Admin') and ShareGroupId='" + GroupOrAgencyId + "' )as IsChildFolder" );
                    strSql.Append( " FROM dbo.YUN_FileInfo AS A " );
                    strSql.Append( string.Format( "WHERE  ShareTypeId ='1003' and IsFolder = 1 AND FileState = 1 and ( CreateId='User' or CreateId='Admin') AND ParentFileId = '{0}' and ShareGroupId='" + GroupOrAgencyId + "'", ParentFileId ) );
                    break;
                default:
                    strSql.Append( string.Format( " *,(SELECT COUNT(*) FROM dbo.YUN_FileInfo WHERE  CreateId = '{0}' AND IsFolder = 1 AND FileState = 1 AND ParentFileId = A.FileId  )as IsChildFolder", CreateId ) );
                    strSql.Append( " FROM dbo.YUN_FileInfo AS A " );
                    strSql.Append( string.Format( "WHERE   CreateId ='{1}' and IsFolder = 1 AND FileState = 1 AND ParentFileId = '{0}'", ParentFileId, CreateId ) );
                    break;
            }
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DataSet Dt = List.SqlQueryForDataTatable( Db.Database, strSql.ToString() );
                return Dt.Tables[0];
            }
        }
        /// <summary>
        /// 获取文件夹(复制文件/剪切文件)
        /// </summary>
        /// <param name="field"></param>
        /// <param name="Ids"></param>
        /// <returns></returns>
        public List<Model.YUN_FileInfo> GetFileListByFileIds( string FileIdS )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT " );
            strSql.Append( " * " );
            strSql.Append( " FROM dbo.YUN_FileInfo AS A " );
            strSql.Append( string.Format( "WHERE  FileId in ({0})", FileIdS ) );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DataSet Dt = List.SqlQueryForDataTatable( Db.Database, strSql.ToString() );
                List<Model.YUN_FileInfo> result1 = List.ToList<Model.YUN_FileInfo>( Dt, 0 );
                return result1;
            }
        }
        /// <summary> 
        /// 文件删除
        /// </summary>
        /// <param name="path"></param>
        public void FileDelete( string path )
        {
            if( File.Exists( path ) )
            {
                File.Delete( path );
            }
        }
        /// <summary> 
        /// 文件删除
        /// </summary>
        /// <param name="path"></param>
        public void DeleteFile( string path )
        {
            try
            {
                if( File.Exists( path ) )
                {
                    File.Delete( path );
                }
            }
            catch( Exception )
            {
                throw;
            }
        }
        public void DeleteFolderFile( string path )
        {
            try
            {
                if( System.IO.Directory.Exists( path ) )
                {
                    System.IO.Directory.Delete( path, true );
                }
            }
            catch( Exception )
            {
                throw;
            }
        }
        /// <summary>
        /// 删除一条数据
        /// </summary>
        public bool Delete( int delId )
        {
            Model.YUN_FileInfo F = GetModel( delId );
            if( F.FileUrl.IndexOf( "School" ) > -1 || F.FileUrl.IndexOf( "Department" ) > -1 || F.FileUrl.IndexOf( "Group" ) > -1 )
            {
                return ShareTrueDel( delId );
            }
            else
            {
                F.FileState = false;
                F.FileDeleteTime = DateTime.Now;
                using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
                {

                    DbEntityEntry<Model.YUN_FileInfo> entry = Db.Entry<Model.YUN_FileInfo>( F );
                    entry.State = System.Data.Entity.EntityState.Modified;

                    int rows = Db.SaveChanges();
                    if( rows > 0 )
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        /// <summary>
        /// 文件重命名
        /// </summary>
        public bool ReName( int FileId, string FileName )
        {
            Model.YUN_FileInfo F = new Model.YUN_FileInfo() { FileId = FileId, FileName = FileName };
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.YUN_FileInfo.Attach( F );
                Db.Entry( F ).Property( x => x.FileName ).IsModified = true;
                int rows = Db.SaveChanges();
                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        /// <summary>
        /// 文件分享
        /// </summary>
        public bool Share( int FileId, string ShareTypeId, string unitCode )
        {
            Model.YUN_FileInfo F = new Model.YUN_FileInfo() { FileId = FileId, IsShare = true, ShareTypeId = ShareTypeId, CreateUnitCode = unitCode, ShareTime = DateTime.Now };
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.YUN_FileInfo.Attach( F );
                Db.Entry( F ).Property( x => x.IsShare ).IsModified = true;
                Db.Entry( F ).Property( x => x.ShareTypeId ).IsModified = true;
                Db.Entry( F ).Property( x => x.CreateUnitCode ).IsModified = true;
                Db.Entry( F ).Property( x => x.ShareTime ).IsModified = true;

                int rows = Db.SaveChanges();
                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        /// <summary>
        /// 文件取消分享
        /// </summary>
        public bool IsShare( int FileId )
        {
            Model.YUN_FileInfo F = new Model.YUN_FileInfo() { FileId = FileId, IsShare = false };

            Model.YUN_FileInfo FileInfo = GetModel( FileId );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.YUN_FileInfo.Attach( F );
                Db.Entry( F ).Property( x => x.IsShare ).IsModified = true;

                string StrFileId = FileId.ToString();
                var File = from b in Db.ShareLinkInfo
                           where b.FileId == StrFileId
                           orderby b.FileId
                           select b;
                if( File.Count() > 0 )
                {
                    foreach( var item in File )
                    {
                        Db.ShareLinkInfo.Remove( item );
                    }
                }
                int rows = Db.SaveChanges();

                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        /// <summary>
        /// 文件还原（递归还原文件夹）
        /// </summary>
        public bool Reduction( int FileId )
        {

            Model.YUN_FileInfo FileInfo = GetModel( FileId );
            if( !string.IsNullOrEmpty( FileInfo.ParentFileId ) )
            {
                Model.YUN_FileInfo ParentFile = GetModel( int.Parse( FileInfo.ParentFileId ) );
                if( ParentFile != null )
                {
                    ReductionFlie( FileId );
                    if( FileInfo.ParentFileId != "" )
                    {
                        Reduction( int.Parse( FileInfo.ParentFileId ) );
                    }
                    return true;
                }
                else if( ParentFile == null )
                {
                    ReductionFlieToMu( FileId );
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                ReductionFlie( FileId );
                return true;
            }
        }
        /// <summary>
        /// 文件还原
        /// </summary>
        public void ReductionFlie( int FileId )
        {
            Model.YUN_FileInfo F = new Model.YUN_FileInfo() { FileId = FileId, FileState = true };

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.YUN_FileInfo.Attach( F );

                Db.Entry( F ).Property( x => x.FileState ).IsModified = true;
                int rows = Db.SaveChanges();

            }
        }
        /// <summary>
        /// 文件还原到主目录
        /// </summary>
        public bool ReductionFlieToMu( int FileId )
        {
            Model.YUN_FileInfo F = new Model.YUN_FileInfo() { FileId = FileId, FileState = true, ParentFileId = "" };

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.YUN_FileInfo.Attach( F );

                Db.Entry( F ).Property( x => x.FileState ).IsModified = true;
                Db.Entry( F ).Property( x => x.ParentFileId ).IsModified = true;

                int rows = Db.SaveChanges();
                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        /// <summary>
        /// 获取当前人使用空间
        /// </summary>
        public decimal GetlistByCode( string Code )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT(CASE WHEN SUM(FileSizeKb) Is NULL THEN 0 ELSE SUM(FileSizeKb)END)  as Size FROM YUN_FileInfo where [CreateId]='" + Code + "' and FileState=1" );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<decimal> result1 = Db.Database.SqlQuery<decimal>( strSql.ToString() );

                return result1.FirstOrDefault();
            }
        }
        /// <summary>
        /// 获取一个对象
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public Model.YUN_FileInfo GetModel( int FileId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.YUN_FileInfo
                           where b.FileId == FileId
                           orderby b.FileId
                           select b;
                return File.FirstOrDefault();
            }
        }
        /// <summary>
        /// 文件是否重名
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public bool FileIsExit( string FileName, int FileId, string WhereId, string userCode )
        {
            bool IsExit = false;
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var OneFile = from b in Db.YUN_FileInfo
                              where b.FileName == FileName && b.FileId != FileId && b.ParentFileId == WhereId && b.CreateId == userCode && b.FileState == true
                              select b;
                if( OneFile.Count() > 0 )
                {
                    IsExit = true;
                }
                return IsExit;
            }
        }
        /// <summary>
        /// 移动文件、复制文件 文件是否重名
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public bool FileIsExit( string FileIdList, string WhereId, string userCode )
        {
            string[] IdStr = FileIdList.Split( ',' );
            int[] Ids = Array.ConvertAll<string, int>( IdStr, s => int.Parse( s ) );
            bool IsExit = false;
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.YUN_FileInfo
                           where Ids.Contains( b.FileId )
                           select b;
                foreach( var item in File )
                {
                    var OneFile = from b in Db.YUN_FileInfo
                                  where b.FileName == item.FileName && b.ParentFileId == WhereId && b.CreateId == userCode && b.FileState == true
                                  select b;
                    if( OneFile.Count() > 0 )
                    {
                        IsExit = true;
                    }
                }
            }
            return IsExit;
        }
        /// <summary>
        /// 文件是否重名（重名返回重命名后的名字）
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public string FileExit( string ParentFileId, string CreateId, string FileName, string Share, string GroupOrAgencyId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                System.Linq.IOrderedQueryable<Model.YUN_FileInfo> Filelist = null;
                switch( Share )
                {
                    case "1001":
                        Filelist = from b in Db.YUN_FileInfo
                                   where b.FileName == FileName && b.ParentFileId == ParentFileId && ( b.CreateId == "Admin" || b.CreateId == "User" ) && b.FileState == true && b.ShareTypeId == "1001"
                                   orderby b.FileId
                                   select b;
                        break;
                    case "1002":
                        Filelist = from b in Db.YUN_FileInfo
                                   where b.FileName == FileName && b.ParentFileId == ParentFileId && ( b.CreateId == "User" || b.CreateId == "Admin" ) && b.FileState == true && b.ShareTypeId == "1002" && b.CreateUnitCode == GroupOrAgencyId
                                   orderby b.FileId
                                   select b;
                        break;
                    case "1003":
                        Filelist = from b in Db.YUN_FileInfo
                                   where b.FileName == FileName && b.ParentFileId == ParentFileId && ( b.CreateId == "User" || b.CreateId == "Admin" ) && b.FileState == true && b.ShareTypeId == "1003" && b.ShareGroupId == GroupOrAgencyId
                                   orderby b.FileId
                                   select b;
                        break;
                    default:
                        Filelist = from b in Db.YUN_FileInfo
                                    where b.FileName == FileName && b.ParentFileId == ParentFileId && b.CreateId == CreateId && b.FileState == true
                                    orderby b.FileId
                                    select b;
                        break;
                }
                if( Filelist.Count() > 0 )
                {
                    return FileReNameForExit( ParentFileId, CreateId, FileName, 0, Share, GroupOrAgencyId );
                }
                else
                {
                    return "";
                }
            }
        }
        /// <summary>
        /// 文件重名重命名
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public string FileReNameForExit( string ParentFileId, string CreateId, string FileName, int I, string Share, string GroupOrAgencyId )
        {
            string Name = FileName;

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                switch( Share )
                {
                    case "1001":
                        var File = from b in Db.YUN_FileInfo
                                   where b.FileName == Name && b.ParentFileId == ParentFileId && ( b.CreateId == "Admin" || b.CreateId == "User" ) && b.FileState == true && b.ShareTypeId == "1001"
                                   orderby b.FileId
                                   select b;
                        if( File.Count() > 0 )
                        {
                            I = I + 1;
                            if( bool.Parse( File.ToList()[0].IsFolder.ToString() ) )
                            {
                                FileName = FileName.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")";
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                            else
                            {
                                string FileExt = Path.GetExtension( FileName );
                                string FileNameWithoutExt = Path.GetFileNameWithoutExtension( FileName );
                                FileName = FileNameWithoutExt.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")" + FileExt;
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                        }
                        else
                        {
                            return FileName;
                        }

                    case "1002":
                        var File2 = from b in Db.YUN_FileInfo
                                    where b.FileName == Name && b.ParentFileId == ParentFileId && ( b.CreateId == "User" || b.CreateId == "Admin" ) && b.FileState == true && b.ShareTypeId == "1002" && b.CreateUnitCode == GroupOrAgencyId
                                    orderby b.FileId
                                    select b;
                        if( File2.Count() > 0 )
                        {
                            I = I + 1;
                            if( bool.Parse( File2.ToList()[0].IsFolder.ToString() ) )
                            {
                                FileName = FileName.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")";
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                            else
                            {
                                string FileExt = Path.GetExtension( FileName );
                                string FileNameWithoutExt = Path.GetFileNameWithoutExtension( FileName );
                                FileName = FileNameWithoutExt.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")" + FileExt;
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                        }
                        else
                        {
                            return FileName;
                        }
                    case "1003":
                        var File3 = from b in Db.YUN_FileInfo
                                    where b.FileName == Name && b.ParentFileId == ParentFileId && ( b.CreateId == "User" || b.CreateId == "Admin" ) && b.FileState == true && b.ShareTypeId == "1003" && b.ShareGroupId == GroupOrAgencyId
                                    orderby b.FileId
                                    select b;
                        if( File3.Count() > 0 )
                        {
                            I = I + 1;
                            if( bool.Parse( File3.ToList()[0].IsFolder.ToString() ) )
                            {
                                FileName = FileName.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")";
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                            else
                            {
                                string FileExt = Path.GetExtension( FileName );
                                string FileNameWithoutExt = Path.GetFileNameWithoutExtension( FileName );
                                FileName = FileNameWithoutExt.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")" + FileExt;
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                        }
                        else
                        {
                            return FileName;
                        }
                    default:
                        var File4 = from b in Db.YUN_FileInfo
                                    where b.FileName == Name && b.ParentFileId == ParentFileId && b.CreateId == CreateId && b.FileState == true
                                    orderby b.FileId
                                    select b;
                        if( File4.Count() > 0 )
                        {
                            I = I + 1;
                            if( bool.Parse( File4.ToList()[0].IsFolder.ToString() ) )
                            {
                                FileName = FileName.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")";
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                            else
                            {
                                string FileExt = Path.GetExtension( FileName );
                                string FileNameWithoutExt = Path.GetFileNameWithoutExtension( FileName );
                                FileName = FileNameWithoutExt.Replace( "(" + ( I - 1 ) + ")", "" ) + "(" + I + ")" + FileExt;
                                return FileReNameForExit( ParentFileId, CreateId, FileName, I, Share, GroupOrAgencyId );
                            }
                        }
                        else
                        {
                            return FileName;
                        }
                }

            }
        }
        /// <summary>
        /// 已分享移除
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public void RemoveModelByShareFileID( string FileId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.YUN_FileInfo
                           where b.ShareFileID == FileId
                           orderby b.ParentFileId
                           select b;
                foreach( var item in File )
                {
                    if( item.IsFolder == true )
                    {
                        ShareTrueDel( item.FileId );
                    }
                    else
                    {
                        Db.YUN_FileInfo.Remove( item );
                        Db.SaveChanges();
                    }
                }
            }
        }
        /// <summary>
        /// 递归删除文件夹下所有文件(数据库中的的文件)
        /// </summary>
        /// <param name="dir"></param>
        public void DeleteFileDg( string Fileid )
        {

            List<Model.YUN_FileInfo> YunFileList = GetFileByDown( "ParentFileId", Fileid.ToString() );
            var id = "";
            for( var d = 0; d < YunFileList.Count; d++ )
            {
                id = YunFileList[d].FileId.ToString();
                Delete( Convert.ToInt32( YunFileList[d].FileId ) );//删库中数据
                DeleteFileDg( id );
            }
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="field"></param>
        /// <param name="Ids"></param>
        /// <returns></returns>
        public Model.YUN_FileInfo GetImgNextOrUp( string where )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append( "SELECT top 1 * " );
            strSql.Append( " FROM YUN_FileInfo where " );
            strSql.Append( where );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<Model.YUN_FileInfo> result1 = Db.Database.SqlQuery<Model.YUN_FileInfo>( strSql.ToString() );
                if( result1 != null )
                {
                    return result1.FirstOrDefault();
                }
                else
                {
                    return null;
                }
            }
        }
        //清空回收站
        public bool ClearDel( string Code )
        {
            Thread t = new Thread( new ThreadStart( () =>
            {
                //数据库访问模式
                using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
                {
                    var filelist = from b in Db.YUN_FileInfo.ToList()
                                   where b.CreateId == Code && b.FileState == false
                                   select b;
                    var Filelist = filelist.ToList();

                    foreach( var item in Filelist )
                    {
                        string WebUrl = str4 + "";
                        if( !string.IsNullOrEmpty( item.FileUrl ) )
                        {
                            WebUrl += item.FileUrl.Substring( 1, item.FileUrl.Length - 1 ).Replace( "/", "\\" );
                        }
                        string FileName = System.IO.Path.GetFileNameWithoutExtension( WebUrl );

                        switch( item.FileExtName )
                        {
                            case ".docx":
                            case ".doc":
                            case ".dot":
                            case ".docm":
                            case ".xls":
                            case ".xlsx":
                            case ".ppt":
                            case ".pptx":
                            case ".pptm":
                                string PDfFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".pdf";
                                if( FileHelper.ExitFile( PDfFileUrl ) )
                                {
                                    DeleteFile( PDfFileUrl );
                                }
                                break;

                            case ".mp4":
                            case ".mkv":
                            case ".rmvb":
                            case ".avi":
                            case ".swf":
                            case ".wmv":
                            case ".3gp":
                            case ".mpeg":
                            case ".mpg":
                            case ".rm":
                            case ".asf":
                            case ".mov":
                            case ".smi":
                                string FlvFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".flv";
                                string jpgFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".jpg";

                                if( FileHelper.ExitFile( FlvFileUrl ) )
                                {
                                    DeleteFile( FlvFileUrl );
                                }
                                if( FileHelper.ExitFile( jpgFileUrl ) )
                                {
                                    DeleteFile( jpgFileUrl );
                                }
                                break;
                            default:
                                break;
                        }
                        if( item.IsFolder == true )
                        {
                            string FileMapPath = "";
                            GetFileMapPathByDel( item.FileId.ToString(), Code, "", ref FileMapPath );
                            string path = "/Upload/Yun/" + FileMapPath;
                            DeleteFolderFile( str4 + path.Substring( 1, path.Length - 1 ).Replace( "/", "\\" ) );
                        }
                        else
                        {
                            DeleteFile( WebUrl );
                        }
                        Db.YUN_FileInfo.Remove( item );
                    }
                    Db.SaveChanges();
                }
            } ) );
            t.Start();
            return true;

        }
        //定时清理数据
        public bool ClearFile()
        {
            KillEmptyDirectory( str4 + "\\Upload\\Yun" );
            string str7 = AppDomain.CurrentDomain.SetupInformation.ApplicationBase;
            //数据库访问模式
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var filelist = from b in Db.YUN_FileInfo.ToList()
                               where b.FileDeleteTime < DateTime.Now.AddDays( -1 ) && b.FileState == false
                               select b;
                var Filelist = filelist.ToList();

                foreach( var item in Filelist )
                {
                    string WebUrl = str4 + "";
                    if( !string.IsNullOrEmpty( item.FileUrl ) )
                    {
                        WebUrl += item.FileUrl.Substring( 1, item.FileUrl.Length - 1 ).Replace( "/", "\\" );
                    }
                    string FileName = System.IO.Path.GetFileNameWithoutExtension( WebUrl );

                    switch( item.FileExtName )
                    {
                        case ".docx":
                        case ".doc":
                        case ".dot":
                        case ".docm":
                        case ".xls":
                        case ".xlsx":
                        case ".ppt":
                        case ".pptx":
                        case ".pptm":
                            string PDfFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".pdf";
                            if( FileHelper.ExitFile( PDfFileUrl ) )
                            {
                                DeleteFile( PDfFileUrl );
                            }
                            break;

                        case ".mp4":
                        case ".mkv":
                        case ".rmvb":
                        case ".avi":
                        case ".swf":
                        case ".wmv":
                        case ".3gp":
                        case ".mpeg":
                        case ".mpg":
                        case ".rm":
                        case ".asf":
                        case ".mov":
                        case ".smi":
                            string FlvFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".flv";
                            string jpgFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".jpg";

                            if( FileHelper.ExitFile( FlvFileUrl ) )
                            {
                                DeleteFile( FlvFileUrl );
                            }
                            if( FileHelper.ExitFile( jpgFileUrl ) )
                            {
                                DeleteFile( jpgFileUrl );
                            }
                            break;
                        default:
                            break;
                    }
                    if( item.IsFolder == true )
                    {
                        string FileMapPath = "";
                        GetFileMapPathByDel( item.FileId.ToString(), item.CreateId, "", ref FileMapPath );
                        string path = "/Upload/Yun/" + FileMapPath;
                        DeleteFolderFile( str4 + path.Substring( 1, path.Length - 1 ).Replace( "/", "\\" ) );
                    }
                    else
                    {
                        DeleteFile( WebUrl );
                    }
                    DeleteFile( WebUrl );
                    Db.YUN_FileInfo.Remove( item );
                }
                int rows = Db.SaveChanges();
                if( rows == Filelist.Count() )
                {
                    return true;
                }
                else
                {
                    return false;
                }

            }

        }
        //删除数据
        public bool TrueDel( int fileId )
        {
            //数据库访问模式
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.YUN_FileInfo
                           where b.FileId == fileId
                           orderby b.FileId
                           select b;
                Model.YUN_FileInfo FileModel = File.FirstOrDefault();

                string WebUrl = str4 + "";
                if( !string.IsNullOrEmpty( FileModel.FileUrl ) )
                {
                    WebUrl += FileModel.FileUrl.Substring( 1, FileModel.FileUrl.Length - 1 ).Replace( "/", "\\" );
                }
                string FileName = System.IO.Path.GetFileNameWithoutExtension( WebUrl );
                switch( FileModel.FileExtName )
                {
                    case ".docx":
                    case ".doc":
                    case ".xls":
                    case ".xlsx":
                    case ".ppt":
                    case ".pptx":
                        string PDfFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".pdf";
                        if( FileHelper.ExitFile( PDfFileUrl ) )
                        {
                            DeleteFile( PDfFileUrl );
                        }
                        break;

                    case ".mp4":
                    case ".mkv":
                    case ".rmvb":
                    case ".avi":
                    case ".swf":
                    case ".wmv":
                    case ".3gp":
                    case ".mpeg":
                    case ".mpg":
                    case ".rm":
                    case ".asf":
                    case ".mov":
                    case ".smi":
                        string FlvFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".flv";
                        string jpgFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".jpg";

                        if( FileHelper.ExitFile( FlvFileUrl ) )
                        {
                            DeleteFile( FlvFileUrl );
                        }
                        if( FileHelper.ExitFile( jpgFileUrl ) )
                        {
                            DeleteFile( jpgFileUrl );
                        }
                        break;
                    default:
                        break;
                }
                if( FileModel.IsFolder == true )
                {
                    string path = "";
                    GetFileMapPathByDel( FileModel.FileId.ToString(), FileModel.CreateId, FileModel.ShareTypeId, ref path );
                    path = "/Upload/Yun/" + path;
                    DeleteFolderFile( str4 + path.Substring( 1, path.Length - 1 ).Replace( "/", "\\" ) );

                    List<Model.YUN_FileInfo> YunFileList = GetFileByDown( "ParentFileId", FileModel.FileId.ToString() );
                    for( var z = 0; z < YunFileList.Count; z++ )
                    {
                        TrueDel( YunFileList[z].FileId );
                    }
                }
                else
                {
                    DeleteFile( WebUrl );
                }
                Db.YUN_FileInfo.Remove( FileModel );
                int rows = Db.SaveChanges();
                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        //分享删除数据
        public bool ShareTrueDel( int fileId )
        {
            //数据库访问模式
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.YUN_FileInfo
                           where b.FileId == fileId
                           orderby b.FileId
                           select b;
                Model.YUN_FileInfo FileModel = File.FirstOrDefault();

                string WebUrl = str4 + "";
                if( !string.IsNullOrEmpty( FileModel.FileUrl ) )
                {
                    WebUrl += FileModel.FileUrl.Substring( 1, FileModel.FileUrl.Length - 1 ).Replace( "/", "\\" );
                }
                string FileName = System.IO.Path.GetFileNameWithoutExtension( WebUrl );
                switch( FileModel.FileExtName )
                {
                    case ".docx":
                    case ".doc":
                    case ".xls":
                    case ".xlsx":
                    case ".ppt":
                    case ".pptx":
                        string PDfFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".pdf";
                        if( FileHelper.ExitFile( PDfFileUrl ) && ( FileModel.FileUrl.IndexOf( "School" ) > -1 || FileModel.FileUrl.IndexOf( "Department" ) > -1 || FileModel.FileUrl.IndexOf( "Group" ) > -1 ) )
                        {
                            DeleteFile( PDfFileUrl );
                        }
                        break;

                    case ".mp4":
                    case ".mkv":
                    case ".rmvb":
                    case ".avi":
                    case ".swf":
                    case ".wmv":
                    case ".3gp":
                    case ".mpeg":
                    case ".mpg":
                    case ".rm":
                    case ".asf":
                    case ".mov":
                    case ".smi":
                        string FlvFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".flv";
                        string jpgFileUrl = System.IO.Path.GetDirectoryName( WebUrl ) + "\\" + FileName + ".jpg";

                        if( FileHelper.ExitFile( FlvFileUrl ) && ( FileModel.FileUrl.IndexOf( "School" ) > -1 || FileModel.FileUrl.IndexOf( "Department" ) > -1 || FileModel.FileUrl.IndexOf( "Group" ) > -1 ) )
                        {
                            DeleteFile( FlvFileUrl );
                        }
                        if( FileHelper.ExitFile( jpgFileUrl ) && ( FileModel.FileUrl.IndexOf( "School" ) > -1 || FileModel.FileUrl.IndexOf( "Department" ) > -1 || FileModel.FileUrl.IndexOf( "Group" ) > -1 ) )
                        {
                            DeleteFile( jpgFileUrl );
                        }
                        break;
                    default:
                        break;
                }
                if( FileModel.IsFolder == true )
                {
                    string path = "";
                    GetFileMapPathByDel( FileModel.FileId.ToString(), FileModel.CreateId, FileModel.ShareTypeId, ref path );
                    path = "/Upload/Yun/" + path;
                    DeleteFolderFile( str4 + path.Substring( 1, path.Length - 1 ).Replace( "/", "\\" ) );

                    List<Model.YUN_FileInfo> YunFileList = GetFileByDown( "ParentFileId", FileModel.FileId.ToString() );
                    for( var z = 0; z < YunFileList.Count; z++ )
                    {
                        ShareTrueDel( YunFileList[z].FileId );
                    }
                }
                else
                {
                    if( FileModel.FileUrl.IndexOf( "School" ) > -1 || FileModel.FileUrl.IndexOf( "Department" ) > -1 || FileModel.FileUrl.IndexOf( "Group" ) > -1 )
                    {
                        DeleteFile( WebUrl );
                    }
                }

                Db.YUN_FileInfo.Remove( FileModel );
                int rows = Db.SaveChanges();
                if( rows > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        //删除数据
        public decimal GetDiskSize( string userCode )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                decimal UserSize = 0;
                var UserRole = from b in Db.UserRoleInfo
                               where b.UserId == userCode
                               select b;
                Model.UserRoleInfo User = UserRole.FirstOrDefault();

                if( User != null )
                {
                    UserSize = decimal.Parse( User.DiskSize.ToString() ) * 1024;
                }
                else
                {
                    UserSize = 500 * 1024;

                }
                return UserSize;
            }

        }
        public static void KillEmptyDirectory( String storagepath )
        {
            DirectoryInfo dir = new DirectoryInfo( storagepath );
            DirectoryInfo[] subdirs = dir.GetDirectories( "*.*", SearchOption.AllDirectories );
            foreach( DirectoryInfo subdir in subdirs )
            {
                FileSystemInfo[] subFiles = subdir.GetFileSystemInfos();
                if( subFiles.Count() == 0 )
                {
                    subdir.Delete();
                }
            }
        }
    }
}
