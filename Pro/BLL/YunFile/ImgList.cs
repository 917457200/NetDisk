﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.YunFile
{
    public class ImgList
    {
        BLL.YunFile.MyFile MyFile = new BLL.YunFile.MyFile();
        public List<DateList> ImgDateList( string UserCode )
        {
            DataSetToList List = new DataSetToList();

            using( var db = new Model.NETDISKDBEntities() )
            {
                string strSql = "exec [SpFileCreateAxis] @CreateId='" + UserCode + "'";

                DataSet Dt = MyFile.SqlQueryForDataTatable1( db.Database, strSql );

                List<DateList> ImgDateInfolist = List.ToList<DateList>( Dt, 0 );

                return ImgDateInfolist.OrderByDescending( a => a.YearS ).ToList();
            }
        }
        public List<Model.YUN_FileInfo> ImgTitleInfoList( string UserCode, string time )
        {
            DataSetToList List = new DataSetToList();

            using( var db = new Model.NETDISKDBEntities() )
            {
                string strSql = "SELECT DISTINCT (CONVERT(varchar(10),(SELECT DATEPART(yyyy, FileCreateTime)))+'年'+ CONVERT(varchar(10),(SELECT DATEPART(mm, FileCreateTime)))+'月'+ CONVERT(varchar(10),(SELECT DATEPART(dd, FileCreateTime)))+'日') AS CreateUnitCode FROM dbo.YUN_FileInfo as a WHERE CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp','.jpeg','.jpg','.gif','.png','.tif','.psd','.dwg','.wmf') and FileState=1 AND datediff(month,FileCreateTime,'" + time + "')=0 ORDER BY CreateUnitCode DESC";
                DataSet ds = MyFile.SqlQueryForDataTatable1( db.Database, strSql );
               
                string[] column = new string[ds.Tables[0].Columns.Count];
                for( int i = 0; i < ds.Tables[0].Columns.Count; i++ )
                    column[i] = ds.Tables[0].Columns[i].ColumnName;
                DataTable dtNew = ds.Tables[0].DefaultView.ToTable( true, column );
                ds.Tables.Clear();
                ds.Tables.Add( dtNew );

                List<Model.YUN_FileInfo> Filelist = List.ToList<Model.YUN_FileInfo>( ds, 0 );
                return Filelist;
            }
        }
        public List<Model.YUN_FileInfo> ImgInfoList( int pageIndex, int pageSize, string UserCode, string time )
        {
            DataSetToList List = new DataSetToList();

            int startRow = ( pageIndex - 1 ) * pageSize;
            StringBuilder strSql = new StringBuilder();

            strSql.Append( " SELECT TOP " + pageSize + " FileId,FileName,FileCreateTime,FileUrl,FileState,(CONVERT(varchar(10),(SELECT DATEPART(yyyy, FileCreateTime)))+'年'+ CONVERT(varchar(10),(SELECT DATEPART(mm, FileCreateTime)))+'月'+ CONVERT(varchar(10),(SELECT DATEPART(dd, FileCreateTime)))+'日') AS CreateUnitCode From (SELECT ROW_NUMBER() OVER (ORDER BY  FileId  desc) AS RowNumber,* FROM YUN_FileInfo as a where CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp','.jpeg','.jpg','.gif','.png','.tif','.psd','.dwg','.wmf') and FileState=1 AND DATEDIFF(dd, FileCreateTime, '" + time + "') = 0 ) as A " );
            strSql.Append( "WHERE  RowNumber > " + startRow + " ORDER BY CreateUnitCode desc " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DataSet Dt =MyFile.SqlQueryForDataTatable1( Db.Database, strSql.ToString() );
                List<Model.YUN_FileInfo> result1 = List.ToList<Model.YUN_FileInfo>( Dt, 0 );

                return result1.ToList();
            }
        }

        public int ImgInfoListCount(string UserCode, string time )
        {
            StringBuilder strSql = new StringBuilder();

            strSql.Append( " SELECT count(FileId) From YUN_FileInfo where CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp','.jpeg','.jpg','.gif','.png','.tif','.psd','.dwg','.wmf') and FileState=1 AND DATEDIFF(dd, FileCreateTime, '" + time + "') = 0 " );

            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbRawSqlQuery<int> result2 = Db.Database.SqlQuery<int>( strSql.ToString());
                return result2.FirstOrDefault();
              
            }
        }
        public class DateList
        {
            public string YearS { get; set; }
            public string Moth { get; set; }

        }
    }
}
