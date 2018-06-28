
# 斗兽棋(Jungle)前端逻辑设计
## 1、棋子
    [1, 2, 3, 4, 5, 6, 7, 8, -1, -2, -3, -4, -5, -6, -7, -8]
    
    对应关系
    {
    1:{"name":象, "pic": "xxx", "audio":xxx},
    2:{"name":狮, "pic": "xxx", "audio":xxx},
    3:{"name":虎, "pic": "xxx", "audio":xxx},
    4:{"name":豹, "pic": "xxx", "audio":xxx},
    5:{"name":狼, "pic": "xxx", "audio":xxx},
    6:{"name":狗, "pic": "xxx", "audio":xxx},
    7:{"name":猫, "pic": "xxx", "audio":xxx},
    8:{"name":鼠, "pic": "xxx", "audio":xxx},
    -1:{"name":象, "pic": "xxx", "audio":xxx},
    -2:{"name":狮, "pic": "xxx", "audio":xxx},
    -3:{"name":虎, "pic": "xxx", "audio":xxx},
    -4:{"name":豹, "pic": "xxx", "audio":xxx},
    -5:{"name":狼, "pic": "xxx", "audio":xxx},
    -6:{"name":狗, "pic": "xxx", "audio":xxx},
    -7:{"name":猫, "pic": "xxx", "audio":xxx},
    -8:{"name":鼠, "pic": "xxx", "audio":xxx},
    }

##棋盘初始化
主要核心文件，core.js、net.js
初始化棋盘，棋子数组由服务端下发，每个棋子生成一个div，其中：

* animals： 表示棋盘（所有动物）
* animal： 表示一个动物
* hide： 表示为翻牌
* animal1...n ： 表示各个动物的初始位置
* cxx：表示坐标（先左后下），如c01
* div中的 team 属性 为动物值，text 为动物名
* 附加data属性
    * coordinate：{x:0,y:1} 为坐标，意义与c01相同
    * status:状态，false 死，true 活，***死掉的棋子div并不会移除，而是显示空白，其实棋子还在***
    * side: 1:红方，0：绿方

下棋过程，就是各个棋子div位置变换，状态变化的过程

```
<div class="animals">
<div class="animal hide animal1 c00" team="4">豹</div>
<div class="animal hide animal2 c10" team="2">狮</div>
<div class="animal hide animal3 c20" team="-8">鼠</div>
<div class="animal hide animal4 c30" team="6">狗</div>
<div class="animal hide animal5 c01" team="-7">猫</div>
<div class="animal hide animal6 c11" team="8">鼠</div>
<div class="animal hide animal7 c21" team="5">狼</div>
<div class="animal hide animal8 c31" team="3">虎</div>
<div class="animal hide animal9 c02" team="-4">豹</div>
<div class="animal hide animal10 c12" team="-1">象</div>
<div class="animal hide animal11 c22" team="-5">狼</div>
<div class="animal hide animal12 c32" team="-3">虎</div>
<div class="animal hide animal13 c03" team="7">猫</div>
<div class="animal hide animal14 c13" team="1">象</div>
<div class="animal hide animal15 c23" team="-2">狮</div>
<div class="animal hide animal16 c33" team="-6">狗</div>
</div>

```


##下棋
animalObj 提供了下棋的逻辑，主要包括4个方法：

1、初始化棋盘

```
animalObj.init(randomAnimals);//输入为乱序的棋子数组如：[-4, 1, 3, -6, 5, 4, -1, 8, -3, 4, 7, -2, -5, -7, 6, -8]
```
    
2、翻开棋子
``` 
animalObj._showCard(domObj)//输入为被翻开的棋子（div）
```
   
3、激活棋子
```
animalObj._activeCard(domObj)//输入为被激活的棋子（div）
```

3、移动棋子
```
animalObj._move(domA,domB)//输入domA 为起始起始位置的棋子（div），domB为结束位置的棋子(div)
```
4、判断是否结束
```
animalObj._isOver()//返回0：未结束，1：红色方赢，-1：绿色方赢
```

三个动作对应animalObj的三个方法：

* 翻牌
    
    点击class为hide的棋子，触发翻牌事件，调用animalObj._showCard 方法，移除hide class，添加normal class。
    
* 激活

    点击class为normal的棋子，触发激活事件，调用animalObj._activeCard方法，添加active class将棋子激活，并且判断其上下左右是否可达，可达位置标识next class。

* 移动

    点击class为next、die的棋子，触发移动事件，此时
    
    * 若没有棋子为激活状态，则什么都不做
    * 若有一个棋子为激活状态，并且点击的棋子为die状态，则两个棋子互换位置
    * 若有一个棋子为激活状态，并且点击的棋子为next状态，则走吃子逻辑

##交互

http://wiki.uxin001.com/pages/viewpage.action?pageId=11796494
# junglemaster
