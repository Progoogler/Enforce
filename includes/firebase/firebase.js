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

    static signInUser(userId, password) {
      firebase.auth().signInWithEmailAndPassword(userId, password).catch((err) => {
        console.error(`Error signing in: [ERROR ${err.code}] ${err.message}`);
      })
    }

    static getCurrentUser() {
      let user = firebase.auth().currentUser;
      console.log('get user', user.uid)
      return user.uid;
    }

    static deleteUser() {
      let user = firebase.auth().currentUser;
      console.log('FIREBASE DELETEUSER()', user)
      user.delete().then(() => {
        console.log('FIREBASE: USER DELETED');
      }, (err) => {
        console.warn(`FIREBASE: USER DELETION FAILED! ERROR: ${err}`);
      });
    }

}

module.exports = Firebase;
