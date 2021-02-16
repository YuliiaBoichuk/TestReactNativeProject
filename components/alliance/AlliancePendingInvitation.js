import React, {Component} from 'react';
import {navigateTo} from '../../Services/navigationService';
import {View, Text, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback} from 'react-native';
import {getConfigItem} from "../../Services/configService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {GVE_Icon as Icon, Loading, SmallHeader, TextI18n} from "../../components/common/index";
import {AllRoles} from "../../constants/allRoles.enum";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

const AlliancePendingInvitation = ({data, approveJoin, rejectJoin}) => {
  const onNavigate = (data) =>{
    navigateTo('person', {})
  }

  const approveJoinRequest = () => {
    approveJoin(data.id)
  }
  const rejectJoinRequest =() => {
    rejectJoin(data.id)
  }
  
  
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onNavigate(data)}
    >
      <View style={styles.imageContainer}>
        {data.image?
            <FastImage
                style={styles.image}
                source={{ uri: data.image}}
                resizeMode={FastImage.resizeMode.cover}
            />:
            <Image
                resizeMethod="resize"
                source={require('../../assets/images/avatar_default.png')}
                style={styles.image}
            />
        }
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.titleWrap}>
        <Text style={styles.title}>{data.name || "Manager"}</Text>
          <View style={[styles.roleBar]}>
            <TextI18n style={styles.roleBarText} textKey={data.role == AllRoles.Artist ? "ROLES.ARTIST" :
                data.role == AllRoles.Manager ? "ROLES.MANAGER" : data.role == AllRoles.SingingCoach ? "ROLES.SINGINGCOACH" : data.role == AllRoles.AssistantManager ? "ROLES.ASSISTANTMANAGER" :
                    data.role == AllRoles.Choreographer ? "ROLES.CHOREOGRAPHER" : data.role == AllRoles.Admin ? "ROLES.ADMIN" : ''}>
            </TextI18n>
          </View>
        </View>
      </View>
      <View style={styles.buttonWrap}>
        <TouchableOpacity style={styles.buttonApprove} onPress={() => approveJoinRequest()}>
            <TextI18n textKey={'ALLIANCE.APPROVE'}
                         style={{color: EStyleSheet.value('$btnOkColor')}}></TextI18n>
        </TouchableOpacity>
        <TouchableOpacity  style={styles.buttonDelete}  onPress={() => rejectJoinRequest()}>
          <Icon
              name='trash'
              size={30}
              color={EStyleSheet.value('$borderofIcons')}
          /></TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
};

export default AlliancePendingInvitation;

const styles = EStyleSheet.create({
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    height: 80,
    marginTop: 5,
    paddingHorizontal: 0,
    marginLeft: 20
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
  },
  titleWrap: {
    width: '58%',
  },
  title: {
    fontSize: font.sizeH2,
    color: '$textColor',
    paddingBottom: 2,
  },
  roleBar: {
    backgroundColor: '$mainColor',
    borderRadius: 10,
    alignItems: 'center',
    width: 110
  },
  roleBarText: {
    color: '$genBackgroundColor',
    textTransform: 'uppercase',
    fontSize: font.sizeS,
    textAlign: 'center'
  },
  mainContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10
  },
  buttonWrap: {
    width: '42%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonApprove: {
    backgroundColor: '$mainColor',
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonDelete:{
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 5,
    borderColor: '$borderofIcons'
  }
});
