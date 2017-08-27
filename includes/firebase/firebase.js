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

    static createNewUser(userId, password) {
      firebase.auth().createUserWithEmailAndPassword(userId, password).catch((err) => {
        console.error(`Error creating new user: [ERROR ${err.code}] ${err.message}`);
      });
    }

    static signInUser(userId, password, response) {
      firebase.auth().signInWithEmailAndPassword(userId, password).catch((err) => {
        response && response('Cannot sign in.');
        console.error(`Error signing in: [ERROR ${err.code}] ${err.message}`);
      })
    }

    static changeUserPassword(newPassword) {
      let user = firebase.auth().currentUser;
      user.updatePassword(newPassword);
    }

    static getCurrentUser() {
      let user = firebase.auth().currentUser;
      return user.uid;
    }

    static deleteUser() {
      let user = firebase.auth().currentUser;

      // Returns a promise but we ignore the catch and finish without a resolve
      user.delete();
    }

}

module.exports = Firebase;
