
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 07/27/2017 15:51:31
-- Generated from EDMX file: E:\项目\教育网盘\EastElite\Model\Model1.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [NETDISKDB2];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------


-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[MenuInfo]', 'U') IS NOT NULL
    DROP TABLE [dbo].[MenuInfo];
GO
IF OBJECT_ID(N'[dbo].[YUN_FileInfo]', 'U') IS NOT NULL
    DROP TABLE [dbo].[YUN_FileInfo];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'MenuInfo'
CREATE TABLE [dbo].[MenuInfo] (
    [MenuCode] nvarchar(10)  NOT NULL,
    [MenuName] nvarchar(50)  NULL,
    [MenuUrl] nvarchar(50)  NULL
);
GO

-- Creating table 'YUN_FileInfo'
CREATE TABLE [dbo].[YUN_FileInfo] (
    [FileId] int IDENTITY(1,1) NOT NULL,
    [FileName] nvarchar(100)  NULL,
    [FileSizeKb] decimal(18,2)  NULL,
    [FileCreateTime] datetime  NULL,
    [FileExtName] nvarchar(50)  NULL,
    [IsFolder] bit  NULL,
    [IsShare] bit  NULL,
    [ShareTypeId] nvarchar(50)  NULL,
    [FileUrl] nvarchar(200)  NULL,
    [CreateId] nvarchar(50)  NULL,
    [ParentFileId] nvarchar(200)  NULL,
    [FileState] bit  NULL,
    [FileDeleteTime] datetime  NULL,
    [CreateName] nvarchar(20)  NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [MenuCode] in table 'MenuInfo'
ALTER TABLE [dbo].[MenuInfo]
ADD CONSTRAINT [PK_MenuInfo]
    PRIMARY KEY CLUSTERED ([MenuCode] ASC);
GO

-- Creating primary key on [FileId] in table 'YUN_FileInfo'
ALTER TABLE [dbo].[YUN_FileInfo]
ADD CONSTRAINT [PK_YUN_FileInfo]
    PRIMARY KEY CLUSTERED ([FileId] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------