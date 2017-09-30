import Realm from 'realm';
var realm = new Realm();

const historySearch = (license: string, type?: string): object => {
  if (typeof license !== 'string') return;
  if (license.length > 7) return;

  const result = {};
  var ticketed = realm.objects('Ticketed')[0]['list'];

  if (type === 'vinSearch') {
    for (let i = 0; i < ticketed.length; i++) {
      if (ticketed[i].VIN === license) {
        result['type'] = 'ticketed';
        result['data'] = ticketed[i];
        return result;
      }
    }
    let expired = realm.objects('Expired')[0]['list'];
    for (let i = 0; i < expired.length; i++) {
      if (expired[i].VIN === license) {
        result['type'] = 'expired';
        result['data'] = expired[i];
        return result;
      }
    }
  } else {
    for (let i = 0; i < ticketed.length; i++) {
      if (ticketed[i].license === license) {
        result['type'] = 'ticketed';
        result['data'] = ticketed[i];
        return result;
      }
    }
    let expired = realm.objects('Expired')[0]['list'];
    for (let i = 0; i < expired.length; i++) {
      if (expired[i].license === license) {
        result['type'] = 'expired';
        result['data'] = expired[i];
        return result;
      }
    }
  }
};

export default historySearch;
