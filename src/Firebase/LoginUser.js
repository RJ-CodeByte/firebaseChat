import auth from '@react-native-firebase/auth';

export const LoginUser = async (email, password) => {
  try {
    return await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    return error;
  }
};
