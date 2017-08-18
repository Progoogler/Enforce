import 'react-native';
import React from 'react';
import Index from '../index.android.js';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  jest.mock('react-native-camera', () => mockCamera);
  jest.mock('realm', () => mockRealm);
  jest.mock('react-native-push-notification', () => mockPushNotication);
  jest.mock('react-native-fetch-blob', () => mockFetchBlob);
  jest.mock('react-navigation', () => mockReactNavigation);
  const tree = renderer.create(
    <Index />
  );
});
