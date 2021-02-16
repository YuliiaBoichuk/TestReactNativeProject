import React, {Component} from 'react';
import {navigateTo} from '../../Services/navigationService';
import {View, Text, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback} from 'react-native';
import GVE_Icon from "../common/GVE_Icon";
import {getConfigItem} from "../../Services/configService";
import Button from "../common/Button";
import TextI18n from "../common/TextI18n";
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

const AllianceListCard = ({data, onJoinToOrg, onLeaveOrg, onPress, isTransparent}) => {
  let onNavigate = (data) => {
    if (!onPress) {
      navigateTo('company', {id: data.id, companyName: data.name, countMembers: data.countMembers})
    } else {
      onPress(data)
    }
  }

  let joinToAlliance = (data) => {
    onJoinToOrg(data.id)
  }

  let leaveAlliance = (data) => {
    onLeaveOrg(data.id)
  }

  return (
      <TouchableOpacity
          style={[styles.itemContainer, isTransparent? {backgroundColor: 'rgba(0,0,0,0)'}: null]}
          onPress={() => onNavigate(data)}
      >
        {data.image && data.image.length ?
            <FastImage
                style={styles.image}
                source={{uri: data.image}}
                resizeMode={FastImage.resizeMode.cover}
            />
            :
            <Image
                source={require('../../assets/images/EmtyPhoto.png')}
                style={styles.emptyImage}
            />}
        <View style={[styles.mainInfo]}>
          <View style={styles.nameContainer}>
            <Text style={styles.title}>{data.name}</Text>
          </View>
          <View style={styles.subscribersContainer}>
            <TextI18n style={styles.subscribersCount} textKey={'ALLIANCE.SUBSCRIBERS'} keys={{count: data.countMembers}}></TextI18n>
          </View>
        </View>
        <View style={styles.buttonWrap}>
          {{
            0: <Button style={styles.buttons}
                title='ALLIANCE.JOIN'
                onPress={() => joinToAlliance(data)}
            />,
            1: <Button style={styles.buttons}
                title='ALLIANCE.LEAVE'
                onPress={() => leaveAlliance(data)}
            />,
            2: <Button style={styles.buttons}
                title='ALLIANCE.PENDINGINVITE'
            />,
            3: null
          }[[data.inAlliance]]}
        </View>
      </TouchableOpacity>
  )
};

export default AllianceListCard;

const styles = EStyleSheet.create({
  itemContainer: {
    flex:1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 80,
    marginBottom: 20,
    backgroundColor: '$listCardColor',
  },
  image: {
    width: "25%",
    height: 65,
    borderRadius: 12,
    alignContent: 'center',
  },
  mainInfo:{
    width: '40%',
    paddingLeft: 10
  },
  buttonWrap: {
    width: '35%',
  },
  nameContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  title: {
    color: '$textColor',
    fontSize: font.sizeH2
  },
  subscribersContainer:{
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'center',
  },
  subscribersCount:{
    color: '$secondaryTextColor'
  },
  buttons: {
    borderRadius: 15,
    width: 135,
  },
  emptyImage:{
    width: "25%",
    height: 65,
    borderRadius: 12,
    alignContent: 'center',
    backgroundColor: '#F5DADA',
    resizeMode: 'contain',
  }
});
