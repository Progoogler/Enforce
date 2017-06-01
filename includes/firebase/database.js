/**
 * @class Database
 */

import * as firebase from "firebase";

class Database {

    /**
     * Sets a users daily log of tickets
     * @param userId concatenated user profile settings information
     * @param tickets
     * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
     */
    static setUserTickets(userId, tickets) {
      console.log('SET USER TICKETS, ID', userId)
        let date = new Date();
        let month = date.getMonth();
        let day = date.getDate();
        date = `${month}-${day}`;
        let userTicketPath = `/user/${userId}/${date}`;

        return firebase.database().ref(userTicketPath).set({
            tickets: tickets
        });

    }

    static transferUserData(userId, data) {
      return firebase.database().ref('/user/').set({
        userId: data
      });
    }

    /**
     * Listen for changes to a users tickets log
     * @param userId
     * @param callback Users ticket log
     */
    static listenUserTickets(userId, callback) {
        let date = new Date();
        let month = date.getMonth();
        let day = date.getDate();
        date = `${month}-${day}`;
        let userTicketPath = `/user/${userId}/${date}`;


        firebase.database().ref(userTicketPath).on('value', (snapshot) => {

            var tickets = {};

            if (snapshot.val()) {
                tickets = snapshot.val().tickets
            }

            callback(tickets);
        });
    }

    static getUserTickets(userId) {
      let userTicketPath = `/user/${userId}/`;
      let tickets = {};

      firebase.database().ref(userTicketPath).on('value', (snapshot) => {

          if (snapshot.val()) {
            tickets = snapshot.val();
          }
      });
      console.log('GET USER TICKETS', tickets)
      return tickets;

  }


}

module.exports = Database;
