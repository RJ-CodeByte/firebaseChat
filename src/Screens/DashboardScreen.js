import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {Component} from 'react';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-spinkit';
import AppHeader from '../components/AppHeader';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {UpdateUserImage} from '../Firebase/Users';
import ImgToBase64 from 'react-native-image-base64';

export default class Dashboard extends Component {
  state = {
    allUsers: [],
    loader: false,
    imageUrl: '',
    loggedUser: '',
  };

  async componentDidMount() {
    try {
      this.setState({loader: true});
      await database()
        .ref('users')
        .on('value', datasnapshot => {
          const uuid = auth().currentUser.uid;
          let users = [];
          datasnapshot.forEach(child => {
            if (child.val().uuid === uuid) {
              this.setState({
                loggedUser: child.val().name,
                imageUrl: child.val().image,
              });
            } else {
              users.push({
                userName: child.val().name,
                uuid: child.val().uuid,
                imageUrl: child.val().image,
              });
            }
          });
          this.setState({allUsers: users, loader: false});
        });
    } catch (error) {
      console.log(error);
      this.setState({loader: false});
    }
  }

  logOut = async () => {
    await auth()
      .signOut()
      .then(async () => {
        await AsyncStorage.removeItem('UID');
        this.props.navigation.navigate('Login');
      })
      .catch(err => alert(err));
  };

  openGallery() {
    launchImageLibrary('photo', response => {
      const res = response.assets.map(function (item) {
        return item.uri;
      });
      this.setState({loader: true});
      ImgToBase64.getBase64String(res.toString())
        .then(async base64String => {
          const uid = await AsyncStorage.getItem('UID');
          let source = 'data:image/jpeg;base64,' + base64String;
          UpdateUserImage(source, uid).then(() => {
            this.setState({imageUrl: res.toString(), loader: false});
          });
        })
        .catch(err => {
          this.setState({loader: false});
        });
    });
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000'}}>
        <AppHeader
          title="Messages"
          navigation={this.props.navigation}
          onPress={() => this.logOut()}
        />
        {this.state.loader && (
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Spinner type="ThreeBounce" size={70} color="#ffd302" />
          </View>
        )}
        <FlatList
          alwaysBounceVertical={false}
          data={this.state.allUsers}
          style={{paddingVertical: 20}}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={
            <View
              style={{
                height: 160,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{height: 90, width: 90, borderRadius: 45}}
                onPress={() => {
                  this.openGallery();
                }}>
                <Image
                  source={{
                    uri:
                      this.state.imageUrl === ''
                        ? 'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper.png'
                        : this.state.imageUrl,
                  }}
                  style={{height: 90, width: 90, borderRadius: 45}}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20,
                  marginTop: 10,
                  fontWeight: 'bold',
                }}>
                {this.state.loggedUser}
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                style={{flexDirection: 'row', marginBottom: 20, marginTop: 20}}
                onPress={() =>
                  this.props.navigation.navigate('Chat', {
                    UserName: item.userName,
                    guestUid:item.uuid
                  })
                }>
                <View
                  style={{
                    width: '18%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={{
                      uri:
                        item.imageUrl === ''
                          ? 'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper.png'
                          : item.imageUrl,
                    }}
                    style={{height: 60, width: 60, borderRadius: 30}}
                  />
                </View>
                <View
                  style={{
                    width: '88%',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    marginLeft: 10,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                    {item.userName}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={{borderWidth: 1, borderColor: '#fff'}} />
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
