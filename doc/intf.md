## 1 RESTful API List
|URL|METHOD|功能|参数|返回值|
|:----|:----:|:----|:----|:----|
|||||
|/corporation|POST|创建社团|||
|/corporation/[id]|GET|获取社团信息||
|/corporation/[id]|PUT|修改社团信息||
|/corporation/[id]|DELETE|删除社团||
|/corporation/join|POST|加入社团||
|/corporation/leave|POST|离开社团||
|||||
|/activity|POST|创建社团活动|||
|/activity/[id]|GET|获取活动信息||
|/activity/[id]|PUT|修改活动信息||
|/activity/[id]|DELETE|删除活动||
|/activity/join|POST|参加活动|{people: 1}|
|||||
|/score_card|POST|创建计分卡|||
|/score_card/[id]|GET|获取计分卡信息||
|/score_card/[id]|PUT|修改计分卡信息||
|/score_card/[id]|DELETE|删除计分卡||
|||||
|/score_item|POST|创建计分项|{card_id: 1}||
|/score_item/[id]|GET|获取计分项信息||
|/score_item/[id]|PUT|修改计分项信息||
|/score_item/[id]|DELETE|删除计分项||
|/score_item/[id]/confirm|POST|左边确认1|{ type: l_1/l_2/r_1/r_2,<br>user_id: 1}||

## 2 返回报文格式
```
{
  ret: , // 0-成功；非0-失败
  data: , //数据
  msg:  , //失败原因
}
```
### 2.1 返回值定义
|ret|说明|
|:----|:----:|
|0|成功|
|8001|没有数据|
|8002|没有登陆|
|8003|无权限|
|8004|参数错误|
|8005|数据库操作错误|

### 2.2 返回报文示例
#### 2.2.1 POST/PUT/DELETE成功回复报文
```
{
  ret: 0
}
```
#### 2.2.2 GET成功回复报文
```
//单实例
{
  ret: 0,
  data: {
  }
}

//多实例
{
  ret: 0,
  data: [
    {
    },
    {
    }
  ]
}
```
### 2.2.3 失败回复报文
```
{
  ret: [非0值],
  msg: ""
}
```
