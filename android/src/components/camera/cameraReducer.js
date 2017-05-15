import { AsyncStorage } from 'react-native';

const initialState = {num: 0};

export const storageState = (async function(){
  try {
    let storageState = await AsyncStorage.getItem('@Quicket:test');
    if (storageState !== null) {
      console.log('async', storageState);
      return storageState;
    }
  } catch (error) {
    return undefined;
  }
})();

export default function cameraReducer(state = initialState, action) {
  switch(action.type) {
    case 'ADD_MARKER':
      return {...state};
    case 'INC':
      return {...state, num: state.num + action.payload}
    default:
      return state;
  }
}
