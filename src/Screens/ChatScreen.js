import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Image,
  PermissionsAndroid,
  ImageBackground,
} from 'react-native';
import React, {Component} from 'react';
import database from '@react-native-firebase/database';
import Spinner from 'react-native-spinkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../components/AppHeader';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {SenderMessage, RecieverMessage} from '../Firebase/Message';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImgToBase64 from 'react-native-image-base64';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {
  FAB,
  Portal,
  Provider,
  Card,
  Title,
  Paragraph,
  Button,
} from 'react-native-paper';
import RNLocation from 'react-native-location';
import storage from '@react-native-firebase/storage';
import FileViewer from 'react-native-file-viewer';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';

export default class ChatScreen extends Component {
  state = {
    message: '',
    guestUid: '',
    currentUid: '',
    allMessages: [],
    height: 40,
    fileName: '',
    fileType: '',
    viewLocation: {},
    inputGrow: 60,
    open: false,
  };

  async componentDidMount() {
    const currentUid = await AsyncStorage.getItem('UID');
    const guestUid = this.props.navigation.getParam('guestUid');
    this.setState({currentUid: currentUid, guestUid: guestUid});
    try {
      database()
        .ref('messages')
        .child(currentUid)
        .child(guestUid)
        .on('value', datasnapshot => {
          let message = [];
          datasnapshot.forEach(data => {
            message.push({
              sendBy: data.val().message.sender,
              recieveBy: data.val().message.reciever,
              msg: data.val().message.msg,
              image: data.val().message.image,
              file: data.val().message.file,
              filename: data.val().message.filename,
              currentLocation: data.val().message.currentLocation,
              date: data.val().message.date,
              time: data.val().message.time,
            });
          });
          this.setState({allMessages: message.reverse()});

          console.log('allMessages', this.state.allMessages);
        });
    } catch (error) {
      alert(error);
    }
  }

  openGallery() {
    launchImageLibrary('photo', response => {
      const res = response.assets.map(function (item) {
        return item.uri;
      });
      this.setState({loader: true});
      ImgToBase64.getBase64String(res.toString())
        .then(async base64String => {
          let source = 'data:image/jpeg;base64,' + base64String;
          SenderMessage(
            this.state.currentUid,
            this.state.guestUid,
            '',
            source,
            '',
            '',
            '',
          )
            .then(() => {
              this.setState({loader: false});
            })
            .catch(err => alert(err));

          RecieverMessage(
            this.state.currentUid,
            this.state.guestUid,
            '',
            source,
            '',
            '',
            '',
          )
            .then(() => {
              this.setState({loader: false});
            })
            .catch(err => alert(err));
        })
        .catch(err => {
          this.setState({loader: false});
        });
    });
  }

  async openFile() {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('Res' + JSON.stringify(res));
      const fileName = res.map(function (item) {
        return item.name;
      });

      const filetype = res.map(function (item) {
        return item.type;
      });
      this.setState({fileType: filetype});

      const fileUri = res.map(function (item) {
        return item.uri;
      });

      this.setState({loader: true});
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ).then(async granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const stat = await RNFetchBlob.fs.stat(fileUri.toString());
          console.log('stat', stat.path);
          await storage().ref(fileName.toString()).putFile(stat.path);
          const url = await storage()
            .ref(fileName.toString())
            .getDownloadURL()
            .then(url => {
              SenderMessage(
                this.state.currentUid,
                this.state.guestUid,
                '',
                '',
                url,
                fileName,
                '',
              )
                .then(res => {
                  this.setState({loader: false});
                })
                .catch(err => alert(err));

              RecieverMessage(
                this.state.currentUid,
                this.state.guestUid,
                '',
                '',
                url,
                fileName,
                '',
              )
                .then(() => {
                  this.setState({loader: false});
                })
                .catch(err => alert(err));
            });
          console.log(url);

          this.setState({loader: false});
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async downloadFile(GetData) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ).then(async granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Fname:' + this.state.fileName.toString()),
          // console.log('Ftype:' + this.state.fileType.toString());
          // // const localFile = `${RNFS.DownloadDirectoryPath}/${this.state.filename}`;
          // // const options = {
          // //   fromUrl: GetData,
          // //   toFile: localFile,
          // // };
          // // RNFS.downloadFile(options).promise.then(async () => {
          // //   await FileViewer.open(localFile);
          // // });
          RNFetchBlob.config({
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true, // <-- this is the only thing required
              // Optional, override notification setting (default to true)
              // the url does not contains a file extension, by default the mime type will be text/plain
              mime: 'application/octet-stream',
              title: this.state.fileName.toString(),
              description: 'File downloaded by download manager.',
              path: `${
                RNFS.DownloadDirectoryPath
              }/${this.state.fileName.toString()}`,
              mediaScannable: true,
              notification: true,
              // Optional, but recommended since android DownloadManager will fail when
            },
          })
            .fetch('GET', GetData)
            .then(res => {
              console.log(res.path());
              FileViewer.open(res.path());
            });
      }
    });
  }

  async sendLocation() {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then(async granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(data => {
          this.setState({viewLocation: data});

          console.log('location', data);
          console.log('latitude', data.coords.latitude);
          console.log('latitude', data.coords.longitude);
          SenderMessage(
            this.state.currentUid,
            this.state.guestUid,
            '',
            '',
            '',
            '',
            data.coords,
          )
            .then(() => {
              this.setState({loader: false});
            })
            .catch(err => alert(err));

          RecieverMessage(
            this.state.currentUid,
            this.state.guestUid,
            '',
            '',
            '',
            '',
            data.coords,
          )
            .then(() => {
              this.setState({loader: false});
            })
            .catch(err => alert(err));
          // this.setState({latitude: data.coords.latitude});
          // this.setState({longitude: data.coords.longitude});
        });
      }
    });
  }

  sendMessage = async () => {
    if (this.state.message) {
      SenderMessage(
        this.state.currentUid,
        this.state.guestUid,
        this.state.message,
        '',
        '',
        '',
        '',
      )
        .then(() => {
          this.setState({message: ''});
        })
        .catch(err => alert(err));

      RecieverMessage(
        this.state.currentUid,
        this.state.guestUid,
        this.state.message,
        '',
        '',
        '',
        '',
      )
        .then(() => {
          this.setState({message: ''});
        })
        .catch(err => alert(err));
    }
  };

  render() {
    return (
      <Provider>
        <Portal>
          <View
            style={{
              flex: 1,
              backgroundColor: '#353b48',
            }}>
            <AppHeader
              title={this.props.navigation.getParam('UserName')}
              navigation={this.props.navigation}
              onPress={() => this.logOut()}
            />
            <FlatList
              inverted
              style={{marginBottom: this.state.inputGrow}}
              data={this.state.allMessages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item}) => (
                <View
                  style={{
                    maxWidth: Dimensions.get('window').width / 2 + 10,
                    alignSelf:
                      this.state.currentUid === item.sendBy
                        ? 'flex-end'
                        : 'flex-start',
                    marginTop: 2,
                    paddingVertical: 5,
                    marginHorizontal: 5,
                  }}>
                  <View>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        bottom: 0,
                        paddingHorizontal: 10,
                      }}>
                      {item.date}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderRadius: 20,
                      backgroundColor:
                        this.state.currentUid === item.sendBy
                          ? '#248A52'
                          : '#218c74',
                    }}>
                    {item.image === '' &&
                    item.file === '' &&
                    item.currentLocation === '' ? (
                      <Text
                        style={{
                          color: '#fff',
                          padding: 10,
                          fontSize: 16,
                          fontWeight: '400',
                        }}>
                        {/* {JSON.stringify(item.currentLocation.latitude)} */}
                        {item.msg} {'  '}{' '}
                        {/* {item.file !== '' && item.filename + '   '} */}
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 12,
                            bottom: 0,
                            paddingHorizontal: 10,
                          }}>
                          {item.time}
                        </Text>
                      </Text>
                    ) : item.file !== '' ? (
                      <View
                        style={{
                          margin: 10,
                          backgroundColor: '#075E54',
                          borderRadius: 10,
                        }}>
                        <View
                          style={{
                            width: 300,
                            margin: 10,
                            flexDirection: 'row',
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: '#fff',
                              width: 100,
                              fontSize: 16,
                              fontWeight: '400',
                            }}>
                            {item.filename + '   '}
                          </Text>
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 20,
                              top: 0,
                              bottom: 0,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              console.log('File Ex:- ' + item.file.toString());
                              this.setState({fileName: item.filename});
                              this.downloadFile(item.file.toString());
                            }}>
                            <FontAwesome5
                              name="arrow-alt-circle-down"
                              size={21}
                              color="grey"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : item.image != '' ? (
                      <View>
                        <Image
                          source={{
                            uri: item.image,
                          }}
                          style={styles.imageStyle}
                        />
                        <Text
                          style={{
                            color: '#fff',
                            position: 'absolute',
                            alignSelf: 'flex-end',
                            bottom: 5,
                            paddingHorizontal: 10,
                            fontSize: 12,
                          }}>
                          {item.time}
                          {'  '}{' '}
                        </Text>
                      </View>
                    ) : (
                      <Card style={{width: '100%'}}>
                        <ImageBackground resizeMode="cover">
                          <MapView
                            style={{width: 220, height: 200}}
                            initialRegion={{
                              latitude: item.currentLocation.latitude,
                              longitude: item.currentLocation.longitude,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421,
                            }}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                          />
                        </ImageBackground>
                        <Text
                          style={{
                            color: '#000',
                            position: 'absolute',
                            alignSelf: 'flex-end',
                            bottom: 5,
                            paddingHorizontal: 10,
                            fontSize: 12,
                          }}>
                          {item.time}
                          {'  '}{' '}
                        </Text>
                      </Card>
                      // <Text
                      //   style={{
                      //     color: '#fff',
                      //     padding: 10,
                      //     fontSize: 16,
                      //     fontWeight: '400',
                      //   }}>
                      //   {JSON.stringify(item.currentLocation.latitude)}
                      //   {'  '}
                      //   {JSON.stringify(item.currentLocation.longitude)}
                      // </Text>
                    )}
                  </View>
                </View>
              )}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                height: 40,
                width: '100%',
                flexDirection: 'row',
                margin: 10,
              }}>
              {/* <TouchableOpacity
                style={{width: '10%', marginLeft: 10, justifyContent: 'center'}}
                onPress={() => this.openGallery()}>
                <FontAwesome5 name="camera" size={30} color="#fff" />
              </TouchableOpacity> */}
              <View
                style={{
                  width: '75%',
                  justifyContent: 'center',
                  marginLeft: 10,
                }}>
                <TextInput
                  placeholder="Enter Message"
                  multiline
                  placeholderTextColor="#000"
                  ref={input => {
                    this.textInput = input;
                  }}
                  editable={true}
                  onChangeText={text => {
                    this.setState({message: text});
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    height: Math.max(35, this.state.height),
                    width: 260,
                    borderRadius: 20,
                    backgroundColor: '#ccc',
                  }}
                  onContentSizeChange={e => {
                    this.setState({height: e.nativeEvent.contentSize.height});
                  }}
                />
                <FAB.Group
                  open={this.state.open}
                  theme={{
                    colors: {backdrop: 'transparent'},
                  }}
                  style={this.state.open && {position: 'absolute', left: 25}}
                  icon={'pin'}
                  actions={[
                    {
                      icon: 'file',
                      onPress: () => this.openFile(),
                      style: {
                        left: 10,
                        bottom: 0,
                        marginBottom: 5,
                        backgroundColor: 'green',
                      },
                      small: true,
                    },
                    {
                      icon: 'camera-image',
                      onPress: () => this.openGallery(),
                      style: {
                        left: 10,
                        bottom: 0,
                        marginBottom: 5,
                        backgroundColor: 'green',
                      },
                      small: true,
                    },
                    {
                      icon: 'map-marker',
                      onPress: () => this.sendLocation(),
                      style: {
                        left: 10,
                        bottom: 0,
                        marginBottom: 5,
                        backgroundColor: 'green',
                      },
                      small: true,
                    },
                  ]}
                  fabStyle={{
                    height: 30,
                    width: 30,
                    backgroundColor: 'green',
                    elevation: 2,
                    position: 'relative',
                    top: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onStateChange={({open}) => this.setState({open: open})}
                  onPress={() => {
                    if (this.state.open) {
                      // do something if the speed dial is open
                    }
                  }}
                />
                {/* <TouchableOpacity
              style={{position: 'absolute', right: 10, padding: 10}}
              onPress={() => this.openFile()}>
              <FontAwesome5 name="file" size={30} color="#000" />
            </TouchableOpacity> */}
              </View>
              <TouchableOpacity
                style={{
                  width: '10%',
                  marginLeft: 10,
                  justifyContent: 'center',
                  backgroundColor: 'green',
                  borderRadius: 20,
                }}
                onPress={() => {
                  this.sendMessage();
                  this.textInput.clear();
                }}>
                <FontAwesome5
                  style={{position: 'absolute', justifyContent: 'center'}}
                  name="paper-plane"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            {this.state.loader && (
              <View style={styles.loading}>
                <Spinner type="Wave" size={50} color="#ffd302" />
              </View>
            )}
          </View>
        </Portal>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
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
  imageStyle: {
    height: 150,
    width: Dimensions.get('window').width / 2 + 10,
    resizeMode: 'stretch',
    alignItems: 'center',
    borderRadius: 20,
  },
});
