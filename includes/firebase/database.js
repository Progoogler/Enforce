import * as firebase from "firebase";

class Database {

    /**
     * Sets a users daily log of tickets
     * @param userId concatenated user profile settings information
     * @param tickets
     * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
     */
    static setUserTickets(cityId, userId, tickets) {

        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        date = `${month}-${day}`;
        let userTicketPath = `/${cityId}/${userId}/${date}`;

        return firebase.database().ref(userTicketPath).set({
            tickets: tickets
        });

    }

    static transferUserData(cityId, userId, data) {
      return firebase.database().ref(`/${cityId}/${userId}`).set(
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

    static getUserTickets(cityId, userId, callback) {
      let userTicketPath = `/${cityId}/${userId}/`;
      let tickets;
      firebase.database().ref(userTicketPath).on('value', (snapshot) => {

        tickets = snapshot.val();
        callback(tickets);
      });
  }

    static deleteUserTickets(cityId, userId) {
      let userTicketPath = `/${cityId}/${userId}/`;
      firebase.database().ref(userTicketPath).remove();
    }

    static setTicketImage(refPath, createdAtId, blob) {
      firebase.storage()
        .ref(refPath)
        .child(createdAtId)
        .put(blob, {contentType: 'image/jpg'})
        .then((snapshot) => {
          console.log('SUCCESS', JSON.stringify(snapshot.metadata));
          blob.close();
        });
    }

}

module.exports = Database;
