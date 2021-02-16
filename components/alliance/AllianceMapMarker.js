import React, { Component } from 'react';
import { View, StyleSheet,  Text, Image, TouchableOpacity } from 'react-native';
import { getConfigItem } from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceMapMarker extends Component {
  constructor(props){
    super(props);
  }


  render(){
    return (
      <View style={styles.container}>
        <View style={styles.circle}>
          { this.props.image ?
          <FastImage
              style={styles.markerImage}
              source={{ uri: this.props.image}}
              resizeMode={FastImage.resizeMode.cover}
          /> : null }
        </View>
        <View style={styles.triangle}/>
      </View>
    )
  }
}

export default AllianceMapMarker;

const styles = EStyleSheet.create({
  container:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle:{
    width:50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '$mainColor',
  },
  triangle: {
    marginTop: -1,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '$mainColor',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  markerImage:{
    width:44,
    height: 44,
    borderRadius: 22,
  }
});
