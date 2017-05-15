import Realm from 'realm';

class TimerSchema {};
TimerSchema.schema = {
  name: 'Timer',
  properties: {
    latitude: 'int',
    longitude: 'int',
    createdAt: 'int',
    createdAtDate: 'date',
    mediaUri: 'string',
    mediaPath: 'string',
  }
}

class TimerListSchema {};
TimerListSchema.schema = {
  name: 'Timers',
  properties: {
    list1: {type: 'list', objectType: 'Timer'},
    list2: {type: 'list', objectType: 'Timer'},
    list3: {type: 'list', objectType: 'Timer'},
    list4: {type: 'list', objectType: 'Timer'},
    list5: {type: 'list', objectType: 'Timer'},
    list6: {type: 'list', objectType: 'Timer'},
    list7: {type: 'list', objectType: 'Timer'},
    list8: {type: 'list', objectType: 'Timer'},
  }
}

class CameraTimeSchema {};
CameraTimeSchema.schema = {
  name: 'CameraTime',
  properties: {
    timeAccessedAt: 'int'
  }
}

class TimerCountSchema {};
TimerCountSchema.schema = {
  name: 'TimerCount',
  properties: {
    count: 'int'
  }
}


export default const realm = new Realm({
  schema: [{name: 'Dog', properties: {name: 'string'}}, TimerSchema, CameraTimeSchema, TimerListSchema, TimerCountSchema]
});
