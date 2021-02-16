import React, {Component} from 'react';
import {navigateTo} from '../../Services/navigationService';
import {View, Text, TouchableOpacity, Dimensions, Image} from 'react-native';
import {getConfigItem} from "../../Services/configService";
import {TextI18n, Button, GVE_Icon as Icon} from "../common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import {AllRoles} from "../../constants/allRoles.enum";
import {API_URL, getWithParams, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils";
import {updateFollowCount} from "../../redux/actions/auth";
import {connect} from "react-redux";
import {showModal} from "../../Services/modalService";
import {AllianceRoles} from "../../constants/allianceRoles.enum";
import FastImage from "react-native-fast-image";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const window = Dimensions.get('window');
const AllianceAdministratingMemberCard = ({data,founderId,ownId, deleteUser, changeRoleFunction}) => {

  const roles = [];
  const rolesNames = [];
  const rolesIds = [];
  for (const key in AllianceRoles) {
    roles.push({key: key, value: AllianceRoles[key]})
    rolesNames[AllianceRoles[key]] = key;
    rolesIds[key] = AllianceRoles[key];
  }
  
  const onNavigate = (id) => {
    navigateTo('person', {outerUserId:id})
  }
  const deleteUserFromAlliance = () => {
    deleteUser(data.id);
  }

  const updateFollowStatus = (id, followStatus) => {
    const updateData = [...this.state.data];
    const index = updateData.findIndex((data) => {
      return data.id == id
    })
    if (index > -1) {
      updateData[index].isFollow = followStatus;
    }
  }
  const getRolesList = (id) =>{
    let rList = [];
    if (roles) {
      roles.map((item, index) => {
        if(founderId == ownId && item.key == 'OWNER'){
          rList.push(item.key);
        } else if(item.key == 'ADMIN' && data.allianceRole != AllianceRoles.ADMIN && data.allianceRole != AllianceRoles.OWNER){
          rList.push(item.key);
        } else if(item.key == 'PROMEMBER' || item.key== 'MEMBER'){
          rList.push(item.key);
        }
        
      });
    }
    return rList;
  }
  const openRoleSelect = (id) => {
    return showModal('pickerModal', {
          title:"PROFILE.FIELDS.ROLE",
          gradientShow:false,
          onOkAction: (data) => {
              console.log(data, rolesIds)
              changeRoleFunction(id, rolesIds[data])},
          selectedValue: rolesNames[data.allianceRole],
          pickerData: getRolesList(id),
          style:{
            height: 380,
            borderBottomWidth: 1,
            borderBottomColor: EStyleSheet.value('$mainColor'),
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            top: (window.height/2)-(380/2),
            marginBottom: 'auto'
            
          }
        })
  }
  
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onNavigate(data.id)}
    >
      <View style={styles.logoWrap}>
        {data.image?
            <FastImage
                style={styles.logo}
                source={{ uri: data.image}}
                resizeMode={FastImage.resizeMode.cover}
            />:
            <Image
                resizeMethod="resize"
                source={require('../../assets/images/avatar_default.png')}
                style={styles.logo}
            />
        }
      </View>
      <View style={styles.infoContent}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title]} numberOfLines={1}>{data.alternateName}</Text>
          <View style={[styles.roleBar]}>
            <TextI18n style={styles.roleBarText} textKey={data.role == AllRoles.Artist ? "ROLES.ARTIST" :
              data.role == AllRoles.Manager ? "ROLES.MANAGER" : data.role == AllRoles.SingingCoach ? "ROLES.SINGINGCOACH" : data.role == AllRoles.AssistantManager ? "ROLES.ASSISTANTMANAGER" :
                data.role == AllRoles.Choreographer ? "ROLES.CHOREOGRAPHER" : data.role == AllRoles.Admin ? "ROLES.ADMIN" : ''}>
            </TextI18n>
            <TextI18n style={styles.roleBarText} textKey={"ALLIANCE.ROLES."+ (data.id == founderId ? rolesNames[1]: rolesNames[data.allianceRole])}/>
          </View>
          {/*<TextI18n textKey={'PERSONSCREEN.EXPPOINTS'} keys={{experiencePoints: data.experiencePoints}}/>*/}
          <Text>{data.level && data.level.name}</Text>
        </View>
        <View style={styles.buttonWrap}>
          {data.id != founderId &&(data.allianceRole == AllianceRoles.ADMIN && founderId == ownId) || data.allianceRole == AllianceRoles.MEMBER || data.allianceRole == AllianceRoles.PROMEMBER?
          <Button title={"ALLIANCE.CHANGEROLE"} onPress={() => openRoleSelect(data.id)}/>: null}
          {data.id != founderId ?
          <TouchableOpacity  style={styles.buttonDelete} onPress={() => deleteUserFromAlliance(data.id)}>
            <Icon
                name='trash'
                size={30}
                color={EStyleSheet.value('$borderofIcons')}
            /></TouchableOpacity>: null}
        </View>
      </View>
      
    
    </TouchableOpacity>
  )
};

export default AllianceAdministratingMemberCard;

const styles = EStyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    width: '100%',
    height: 80,
    marginTop: 10,
    paddingHorizontal: 0,
    marginLeft: 10
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    justifyContent: 'space-between',
    width: '75%',
  },
  titleWrap: {
    width: '55%',
  },
  title: {
    fontSize: font.sizeH2,
    color: '$textColor',
    paddingBottom: 2,
  },
  buttonWrap: {
    width: '45%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFollow: {
    backgroundColor: '$mainColor',
    paddingHorizontal: 17,
    paddingVertical: 6,
    borderRadius: 10,
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
  buttonDelete:{
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 5,
    borderColor: '$borderofIcons'
  }
});
