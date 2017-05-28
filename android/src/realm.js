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
    ticketedAtDate: 'date',
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

class ExpiredSchema {};
ExpiredSchema.schema = {
  name: 'Expired',
  properties: {
    list: {type: 'list', objectType: 'Timer'}
  }
}

class CoordinatesSchema {};
CoordinatesSchema.schema = {
  name: 'Coordinates',
  properties: {
    latitude: 'float',
    longitude: 'float'
  }
}

export default [TimerSchema, TimerListSchema, TimerSequenceSchema, TimeLimitSchema, TicketedSchema, ExpiredSchema, CoordinatesSchema];
