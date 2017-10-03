# 相关命令

***
## 1. 建立数据库及用户
>create user 'ymqc'@'%' identified by '123456';

>create database ymqdb default character set utf8 collate utf8_general_ci;

>grant all on ymqdb.* to ymqc;

## 2.安装node最新版本
> sudo n stable
