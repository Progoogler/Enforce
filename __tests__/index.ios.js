import 'react-native';
import React from 'react';
import Index from '../index.ios.js';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

//const fs = jest.genMockFromModule('react-native-fs');
//const realm = jest.genMockFromModule('realm');

it('renders correctly', () => {
  jest.mock('react-native-camera', () => mockCamera);
  jest.mock('realm', () => mockRealm);
  jest.mock('react-native-status-bar-size', () => mockStatusBarSizeIOS);
  jest.mock('react-native-fetch-blob', () => mockFetchBlob);
  jest.mock('react-navigation', () => mockReactNavigation);
  const tree = renderer.create(
    <Index />
  );
});
