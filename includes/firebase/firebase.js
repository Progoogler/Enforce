import * as firebase from "firebase";

class Firebase {

    /**
     * Initialises Firebase
     */
    static initialize() {
      try {
        firebase.initializeApp({
          apiKey: "AIzaSyCCwfr4OX-5mxsIJNUx6oNddL82_XCD2kY",
          authDomain: "enforce-38763.firebaseapp.com",
          databaseURL: "https://enforce-38763.firebaseio.com",
          projectId: "enforce-38763",
          storageBucket: "enforce-38763.appspot.com",
          messagingSenderId: "386746225329"
        });
      } catch (err) {
        // we skip the "already exists" message which is
        // not an actual error when we're hot-reloading
        if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
        }
      }
    }

}

module.exports = Firebase;
