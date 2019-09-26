---
title: JavaScript 设计模式
date: 2019-09-26 12:29:00
tags: [js,design,patterns]
author: gauseen
---

### 单例模式（`Singleton Pattern`）

**描述：**

只对外暴露一个对象

```js
// 只创建一个实例

const mySingleton = (function () {
  let instance = null
  // 初始化方法
  let init = () => {
    console.log('init logic')

    return {
      someThing () {
        alert('hello world')
      },
    }
  }

  return {
    getInstance () {
      // 不存在 instance 创建新的，已存在则直接返回（只创建一次）
      if (!instance) {
        instance = init()
      }
      return instance
    },
  }
})()
```

```js
// 每次都创建一个新的实例

const myBadSingleton = (function () {
  let instance = null
  // 初始化方法
  let init = () => {
    console.log('init logic')

    return {
      someThing () {
        alert('hello world')
      },
    }
  }

  return {
    getInstance () {
      // 每次都创建一个新的实例（创建多次）
      instance = init()
      return instance
    },
  }
})()
```

### 观察者模式（`Observer Pattern`）

**真实场景：**

以公众号为例，有些人订阅（关注）了某公众号，当公众号发布新的消息时，订阅者就会收到该消息的推送

**描述：**

定义对象之间的依赖关系，每当对象更改状态时，都会通知所有依赖项

```js
// 观察者
class Observer {
  constructor (name) {
    this.name = name
  }
  // 每个观察者都有一个 smile 事件
  update () {
    console.log(`${this.name} is updated`)
  }
}

// 主体
class Subject {
  constructor () {
    // 观察者列表
    this.observers = []
  }
  // 添加观察者到主体的观察者列表
  subscribe (observer) {
    this.observers.push(observer)
  }
  // 通知所有观察者
  notify () {
    this.observers.forEach(observerItem => {
      observerItem.update()
    })
  }
}

// 创建主体实例
const subject = new Subject()

// 有 2 个观察者 observer01、observer02
const observer01 = new Observer('observer_01')
const observer02 = new Observer('observer_02')

// 观察者订阅主体
subject.subscribe(observer01)
subject.subscribe(observer02)

// 通知所有观察者
subject.notify()
```

### 发布-订阅模式（`Publish/Subscribe Pattern`）

**真实场景：**

报社将报纸发送给邮局，邮局按照订阅关系将报纸发送给对应的人

**描述：**

消息的发送者（称为发布者）不会将消息直接发送给特定的接收者（称为订阅者）。而是将发布的消息分为不同的类别，无需了解哪些订阅者。同样的，订阅者可以订阅一个或多个类别，只接收感兴趣的消息，无需了解哪些发布者

```js
// 订阅者
class Subscriber {
  constructor (name) {
    this.name = name
  }
  // 每个观察者都有一个 smile 事件
  update () {
    console.log(`${this.name} is updated`)
  }
}

// 调度中心
class EventHub {
  constructor () {
    // 订阅主题
    this.topics = {}
  }

  // 订阅
  subscribe (topicType, subscriber) {
    if (!this.topics[topicType]) {
      this.topics[topicType] = []
    }

    this.topics[topicType].push(subscriber)
  }

  // 给对应主题下的订阅者发布内容
  publish (topicType) {
    let topicList = this.topics[topicType]

    if (!topicList) return

    topicList.forEach(subscriberItem => {
      subscriberItem.update()
    })
  }
}

// 创建一个“调度中心”
let eventHub = new EventHub()

// 创建 3 个订阅者 subscriber01、subscriber02、subscriber03
let subscriber01 = new Subscriber('subscriber_01')
let subscriber02 = new Subscriber('subscriber_02')
let subscriber03 = new Subscriber('subscriber_03')

// 订阅者注册“调度中心”
eventHub.subscribe('typeA', subscriber01)
eventHub.subscribe('typeA', subscriber02)
eventHub.subscribe('typeB', subscriber03)

// 发布者对 typeA 主题发布内容
eventHub.publish('typeA')
// subscriber_01 is updated
// subscriber_02 is updated

// 发布者对 typeB 主题发布内容
eventHub.publish('typeA')
// subscriber_03 is updated
```

### 观察者模式 vs 发布-订阅模式

![](https://raw.githubusercontent.com/gauseen/images-bed/master/blog/observe-vs-publisher-subscriber.png)


如上图

- 观察者模式中，主体（`Subject`）和观察者（`Observer`）是强耦合，有直接的联系，相互知道对方的存在。
- 发布-订阅模式中，主体（`Subject`）和观察者（`Observer`）是松耦合，没有直接的联系，是通过“事件通道”（调度中心）建立联系，互相不知道对方存在。

奇葩解释：观察者模式，没中间商赚差价；发布-订阅模式，有中间商赚差价 :laughing:


### 工厂模式（`Factory Pattern`）

```js
class CarA {
  constructor (model, color) {
    console.log('CarA')
  }
}
class CarB {
  constructor (model, color) {
    console.log('CarB')
  }
}

class CarFactory {
  carA () { return CarA }
  carB () { return CarB }

  create (type) {
    let CarClass = this[type]()
    return new CarClass()
  }
}

let carFactory = new CarFactory()

// 通过 carFactory 创建不同的 car
let carA = carFactory.create('carA')
let carB = carFactory.create('carB')
```

### 适配器模式（`Adapter Pattern`）

**真实场景：**

现在好多智能手机都去掉了 `3.5mm` 的耳机孔，取而代之的是 `Type-C` 接口耳机。但是你还想在新手机中使用 `3.5mm` 的老式耳机怎么办？

没错，那就需要用适配器，`Type-C` 转 `3.5mm` 的适配器。如下图 :laughing:：

![](https://raw.githubusercontent.com/gauseen/images-bed/master/blog/adapter.jpg)

**描述：**

可以将其他不兼容的对象包装在适配器中，使它与另一个类兼容

```js
// Type-C 耳机
class TypecHeadset {
  typeC () {
    console.log('Type-C 耳机已插入')
  }
}

// 3.5 毫米耳机
class Dot35mmHeadset {
  dot35mm () {
    console.log('3.5mm 耳机已插入')
  }
}

// 适配器（3.5 毫米 --> Type-C）

class Dot35mmToTypecAdapter {
  constructor (dot35mmHeadset) {
    this.dot35mmHeadset = dot35mmHeadset
  }

  typeC () {
    this.dot35mmHeadset.dot35mm()
  }
}

// 手机类（该手机只支持 Type-C 耳机）
class Phone {
  // 插入耳机孔
  insertTypeC (headset) {
    headset.typeC()
  }
}


let phone = new Phone()
// Type-C 耳机
let typecHeadset = new TypecHeadset()

// 3.5 毫米耳机
let dot35mmHeadset = new Dot35mmHeadset()

// 耳机适配器（3.5 毫米 --> Type-C）
let dot35mmToTypecAdapter = new Dot35mmToTypecAdapter(dot35mmHeadset)

phone.insertTypeC(typecHeadset) // Type-C 耳机已插入
phone.insertTypeC(dot35mmToTypecAdapter) // 3.5mm 耳机已插入
```

### 装饰者模式（`Decorator Pattern`）

**真实场景：**

先建一个基础版本的手机，经过再加工对手机进行装饰润色，

**描述：**

装饰者模式，允许你通过将对象包装在装饰器类的对象中，来动态更改对象在运行时的表现行为

```js
// 基础 car 类
class SimpleCar {
  getCost () {
    return 10
  }

  getDescription () {
    return 'Simple car'
  }
}

// 奥迪
class AudiCar {
  constructor (car) {
    this.car = car
  }

  getCost () {
    return this.car.getCost() + 6
  }

  getDescription () {
    return this.car.getDescription() + ', Audi'
  }
}

// 宝马
class BMWCar {
  constructor (car) {
    this.car = car
  }

  getCost () {
    return this.car.getCost() + 8
  }

  getDescription () {
    return this.car.getDescription() + ', BMW'
  }
}

// 基础车信息
let simpleCar = new SimpleCar()
simpleCar.getCost() // 10
simpleCar.getDescription() // Simple car

// 奥迪车信息
let audiCar = new AudiCar(simpleCar)
audiCar.getCost() // 16
audiCar.getDescription() // Simple car, Audi

// 宝马车信息
let bmwCar = new BMWCar(simpleCar)
bmwCar.getCost() // 18
bmwCar.getDescription() // Simple car, BMW
```

### 外观模式（`Facade Pattern`）

**真实场景：**

如何让手机开机？很简单，“长按电源键”即可开机。实际上手机内部处理了很多逻辑才能实现它。这就是所谓的外观模式，将复杂转为简洁。

例如，开发时常用于浏览器兼容性处理的代码。

**描述：**

为复杂的子系统提供了简化统一的界面


```js
// DOM 绑定事件的兼容性处理
function addEventFacade (el, eve, fn) {
  if (el.addEventListener) {
    el.addEventListener(eve, fn, false)
  } else if (el.attachEvent) {
    el.attachEvent('on' + eve, fn)
  } else {
    el['on' + eve] = fn
  }
}
```

### 代理模式（`Proxy Pattern`）

**真实场景：**

你可以直接去专卖店买手机（某海外品牌），也可以通过**代购**帮你买手机（这样价格会便宜些）。让**代购**买手机这种方式，就是所谓的**代理模式**。

`js` 原生也支持代理模式 [Proxy][Proxy]

**描述：**

用一个对象来表示另一个对象的功能

```js
class Phone {
  constructor () {
    this.phoneName = 'Mate 90' // 手机名
    this.screen = '6.21' // 尺寸
    this.color = 'black' // 颜色
    this.chip = 'kirin' // 芯片
  }
}

class ProxyPerson {
  constructor(target) {
    this.target = target
  }
  buyPhone (phoneModel) {
    this.target.buyPhone(phoneModel)
  }
}

class Person {
  buyPhone (phoneModel) {
    console.log('哈哈，买到了: ', phoneModel.phoneName)
  }
}

let proxyPerson = new ProxyPerson(new Person())
proxyPerson.buyPhone(new Phone()) // 哈哈，买到了: Meta 90
```

### 策略模式（`Strategy Pattern`）

**真实场景：**

商店打折促销，某商品买 `1` 件原价，`2` 件 `8` 折，`3` 件 `7` 折

**描述：**

在代码运行时，根据不同情况切换不同的策略（方法）

```js
// 策略组
const strategies = {
  num1 (price) {
    return price * 1
  },
  num2 (price) {
    return price * 0.8
  },
  num3 (price) {
    return price * 0.7
  },
}

// 获取折后总价
function getDiscountPrice (n, price) {
  let _key = `num${n}`
  let discountedForItem = strategies[_key](price)
  return discountedForItem * n
}

getDiscountPrice(1, 10) // 10
getDiscountPrice(2, 10) // 16
getDiscountPrice(3, 10) // 21
```

### 状态模式（`State Pattern`）

**描述：**

在状态更改时更改类的行为（方法）

```js
class Discount {
  constructor () {
    // 当前状态
    this.currentState = ''
    // 所有状态
    this.states = {
      typeA () {
        console.log('typeA 1')
      },
      typeB () {
        console.log('typeB 0.8')
      },
      typeC () {
        console.log('typeC 0.7')
      },
    }
  }
  // 更新当前状态
  setState (_currentState) {
    this.currentState = _currentState
    return this
  }
  // 开始计算
  compute () {
    let currentStateHandler = this.states[this.currentState]
    currentStateHandler && currentStateHandler()
    return this
  }
}

let discount = new Discount()

discount
  .setState('typeA')
  .compute() // typeA 1
  .setState('typeC')
  .compute() // typeC 0.7
  .setState('typeB')
  .compute() // typeB 0.8
```


欢迎关注**无广告文章**公众号：**学前端**

![](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)








### 参考
- [Learning JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book)
- [javascript-design-patterns-for-humans](https://github.com/sohamkamani/javascript-design-patterns-for-humans)
- [观察者模式 vs 发布-订阅模式](https://juejin.im/post/5a14e9edf265da4312808d86)
- [观察者模式和订阅-发布模式的区别](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/25)
- [汤姆大叔的博客](https://www.cnblogs.com/TomXu/archive/2011/12/15/2288411.html)

<!-- 链接 -->

[Proxy]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
