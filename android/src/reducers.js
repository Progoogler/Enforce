// const testState = {
//   timers: {
//     1: {
//       marker_1: {
//         photo: url('/api/photo_url'),
//         time: new Date(),
//         location: {
//           latitude: 37.29184,
//           longitude: -122.38914
//         },
//         license: null
//       },
//       marker_2: {
//         photo: url('/api/photo_url'),
//         time: new Date(),
//         location: {
//           latitude: 37.29184,
//           longitude: -122.38914
//         },
//         license: null
//       }
//     },
//     2: {
//       marker_1: {
//         photo: url('/api/photo_url'),
//         time: new Date(),
//         location: {
//           latitude: 37.29184,
//           longitude: -122.38914
//         },
//         license: null
//       }
//     }
//   }
//
// }

// pass in state.timer_id object as state
export function cameraSetter(state = {}, action) {
  switch(action.type) {
    case ADD_MARKER:
      return {...state};
    default:
      return state;
  }
}


// , {action.marker_id: {
//   photo: action.photo,
//   time: action.time,
//   location: action.location,
//   license: action.license
// }
