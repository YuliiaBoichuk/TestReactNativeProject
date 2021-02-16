import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, AsyncStorage, Text } from 'react-native';
import {GVE_Header, GVE_Icon, SmallHeader, TextI18n} from '../../components/common/index';
import { GVE_Icon as Icon } from '../../components/common/index';
import {goBack, navigateTo} from '../../Services/navigationService';
import {API_URL, getWithParams, post} from '../../redux/actions/http-request';
import { checkHttpStatus, parseJSON } from "../../utils/index";
import { getConfigItem } from '../../Services/configService';
import FollowerList from "../../components/common/FollowerList";
import EStyleSheet from 'react-native-extended-stylesheet';
import {connect} from "react-redux";
import { updateFollowCount } from "../../redux/actions/auth";
import {showModal} from "../../Services/modalService";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AdminListOfInactiveExperts extends Component {
  constructor(){
    super();
    this.state = {
      data:[]
    }
  }
  
  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this));
  }
  screenLoad(){
    this.getListOfUsers();
  }
  getListOfUsers(){
    getWithParams('/account/listWaitForActivePerson')
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((data) => {
        console.log(data)
        data.map((user) => {
          if(!user.alternateName) {
            user.alternateName = user.givenName
          }
        })
        this.setState({data: data})
      })
      .catch((error) => {
        console.error(error)
      })
  }
  activateExpert(id){
    showModal('modalWithInput', {
      onOkAction: (text) => {
        post(`/account/sendDetailsByProfile`, {personId:id, password: text})
          .then(checkHttpStatus)
          .then(parseJSON)
          .then((data) => {
            console.log(data)
            this.getListOfUsers();
          })
          .catch((error) => {
            console.error(error)
          })
      },
      onCancelAction: (text) => {post(`/account/sendDetailsByProfile`, {personId:id, password: null})
        .then(checkHttpStatus)
        .then(parseJSON)
        .then((data) => {
          console.log(data)
          this.getListOfUsers();
        })
        .catch((error) => {
          console.error(error)
        })},
      title: 'ADMINISTRATING_EXPERTS.ENTERPASSWORD',
      message: 'ADMINISTRATING_EXPERTS.PASSWORDNOTREQUIRED',
      inputPlaceholder: 'COMMON.PLACEHOLDERS.PASSWORD',
      inputTitle: 'COMMON.PLACEHOLDERS.PASSWORD',
      text: ''
    })
    
    
    

  }

  render(){
    return (
      <View style={styles.container}>
        <SmallHeader
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={{marginRight:5}} onPress={() => goBack(this.props)} >
                <Icon
                  name='back'
                  size={25}
                  color={'#000'}
                /></TouchableOpacity>
            </View>
          }
          centerComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextI18n textKey={'ADMINISTRATING_EXPERTS.HEADER'} style={styles.headerText} />
            </View>
          }
          rightComponent={
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => navigateTo('adminRegisterUser')} style={[styles.menu]}>
                  <Icon
                    name="plus"
                    color="#000"
                    size={25}
                  />
                </TouchableOpacity>
            </View>
          }
        />
        <ScrollView>
          <FollowerList
            removeIndexes={true}
            navigation={this.props.navigation}
            data={this.state.data}
            activateExpert={(id) => {this.activateExpert(id)}}
            isForAdministratingExperts={true}
            follower={
              <View style={{flexDirection: 'row'}}>
                <Icon
                  name="star-filled"
                  active
                />
              </View>
            }
          />
        </ScrollView>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
});

export default connect(null, mapDispatchToProps)(AdminListOfInactiveExperts);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: color.listCardColor,
  },
  headerText:{
    fontSize: font.sizeH1,
    color: '$headerText',
    marginBottom: 5,
    textAlign: 'center',
  },
  menu: {
    right: 10,
    width: 30,
    height: 30,
    // paddingLeft: 5,
    alignItems: 'flex-end'
  },
});
