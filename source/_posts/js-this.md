---
title: js-this 理解
date: 2017-12-27 18:28:10
tags: [js,this,html]
author: gauseen
---


this 在函数定义的时候是确定不了的，只有函数执行的时候才能确定 this 的指向

### 一、调用函数 this 默认指向 

#### （1）正常的函数调用

##### // 1.1.1

```javascript
function fn1(){
    console.log(this); //window
}
fn1();


function fn2(){
	'use strict'
    console.log(this); //undefined
}
fn2();
```

javaScript [严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode) 详解

#### （2）作为某个对象方法的调用

##### // 1.2.1

```javascript
var obj = {
	name: 'lisi',
	fn: function() {
		console.log(this.name); // lisi
    }
}
obj.fn();
```

###### // 1.2.2

```javascript
var obj = {
	name: 'lisi',
	child: {
		name: 'children',
		fn:  function() {
			console.log(this.name); // children
		}
	}
}

obj.child.fn();
```

###### // 1.2.3

```javascript
var obj = {
	name: 'lisi',
	fn: function() {
		console.log(this); // window
    }
}

var fakerFn = obj.fn;
fakerFn();
```

------

**`注`**：==this 永远指向的是最后调用它的那个对象。==

### 二、改变 this 指向

#### （1）作为构造函数被调用

##### // 2.1.1

```javascript
function Fn() {
	this.name = 'lisi';
}

var fn = new Fn();
console.log(fn.name); // lisi
```

##### // 2.1.2

```javascript
function Fn() {
	this.name = 'lisi';
	return {
		name: 'returnName'
	}
}

var fn = new Fn();
console.log(fn.name); // returnName
```

**`注：`**==在构造函数中，如果 return 值是一个对象（ null 除外），那么this指向的就是那个返回的对象，如果返回值不是一个对象那么this还是指向函数的实例。==

#### （2）apply、call、bind 改变 this 指向

##### // 2.2.1

```javascript
fn.apply(thisArg, [argsArray])
fn.call(thisArg, arg1, arg2, ...)
```

apply()，call() 方法调用一个函数，并指定一个this值。



thisArg
在 fn 函数运行时指定的 this 值。需要注意的是，指定的 this 值并不一定是该函数执行时真正的 this 值，如果这个函数处于非严格模式下，则指定为 null 或 undefined 时会自动指向全局对象（浏览器中就是window对象），同时值为原始值（数字，字符串，布尔值）的 this 会指向该原始值的自动包装对象。

------

argsArray
一个数组或者类数组对象，其中的数组元素将作为单独的参数传给 fn 函数。如果该参数的值为 null 或 undefined，则表示不需要传入任何参数。从 es5 开始可以使用类数组对象。

------

arg1, arg2, ...

指定的参数序列 e.g:  1,2,3

##### // 2.2.2

```
fn.bind(thisArg[, arg1[, arg2[, ...]]])
```

bind()方法创建一个新的函数，当被调用时，将其 this 关键字设置为提供的值，在调用新函数时，在任何提供之前提供一个给定的参数序列。

thisArg
当绑定函数被调用时，该参数会作为原函数运行时的 this 指向。当使用 new 操作符调用绑定函数时，该参数无效。

arg1, arg2, ...
当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。

bind() 方法返回由指定的 this 值和初始化参数改造的原函数拷贝。

```javascript
var obj = {
	name: 'obj',
	x: 1,
	y: 2,
}
// 1 ----------------------------------------------------
function add(x, y) {
	console.log(this);   // obj
	return this.x + this.y;  // 3
}
var fun = add.bind(obj);
fun();

// 2 -----------------------------------------------------

function fn(a, b, c) {
	console.log(this.name, a, b, c); 
}
var fakerFn = fn.bind(obj, 1);

fakerFn(2, 3); // obj, 1, 2, 3

var fn = new fakerFn(2, 3); // undefined, 1, 2, 3
```

#### （3）DOM对象对函数调用

```javascript
// <button id="btn"></button>

var btn = document.querySelector('#btn')
btn.addEventListener('click', function(){
  console.log(this)  // DOM
});


var obj = {
  name: 'obj...'
}
var listener = function(){
  console.log(this)  // obj
}.bind(obj);
btn.addEventListener('click', listener);
```

### 三、箭头函数

 	在[箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)中，`this`  是根据当前的词法作用域来决定的，就是说，箭头函数会继承外层函数调用的 `this` 绑定（无论 `this` 绑定到什么）。在全局作用域中，它会绑定到全局对象上（[严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)与  `this`  相关的规则都将被忽略）。

```javascript
var obj = {
  name: 'obj...',
  bar: function() {
    console.log('bar-fn: ', this)
    let fn = () => this
    return fn;
  }
}
var fn = obj.bar()
console.log(fn() === obj) // true

var fn2 = obj.bar
console.log(fn2()() === window) // true
```



### *小技巧

###### 1. 类数组 => 数组

```javascript
var lis = document.querySelectorAll('li');
var arrLis = Array.prototype.slice.apply(lis);
```

###### 2. 取数组大小值

```javascript
var arr = [1,2,3]
Math.max.apply(null, [1,2,3]) // 3

// es6 --------------------------------
Math.max(...[1,2,3])  // 3
```

###### 3.  给js内置函数添加方法 e.g

```javascript
Array.prototype.delRepeat = function(){
  var instance = this,
      faker = {},
      arr = []
  instance.forEach(function(item, index){
    var key = '_key' + item
    if (!faker[key]) {
      arr.push(item)
      faker[key] = true
    }
  })
  return arr
}
var result = [1,2,2,1,1].delRepeat()
console.log(result) // [1,2]
```
