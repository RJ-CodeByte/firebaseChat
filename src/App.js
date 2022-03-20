import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import RootNavigator from '../src/router';
import {Provider as PaperProvider} from 'react-native-paper';
class App extends React.Component {
  render() {
    return (
      <PaperProvider>
        <RootNavigator />
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({});

export default App;
