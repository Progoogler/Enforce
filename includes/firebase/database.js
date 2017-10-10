import * as firebase from "firebase";

class Database {

  /**
   * Sets a users daily log of tickets.
   * @param userId concatenated user profile settings information.
   * @param tickets The entire list of ticketed objects w/ keys renamed to license or createdAt value.
   * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
   */
  static setUserTickets(ticketRefPath, tickets) {
    return firebase.database().ref(ticketRefPath).set({
        tickets: tickets
    });
  }

  static transferUserData(refPath, data) {
    return firebase.database().ref(`/${refPath}`).set(
      data
    );
  }

  /**
   * Listen for changes to a users tickets log.
   * @param userId AsyncStorage @Enforce:profileId - uuid.
   * @param callback User's ticket log.
   
  static listenUserTickets(userId, callback) {
    var date = new Date();
    date = `${date.getMonth() + 1}-${date.getDate()}`;
    var userTicketPath = `/user/${userId}/${date}`;

    firebase.database().ref(userTicketPath).on('value', (snapshot) => {
      var tickets = {};

      if (snapshot.val()) tickets = snapshot.val().tickets
      callback(tickets);

    });
  }
  */

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
    .then(() => {
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
    .catch(() => {
      callback(null);
    });
  }

  static getHistoryData(stateId, countyId, userId, dateId, callback) {
    let refPath = `${stateId}/${countyId}/${userId}/${dateId}`;
    firebase.database().ref(refPath).once('value').then((snapshot) => {
      callback(snapshot.val());
    });
  }

  /*
  * Get every instance of the ticketed license in database.
  * @param refPath: `${state}/${county}/${uuid}/${dates[i]}/tickets`.
  * @param dates: AsyncStorage @Enforce:dateCount.
  * @param license: License in search input.
  * @param callback: Pass results back to Search component for display.
  */
  static getLicenseHistory(refPath, dates, license, callback) {
    var results = [];
    for (let i = 0; i < dates.length; i++) { 
      let ref = firebase.database().ref(`${refPath}/${dates[i]}/tickets`);
      ref.child(license).once("value")
      .then((snapshot) => {
        if (snapshot.val()) {
          results.push(snapshot.val());
        }
        if (i === dates.length - 1) callback(results);
      });
    }
  }
}

module.exports = Database;
