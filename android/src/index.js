import React, { Component } from 'react';
import App from './components/App';
import { cameraSetter } from './reducers';
import { createStore } from 'redux';

export default class Root extends Component {

  render() {
    let store = createStore(cameraSetter);
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}
