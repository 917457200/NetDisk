﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.ShareList
{
    public class ShareList
    {
        BLL.YunFile.MyFile YunFile = new YunFile.MyFile();
        BLL.Cookie GetCookie = new BLL.Cookie();

        public bool Add( string FileIdS, int ShareValidity, string Method, string ShareLink, string ShareLinkKey )
        {
            if( FileIdS.Contains( "add" ) )
            {
                FileIdS = FileIdS.Replace( "add", "" );
            }
            string[] FileIdList = FileIdS.Split( ',' );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                for( int i = 0; i < FileIdList.Length; i++ )
                {
                    YunFile.Share( int.Parse( FileIdList[i] ), "1004", GetCookie.GetUserCookie().unitCode );
                    Model.ShareLinkInfo model = new Model.ShareLinkInfo();
                    model.FileId = FileIdList[i];
                    model.ShareValidity = ShareValidity;
                    model.ShareType = Method;
                    model.ShareLink = ShareLink;
                    model.ShareLinkKey = ShareLinkKey;
                    model.ShareTime = DateTime.Now;
                    Db.ShareLinkInfo.Add( model );
                }
                int C = Db.SaveChanges();
            }
            return true;
        }

        public bool Exit( string ShareLink )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.ShareLinkInfo
                           where b.ShareLink == ShareLink
                           select b;
                if( File.Count() > 0 )
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        public string GetShareLinkInfo( string ShareLink )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.ShareLinkInfo
                           where b.ShareLink == ShareLink
                           select b.FileId;
                if( File.Count() > 0 )
                {
                    string Ids = "";
                    foreach( var item in File.ToList() )
                    {
                          Ids += item.ToString() + ",";
                    }
                    return Ids.Substring( 0, Ids.Length - 1 );
                }
                else
                {
                    return null;
                }
            }
        }

        public Model.ShareLinkInfo GetOneShareLinkInfo( string ShareLink, out int Count )
        {
           
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var File = from b in Db.ShareLinkInfo
                           where b.ShareLink == ShareLink
                           select b;
                Count = File.Count();
                if( File.Count() > 0 )
                {
                    return File.FirstOrDefault();
                }
                else
                {
                    return null;
                }
            }
        }
        Random r = new Random();
        public void LinKCreate( int CodeCount, out string RandomCode )
        {
            string allChar = "0,1,2,3,4,5,6,7,8,9,A,a,B,b,C,c,D,d,E,e,F,f,G,g,H,h,I,i,J,j,K,k,L,l,M,m,N,n,O,o,P,p,Q,q,R,r,S,s,T,t,U,u,V,v,W,w,X,x,Y,y,Z,z";
            string[] allCharArray = allChar.Split( ',' );

            RandomCode = "";
            int temp = -1;

            for( int i = 0; i < CodeCount; i++ )
            {
                int t = r.Next( 0, 59 );

                while( temp == t )
                {
                    t = r.Next( 0, 59 );
                }

                temp = t;
                RandomCode += allCharArray[t];
            }
        }
    }
}
