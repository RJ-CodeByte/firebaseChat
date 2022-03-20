import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {Component} from 'react';
import TextInputComponent from '../components/TextInputComponent';
import ButtonComponent from '../components/ButtonComponent';
import auth from '@react-native-firebase/auth';
import {LoginUser} from '../Firebase/LoginUser';
import Spinner from 'react-native-spinkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Login extends Component {
  constructor(props) {
    super(props);
    // create a ref to store the textInput DOM element
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }

  focusNextField(id) {
    this.inputs[id].focus();
  }

  state = {
    email: '',
    password: '',
    loader: false,
  };

  async componentDidMount() {
    this.setState({loader: true});
    const uid = await AsyncStorage.getItem('UID');
    if (uid) {
      this.props.navigation.navigate('Dashboard');
      this.setState({loader: false});
    }
    this.setState({loader: false});
  }

  LoginToFirebase = async () => {
    this.setState({loader: true});
    LoginUser(this.state.email, this.state.password)
      .then(async res => {
        const uuid = auth().currentUser.uid;
        await AsyncStorage.setItem('UID', uuid);
        console.log('Login Res: ', res);
        this.setState({loader: false});
        this.props.navigation.navigate('Dashboard');
      })
      .catch(err => {
        this.setState({loader: false});
        console.log(err);
      });
  };

  render() {
    return (
      <View style={styles.body}>
        <Image
          source={{
            uri: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png',
          }}
          style={{width: 100, height: 100, marginBottom: 30}}
        />
        <TextInputComponent
          placeholder="Enter Email"
          updateFields={text => this.setState({email: text})}
          keyType="next"
          onSubmitEditing={() => {
            this.focusNextField('two');
          }}
          inputref={input => {
            this.inputs['one'] = input;
          }}
          blurOnSubmit={false}
        />
        <TextInputComponent
          placeholder="Enter Password"
          updateFields={text => this.setState({password: text})}
          keyType="done"
          inputref={input => {
            this.inputs['two'] = input;
          }}
          blurOnSubmit={true}
        />
        <ButtonComponent
          title="Sign In"
          onPress={() => {
            this.LoginToFirebase();
          }}
        />
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('SignUp');
          }}>
          <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
            New User? Click Here
          </Text>
        </TouchableOpacity>
        {this.state.loader && (
          <View style={styles.loading}>
            <Spinner type="Wave" size={50} color="#ffd302" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: '#000009',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
