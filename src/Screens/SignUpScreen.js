import {Text, StyleSheet, View} from 'react-native';
import React, {Component} from 'react';
import TextInputComponent from '../components/TextInputComponent';
import ButtonComponent from '../components/ButtonComponent';
import {SignUpUser} from '../Firebase/SignUp';
import {AddUser} from '../Firebase/Users';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-spinkit';

export default class SignUp extends Component {
  state = {
    name: '',
    email: '',
    password: '',
    loader: false,
  };

  SignUpToFirebase =async () => {
    this.setState({loader: true});
    SignUpUser(this.state.email, this.state.password)
      .then(async res => {
        console.log('res', res);
        var userUid = auth().currentUser.uid;
        AddUser(this.state.name, this.state.email, '', userUid)
          .then(async () => {
            this.setState({loader: false});
            await AsyncStorage.setItem('UID', userUid);
            this.props.navigation.navigate('Dashboard');
          })
          .catch(err => {
            this.setState({loader: false});
            alert(err);
          });
        console.log(userUid);
      })
      .catch(err => {
        this.setState({loader: false});
        alert(err);
      });
  };

  render() {
    return (
      <View style={styles.body}>
        <TextInputComponent
          placeholder="Enter Name"
          updateFields={text => this.setState({name: text})}
        />
        <TextInputComponent
          placeholder="Enter Email"
          updateFields={text => this.setState({email: text})}
        />
        <TextInputComponent
          placeholder="Enter Password"
          updateFields={text => this.setState({password: text})}
        />
        <ButtonComponent
          title="Sign Up"
          onPress={() => {
            this.SignUpToFirebase();
          }}
        />
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
