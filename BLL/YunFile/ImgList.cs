using System;
using System.Collections.Generic;
using System.Data;
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
        public List<Model.YUN_FileInfo> ImgTitleInfoList( string UserCode,string time )
        {
            DataSetToList List = new DataSetToList();

            using( var db = new Model.NETDISKDBEntities() )
            {
                string strSql = "SELECT	DISTINCT(CONVERT(varchar(10),(SELECT DATEPART(yyyy, FileCreateTime)))+'年'+ CONVERT(varchar(10),(SELECT DATEPART(mm, FileCreateTime)))+'月'+ CONVERT(varchar(10),(SELECT DATEPART(dd, FileCreateTime)))+'日') AS CreateUnitCode,CONVERT(varchar(10),(select COUNT(*) from YUN_FileInfo  where CONVERT(varchar(10),a.FileCreateTime, 23)=CONVERT(varchar(10), FileCreateTime, 23) and CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp', '.jpeg', '.jpg', '.gif', '.png', '.tif', '.psd', '.dwg') and FileState=1 ))as ShareFileID FROM dbo.YUN_FileInfo as a WHERE CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp', '.jpeg', '.jpg', '.gif', '.png', '.tif', '.psd', '.dwg') and FileState=1 AND datediff(month,FileCreateTime,'" + time + "')=0 ORDER BY CreateUnitCode DESC";
                DataSet Dt = MyFile.SqlQueryForDataTatable1( db.Database, strSql );
                List<Model.YUN_FileInfo> Filelist = List.ToList<Model.YUN_FileInfo>( Dt, 0 );
                return Filelist;
            }
        }
        public List<Model.YUN_FileInfo> ImgInfoList( string UserCode, string time )
        {
            DataSetToList List = new DataSetToList();

            using( var db = new Model.NETDISKDBEntities() )
            {
                string strSql = "SELECT	FileId,FileName,FileCreateTime,FileUrl,FileState,(CONVERT(varchar(10),(SELECT DATEPART(yyyy, FileCreateTime)))+'年'+ CONVERT(varchar(10),(SELECT DATEPART(mm, FileCreateTime)))+'月'+ CONVERT(varchar(10),(SELECT DATEPART(dd, FileCreateTime)))+'日') AS CreateUnitCode FROM dbo.YUN_FileInfo as a WHERE CreateId = '" + UserCode + "' AND FileExtName IN ('.bmp', '.jpeg', '.jpg', '.gif', '.png', '.tif', '.psd', '.dwg') and FileState=1 AND datediff(month,FileCreateTime,'" + time + "')=0 ORDER BY CreateUnitCode DESC";
                DataSet Dt = MyFile.SqlQueryForDataTatable1( db.Database, strSql );
                List<Model.YUN_FileInfo> Filelist = List.ToList<Model.YUN_FileInfo>( Dt, 0 );
                return Filelist;
            }

        }
        public class DateList
        {
            public string YearS { get; set; }
            public string Moth { get; set; }

        }
    }
}
