import database from '@react-native-firebase/database';
import moment from 'moment';

export const SenderMessage = async (
  currentUid,
  guestUid,
  message,
  imageSource,
  fileSource,
  filename,
  currentLocation,
) => {
  var todayDate = moment();
  try {
    return await database()
      .ref('messages/' + currentUid)
      .child(guestUid)
      .push({
        message: {
          sender: currentUid,
          reciever: guestUid,
          msg: message,
          image: imageSource,
          file:fileSource,
          filename:filename,
          currentLocation:currentLocation,
          date: todayDate.format('MMM Do YY'),
          time: todayDate.format('hh:mm A'),
        },
      })
      .then(() => console.log('Message send.'))
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    return error;
  }
};

export const RecieverMessage = async (
  currentUid,
  guestUid,
  message,
  imageSource,
  fileSource,
  filename,
  currentLocation
) => {
  try {
    var todayDate = moment();
    return await database()
      .ref('messages/' + guestUid)
      .child(currentUid)
      .push({
        message: {
          sender: currentUid,
          reciever: guestUid,
          msg: message,
          image: imageSource,
          file:fileSource,
          filename:filename,
          currentLocation:currentLocation,
          date: todayDate.format('MMM Do YY'),
          time: todayDate.format('hh-mm A'),
        },
      })
      .then(() => console.log('Message recieved.'))
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    return error;
  }
};
