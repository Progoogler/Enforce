import Realm from 'realm';
var realm = new Realm();

const historySearch = (license: string, type?: string, cb): object => {
  if (typeof license !== 'string') return;
  if (license.length > 7) return;

  const result = {};
  var ticketed = realm.objects('Ticketed')[0]['list'];

  if (type === 'vinSearch') {
    for (let i = 0; i < ticketed.length; i++) {
      if (ticketed[i].VIN === license) {
        result['type'] = 'ticketed';
        result['data'] = ticketed[i];
        cb(result);
        return;
      } else if (ticketed[i].license === license) { // Double check w/ license b/c 'vinSearch' is based on an assumption.
        result['type'] = 'ticketed';
        result['data'] = ticketed[i];
        cb(result);
        return;
      }
    }
    // Ignore expired list - the chances of finding a VIN in this listing is too small to care about.
    //
    // let expired = realm.objects('Expired')[0]['list'];
    // for (let i = 0; i < expired.length; i++) {
    //   if (expired[i].license === license) {
    //     result['type'] = 'expired';
    //     result['data'] = expired[i];
    //     cb(result);
    //     return;
    //   }
    // }
  } else {
    for (let i = 0; i < ticketed.length; i++) {
      if (ticketed[i].license === license) {
        result['type'] = 'ticketed';
        result['data'] = ticketed[i];
        cb(result);
        return;
      }
    }
    var expired = realm.objects('Expired')[0]['list'];
    for (let i = 0; i < expired.length; i++) {
      if (expired[i].license === license) {
        result['type'] = 'expired';
        result['data'] = expired[i];
        cb(result);
        return;
      }
    }
  }
  cb(undefined);
};

export default historySearch;
