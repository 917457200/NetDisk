using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.UserGroup
{
    public class UserGroup
    {
        /// <summary>
        /// 获取一个对象
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public Model.GroupInfo GetGroupInfoModel( int Id )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var GroupInfo = from b in Db.GroupInfo
                                where b.GroupId == Id
                                select b;
                return GroupInfo.FirstOrDefault();
            }

        }
        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public int AddGroupInfo( Model.GroupInfo model )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Db.GroupInfo.Add( model );
                int row = Db.SaveChanges();
                if( row > 0 )
                {
                    return model.GroupId;
                }
                else
                {
                    return 0;
                }
            }
        }
        /// <summary>
        /// 添加多条数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public bool AddGroupUseInfo( string[] UserCodes, int GroupId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                for( int i = 0; i < UserCodes.Length; i++ )
                {
                    Model.UserGroupInfo User = new Model.UserGroupInfo();
                    User.UserId = UserCodes[i].Split( '|' )[0].ToString();
                    User.UserName = UserCodes[i].Split( '|' )[1].ToString().Trim();
                    User.GroupId = GroupId;
                    User.Examine = true;
                    User.ExamineTime = DateTime.Now;
                    Db.UserGroupInfo.Add( User );
                }

                int row = Db.SaveChanges();
                if( row > 0 )
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
        /// 修改一条数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public bool EditGroupInfo( Model.GroupInfo model )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DbEntityEntry<Model.GroupInfo> entry = Db.Entry<Model.GroupInfo>( model );
                entry.State = System.Data.Entity.EntityState.Modified;
                int row = Db.SaveChanges();
                if( row > 0 )
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
        /// 修改多条GroupUse数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public bool EditGroupUserInfo( string[] UserCodes, int GroupId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                DelGroupUserInfo( GroupId );

                for( int i = 0; i < UserCodes.Length; i++ )
                {
                    Model.UserGroupInfo User = new Model.UserGroupInfo();
                    User.UserId = UserCodes[i].Split( '|' )[0].ToString();
                    User.UserName = UserCodes[i].Split( '|' )[1].ToString().Trim();
                    User.Examine = false;
                    User.GroupId = GroupId;
                    User.Examine = true;
                    User.ExamineTime = DateTime.Now;
                    Db.UserGroupInfo.Add( User );
                }

                int row = Db.SaveChanges();
                if( row > 0 )
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
        /// 删除一条数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public bool DelGroupInfo( int Id )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var GroupInfo = from b in Db.GroupInfo
                                where b.GroupId == Id
                                select b;
                Model.GroupInfo G = GroupInfo.FirstOrDefault();
                DelGroupUserInfo( Id );
                Db.GroupInfo.Remove( G );

                int row = Db.SaveChanges();
                if( row > 0 )
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
        /// 删除一条数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public bool DelGroupUserInfo( int GroupId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var GroupUser = from B in Db.UserGroupInfo
                                where B.GroupId == GroupId
                                select B;
                foreach( var item in GroupUser )
                {
                    Db.UserGroupInfo.Remove( item );
                }

                int row = Db.SaveChanges();
                if( row > 0 )
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
        /// 获取数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public List<Model.UserGroupInfo> GetUserGroupInfoList( int GroupId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var UserGroupInfoList = from B in Db.UserGroupInfo
                                        where B.GroupId == GroupId
                                        select B;
                return UserGroupInfoList.ToList();
            }
        }
        /// <summary>
        /// 获取数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public List<Model.GroupInfo> GetGroupInfoList( int pageIndex, int pageSize, string GroupName, string UserName, string UserCode, ref int Count )
        {
            DataSetToList List = new DataSetToList();
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                int startRow = ( pageIndex - 1 ) * pageSize;
                BLL.YunFile.MyFile File = new YunFile.MyFile();
                string wherestr = "";
                if( !string.IsNullOrEmpty( GroupName ) )
                {
                    wherestr = " and GroupName like '%" + GroupName + "%'";
                }

                if( !string.IsNullOrEmpty( UserName ) )
                {
                    wherestr += " AND CreateUserName like '%" + UserName + "%'";
                }
                StringBuilder strSql1 = new StringBuilder();
                strSql1.Append( "SELECT Count(*) as Num FROM GroupInfo where 1=1 " + wherestr );
                DbRawSqlQuery<int> result = Db.Database.SqlQuery<int>( strSql1.ToString() );

                Count = result.FirstOrDefault();

                StringBuilder strSql = new StringBuilder();
                strSql.Append( "SELECT TOP " + pageSize + " *,(SELECT A.Examine  FROM dbo.UserGroupInfo AS A WHERE A.GroupId= B.GroupId AND A.UserId ='" + UserCode + "') AS Examine FROM (SELECT ROW_NUMBER() OVER (ORDER BY CreateTime desc) AS RowNumber,* FROM GroupInfo where 1=1 " + wherestr + ") as B " );
                strSql.Append( "where  RowNumber > " + startRow + wherestr + "  ORDER BY CreateTime ASC " );



                DataSet Dt = File.SqlQueryForDataTatable1( Db.Database, strSql.ToString() );
                List<Model.GroupInfo> result1 = List.ToList<Model.GroupInfo>( Dt, 0 );

                return result1.ToList();
            }
        }
        /// <summary>
        /// 获取数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public List<Model.GroupInfo> GetAllGroupList( string UserCode)
        {
            DataSetToList List = new DataSetToList();
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                StringBuilder strSql = new StringBuilder();

                strSql.Append( "SELECT * FROM GroupInfo where GroupId IN (SELECT distinct  GroupId FROM UserGroupInfo WHERE UserId ='" + UserCode + "' AND Examine =1) OR CreateUserId ='" + UserCode + "'" );

                DbRawSqlQuery<Model.GroupInfo> result1 = Db.Database.SqlQuery<Model.GroupInfo>( strSql.ToString() );

                return result1.ToList();
            }
        }
        //申请加入
        public bool UserGroupExamine( int GroupId, string UserId, string UserName )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Model.GroupInfo Group = GetGroupInfoModel( GroupId );

                Model.UserGroupInfo User = new Model.UserGroupInfo();
                User.UserId = UserId;
                User.UserName = UserName;
                User.Examine = false;
                User.GroupId = GroupId;
                Db.UserGroupInfo.Add( User );
                Model.MassgeInfo M = new Model.MassgeInfo();
                M.GroupId = GroupId;
                M.MassgeCreateTime = DateTime.Now;
                M.MassgeName = "申请加入" + Group.GroupName + "用户组";
                M.MassgeNote = UserName + " 申请加入 " + Group.GroupName + " 用户组,是否同意？";
                M.MassgeState = false;
                M.MassgeExamineState = false;
                M.MassgeToUserId = Group.CreateUserId;
                M.MassgeSendUserId = UserId;
                M.MassgeType = "1000";
                Db.MassgeInfo.Add( M );
                int row = Db.SaveChanges();
                if( row > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

        }

        //同意加入
        public bool GroupExamineIn( int GroupId, string UserId, int Id )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {

                var UserGroupInfo = from B in Db.UserGroupInfo
                                    where B.GroupId == GroupId && B.UserId == UserId
                                    select B;

                Model.UserGroupInfo User = UserGroupInfo.FirstOrDefault();
                User.Examine = true;
                User.ExamineTime = DateTime.Now;
                DbEntityEntry<Model.UserGroupInfo> entry = Db.Entry<Model.UserGroupInfo>( User );
                entry.State = System.Data.Entity.EntityState.Modified;

                Model.MassgeInfo F = new Model.MassgeInfo() { Id = Id, MassgeState = true , MassgeExamineState = true  };
                Db.MassgeInfo.Attach( F );
                Db.Entry( F ).Property( x => x.MassgeState ).IsModified = true;
                Db.Entry( F ).Property( x => x.MassgeExamineState ).IsModified = true;

                int row = Db.SaveChanges();
                if( row > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }

        }
        //不同意加入
        public bool GroupExamineNotIn( int GroupId, string UserId ,int Id)
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var UserGroupInfo = from B in Db.UserGroupInfo
                                    where B.GroupId == GroupId && B.UserId == UserId
                                    select B;

                Model.UserGroupInfo User = UserGroupInfo.FirstOrDefault();
                Db.UserGroupInfo.Remove( User );

                Model.MassgeInfo F = new Model.MassgeInfo() { Id = Id, MassgeState = true, MassgeExamineState = false };
                Db.MassgeInfo.Attach( F );
                Db.Entry( F ).Property( x => x.MassgeState).IsModified = true;
                Db.Entry( F ).Property( x => x.MassgeExamineState ).IsModified = true;

                int row = Db.SaveChanges();
                if( row > 0 )
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
}
