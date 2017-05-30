/**
 * @class Database
 */

import * as firebase from "firebase";

class Database {

    /**
     * Sets a users daily log of tickets
     * @param userId
     * @param tickets
     * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
     */
    static setUserTickets(userId, tickets) {
        let date = new Date();
        let month = date.getMonth();
        let day = date.getDate();
        date = `${month}-${day}`;
        let userTicketPath = `/user/${userId}/${date}`;

        return firebase.database().ref(userTicketPath).set({
            tickets: tickets
        })

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

            callback(tickets)
        });
    }

}

module.exports = Database;
