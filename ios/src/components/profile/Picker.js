import React from 'react';
import {
  View,
  Picker,
  StyleSheet,
} from 'react-native';

const PickerMenu = () => (
  <View style={styles.container}>
    <Picker
      style={{width: 100}}
      selectedValue={this.state.selected1}
      onValueChange={ this._onValueChange.bind(this, 'selected1') }>
      <Picker.Item label="hello" value="key0" />
      <Picker.Item label="world" value="key1" />
    </Picker>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    borderColor: '#4286f4',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,

  },
  text: {
    color: '#4286f4',
  },
});

export default PickerMenu;
