class TimerSchema {};
TimerSchema.schema = {
  name: 'Timer',
  properties: {
    index: 'int',
    latitude: 'float',
    longitude: 'float',
    timeLength: 'float',
    createdAt: 'int',
    createdAtDate: 'date',
    tickedAtDate: 'date',
    mediaUri: 'string',
    mediaPath: 'string',
    description: 'string'
  }
}

class TimerListSchema {};
TimerListSchema.schema = {
  name: 'Timers',
  properties: {
    list: {type: 'list', objectType: 'Timer'}
  }
}

class TimerSequenceSchema {};
TimerSequenceSchema.schema = {
  name: 'TimerSequence',
  properties: {
    timeAccessedAt: 'int',
    count: 'int'
  }
}

class TimeLimitSchema {};
TimeLimitSchema.schema = {
  name: 'TimeLimit',
  properties: {
    float: 'float',
    hour: 'string',
    minutes: 'string'
  }
}

class TicketedSchema {};
TicketedSchema.schema = {
  name: 'Ticketed',
  properties: {
    list: {type: 'list', objectType: 'Timer'}
  }
}

export default [TimerSchema, TimerListSchema, TimerSequenceSchema, TimeLimitSchema, TicketedSchema];
