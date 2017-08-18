import React from 'react';

const polyfill = {
  Blob: {}
};

class RNFetchBlob extends React.Component {

  static polyfill = polyfill;
  render() {
    return null;
  }
}

RNFetchBlob.polyfill = polyfill;

export default RNFetchBlob;
