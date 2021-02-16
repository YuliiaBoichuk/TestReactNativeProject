import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Image,Dimensions } from "react-native";
import { Router, Switch, Link, Route, MarqueeText, GVE_Carousel, Markdown, GVE_ImagePicker } from '../../Routing';
import {  TextI18n, Loading, Button, GVE_Icon as Icon, GVE_Input } from '../../components/common/index';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import { getConfigItem } from '../../Services/configService';
import { connect } from 'react-redux';
import {authUserSelector} from "../../Services/authService";
import {SmallHeader} from "../../components/common/index";
import i18n from 'i18next';
import EStyleSheet from 'react-native-extended-stylesheet';
import {showModal} from "../../Services/modalService";
import {ScopeType} from "../../constants/postTypes.enums";
import {post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {selectRole} from "../../redux/actions/auth";


const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


class CreateAllianceTimeLinePost extends Component {
  constructor(props){
    super(props);
    this.state = {
      form:{
        Text: "",
        Location: "",
        MediaObject: {
          Name: "",
          Description: "",
          ContentUrl: "",
          Caption: "",
          Image: "",
          MediaObjectType: null,
        }
      },
        orgId:''
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
      const {id }= getParams(this.props);
      this.setState({orgId: id});
  }
  screenLoad() {
    const {id, type }= getParams(this.props);
    const role = this.props.roles.find(item => {
      return item ==`${id}-alliance:admin` || item == `${id}-alliance:proMember`
    })
    this.props.setAdministrationRole(role)
    // this.setState({form: {...this.state.form,OrganizerId: id, TypeOrganizer: type}});
  }
  screenBlur() {
    const role = this.props.roles.find(item => {
      return item.indexOf('-') < 0;
    })
    this.setState({leaveScreen: true});
    this.props.setAdministrationRole(role)
  }
  onChange(fieldName, value){
    this.setState({form: {...this.state.form,[fieldName]: value}});
  }
  onImageUpload(urlArray){
    console.log(urlArray)
    this.setState({form: {...this.state.form,
      MediaObject: {...this.state.form.MediaObject,MediaObjectType:3, Image: urlArray.uri}}})
  }
  onVideoUpload(urlArray){
    console.log(urlArray)
    this.setState({form: {...this.state.form,
      MediaObject: {...this.state.form.MediaObject,MediaObjectType:2,ContentUrl:urlArray.uri, Image: urlArray.thumbnailUri}}})
  }
  createPost(){
    if(!this.state.form.Text){
      return;
    }
    const objToSend = {...this.state.form};
    if(!objToSend.MediaObject.Image && !objToSend.MediaObject.ContentUrl){
      delete objToSend.MediaObject
    }
    post(`/alliance/${this.state.orgId}/timeline/post`, objToSend)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        showModal('alert', {
          message: 'COMMON.SUCCESS',
          onOkAction: () => {this.setState({form:{
            Text: "",
            Location: "",
            MediaObject: {
              Name: "",
              Description: "",
              ContentUrl: "",
              Caption: "",
              Image: "",
              MediaObjectType: null,
            }}})
            goBack(this.props)}
        })
      })
      .catch(error => {
        showModal('alert', {
          message: 'COMMON.ERROR'
        })
      })
  }

  render() {
    return (
      <View style={styles.container}>
        <SmallHeader
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={{width:'5%'}} onPress={() => goBack(this.props)} >
                <Icon
                  name='back'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                />
              </TouchableOpacity>
              <View style={[{width: '95%'}, styles.headerTextWrap]}>
                <TextI18n style={styles.headerText} textKey="CREATEPOST.TITLE"/>
              </View>
            </View>
          }
        />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.contentInner}>
            <GVE_Input
              style={styles.input}
              placeholder="CREATEPOST.TEXT"
              //title="CREATEPOST.NAME"
              label="Text"
              name='Text'
              value={this.state.form.Text}
              returnKeyType="next"
              onChange={Text => this.onChange('Text', Text)}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            {!this.state.form.Text?
                <TextI18n textKey="CREATEPOST.REQUIRED" style={styles.required} /> : null}
            <TextI18n textKey="TIMELINE.CHOOSEUPLOAD" style={styles.text}/>
            <GVE_ImagePicker
              style={styles.imagePicker}
              containerStyle={styles.imagePickerContainer}
              styles={styles.imagePickerButton}
              iconStyle={styles.imagePickerIconStyle}
              iconName={"add-image"}
              iconSize={26}
              title='COMMON.ADD_PHOTO'
              titleColor={EStyleSheet.value('$mainColor')}
              rounded
              hidePlayIcon={false}
              imageUrl={this.state.form.MediaObject.MediaObjectType==3 && this.state.form.MediaObject.Image}
              accept=".jpg,.jpeg,.png"
              isImageAutoPublish={true}
              onStartUpload={() => this.setState({isPreloader: true})}
              onError={() => this.setState({isPreloader: false})}
              onSuccess={(data)=>{this.onImageUpload(data)}}
            />
             <TextI18n textKey="TIMELINE.OR" style={styles.text}/>
            <GVE_ImagePicker
              style={styles.imagePicker}
              containerStyle={styles.imagePickerContainer}
              styles={styles.imagePickerButton}
              iconStyle={styles.imagePickerIconStyle}
              iconName={"add-image"}
              iconSize={26}
              title='COMMON.ADD_MEDIA_FILE'
              titleColor={EStyleSheet.value('$mainColor')}
              rounded
              hidePlayIcon={false}
              imageUrl={this.state.form.MediaObject.MediaObjectType==2 && this.state.form.MediaObject.Image}
              mediaObjectType="2"
              accept=".mp4"
              isQuestUpload={true}
              onStartUpload={() => this.setState({isPreloader: true})}
              onError={() => this.setState({isPreloader: false})}
              onSuccess={(data)=>{this.onVideoUpload(data)}}
            />
            <Button
              style={styles.button}
              title='COMMON.ACCEPT'
              disabled={!this.state.form.Text}
              titleColor={EStyleSheet.value('$btnText')}
              onPress={() => this.createPost()}
            />
          </View>
        </ScrollView>
      </View>
    )
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.auth.role,
});

const bindActions = dispatch => ({
  setAdministrationRole: (role) => dispatch(selectRole(role))
});

export default connect(mapStateToProps, bindActions)(CreateAllianceTimeLinePost);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$genBackgroundColor',
  },
  headerTextWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  headerText: {
    color: '$headerText',
    fontSize: font.sizeHeader,
  },
  content: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInner: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
  },
  input: {
    width: '100%',
  },
  imagePicker: {
    display: 'flex',
    marginVertical: 20
  },
  imagePickerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePickerButton: {
    backgroundColor: 'transparent',
    width: 'auto',
  },
  imagePickerIconStyle: {
    borderWidth: 0,
    width: 45,
    height: 45,
  },
  button: {
    width: '100%',
    alignSelf: 'flex-end',
    //marginTop: 'auto',
    marginBottom: 20,
  },
  text:{
      fontSize: 24,
  },
  required:{
    color: 'red',
    alignSelf:'flex-start'
  }
});
