/*
  @Params: [lat,long]S = Start point
  @Params: [lat,long]E = End point

  General direction for the first timer of a row // In description or title
  - - compute delta between the first coordinate with the average of the next five coordinates to generate a bound

  { this.props.data.description ?
    <View style={styles.locationContainer}>
      <Text style={styles.location}>{ `${this.props.data.description} ${coordinatesBound(this.props.data.latitude,
        this.props.data.longitude,
        this.boundLat,
        this.boundLong)}` }</Text>
    </View>
    : null }

    componentWillMount() {
      var nextNeighbor = this.props.realm.objects('Timers')[this.props.data.index].list[this.props.index + 1]
      if (nextNeighbor) {
        this.boundLat = nextNeighbor.latitude;
        this.boundLong = nextNeighbor.longitude;
      }
    }

*/

var coordinatesBound = function(latS, longS, latE, longE) {
  if (latS === undefined || latE === undefined) return '';

  var latDiff = latS - latE;
  if (!negate(latDiff)) {
    var latBound = latS < latE ? 'North' : 'South';
  }

  var longDiff = longS - longE;
  if (!negate(longDiff)) {
    var longBound = longS < longE ? 'east' : 'west';
  }

  if (latBound && longBound) {
    return latBound + longBound;
  } else if (latBound) {
    return latBound;
  } else {
    return longBound === 'west' ? 'West' : 'East';
  }
}

function negate(decimal) { console.log(decimal)
  if (decimal === 0) return false;
  var str = decimal.toString();

  // Check the ones place for a number greater than zero signifying
  // a significant distance difference.
  var ones = typeof str[0] === 'number' ? str[0] : str[1];
  if (ones > 0) return false;

  // Check whether the number of zeroes between the decimal point
  // and the first digit greater than zero is a significant amount
  // negating the direction bound between the coordinates.
  var zeroes = 0;
  var start = typeof str[0] === 'number' ? 2 : 3;
  for (let i = start; i < str.length; i++) {
    if (str[i] !== '0') break;
    zeroes++;
  }

  if (zeroes >= str.length - 6) return true;
}

export default coordinatesBound;
