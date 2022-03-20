import auth from '@react-native-firebase/auth';

export const SignUpUser = async (email, password) => {
  try {
    return await auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    return error;
  }
};
