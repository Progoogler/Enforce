class TimerSchema {};
TimerSchema.schema = {
  name: 'Timer',
  properties: {
    key: 'string',
    latitude: 'float',
    longitude: 'float',
    timeLength: 'float',
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
    list: {type: 'list', objectType: 'Timer'}
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

export default [{name: 'Dog', properties: {name: 'string'}}, TimerSchema, CameraTimeSchema, TimerListSchema, TimerCountSchema];
