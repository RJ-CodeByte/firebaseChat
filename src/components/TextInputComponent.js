import {TextInput, StyleSheet, View} from 'react-native';
import React, {Component} from 'react';

export default class TextInputComponent extends Component {
  render() {
    const {placeholder, updateFields, inputref, onSubmitEditing,keyType,blurOnSubmit} = this.props;
    return (
      <View style={[styles.mainCantainer, {backgroundColor: '#ccc'}]}>
        <TextInput
          style={[styles.textInput, {fontSize: 17}]}
          placeholder={placeholder}
          ref={inputref}
          returnKeyType={keyType}
          placeholderTextColor="#000"
          onChangeText={text => updateFields(text)}
          onSubmitEditing={onSubmitEditing}
          secureTextEntry={placeholder == 'Enter Password' ? true : false}
          blurOnSubmit={blurOnSubmit}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainCantainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    height: 50,
    marginBottom: 10,
    width: '85%',
  },
  textInput: {
    paddingHorizontal: 10,
    width: '90%',
    paddingVertical: 0,
    color: '#000',
  },
});
