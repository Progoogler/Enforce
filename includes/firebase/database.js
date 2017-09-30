import * as firebase from "firebase";

class Database {

    /**
     * Sets a users daily log of tickets
     * @param userId concatenated user profile settings information
     * @param tickets
     * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
     */
    static setUserTickets(refPath, tickets) {

        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        date = `${month}-${day}`;
        let userTicketPath = `/${refPath}/${date}`;

        return firebase.database().ref(userTicketPath).set({
            tickets: tickets
        });

    }

    static transferUserData(refPath, data) {
      return firebase.database().ref(`/${refPath}`).set(
        data
      );
    }

    /**
     * Listen for changes to a users tickets log
     * @param userId
     * @param callback Users ticket log
     */
    static listenUserTickets(userId, callback) {
        let date = new Date();
        let month = date.getMonth() + 1;
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

    static getUserTickets(refPath, callback) {
      let tickets;
      firebase.database().ref(refPath).on('value', (snapshot) => {

        tickets = snapshot.val();
        callback(tickets);
      });
  }

    static deleteUserTickets(stateId, countyId, userId) {
      let userTicketPath = `/${stateId}/${countyId}/${userId}/`;
      firebase.database().ref(userTicketPath).remove();
    }

    static removeTicketPath(refPath, ticketDate) {
      let ticketPath = `${refPath}/${ticketDate}`;
      firebase.database().ref(ticketPath).remove();
    }

    static setTicketImage(refPath, createdAtId, blob) {
      firebase.storage()
        .ref(refPath)
        .child(createdAtId)
        .put(blob, {contentType: 'image/jpg'})
        .then((snapshot) => {
          blob.close();
        });
    }

    static getTicketImage(refPath, createdAtId, callback) {
      firebase.storage()
        .ref(`${refPath}/${createdAtId}`)
        .getDownloadURL()
        .then(url => {
          callback(url);
        })
        .catch((err) => {
          callback(null);
        });
    }

    static getHistoryData(stateId, countyId, userId, dateId, callback) {
      let refPath = `${stateId}/${countyId}/${userId}/${dateId}`;
      firebase.database().ref(refPath).once('value').then((snapshot) => {
        callback(snapshot.val());
      });
    }

}

module.exports = Database;
