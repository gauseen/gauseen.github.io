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
