import database from '@react-native-firebase/database';

export const AddUser = async (name, email, image, uid) => {
  try {
    return await database()
      .ref('users/' + uid)
      .set({
        name: name,
        email: email,
        image: image,
        uuid: uid,
      })
      .then(() => console.log('Data set.'))
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    return error;
  }
};

export const UpdateUserImage = async (image, uid) => {
  try {
    return await database()
      .ref('users/' + uid)
      .update({
        image:image
      })
      .then(() => console.log('Data Updated.'))
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    return error;
  }
};
