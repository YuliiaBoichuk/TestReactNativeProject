import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated,Dimensions,ImageBackground } from "react-native";
import { Router, Switch, Link, Route, MarqueeText, GVE_Carousel, Markdown, GVE_ImagePicker } from '../../Routing';
import { GVE_Header, ProductsList, GVE_Link, TextI18n, Loading, Button, GVE_Icon as Icon, GVE_Input } from '../../components/common/index';
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

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


class CreatePostPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      form:{
        OrganizerId: null,
        TypeOrganizer: null,
        ScopeType: null,
        ScopeEntityId: null,
        Name: '',
        Description: '',
        image: ''
      }
    }
    this.scopeTypes = [];
    this.scopeTypesNames = [];
    this.scopeTypesIds = [];
    for (const key in ScopeType) {
      this.scopeTypes.push({key: key, value: ScopeType[key]})
      this.scopeTypesNames[ScopeType[key]] = i18n.t('SCOPETYPES.'+key.toUpperCase());
      this.scopeTypesIds[i18n.t('SCOPETYPES.'+key.toUpperCase())] = ScopeType[key];
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
  }
  screenLoad() {
    const {id, type }= getParams(this.props);
    this.setState({form: {...this.state.form,OrganizerId: id, TypeOrganizer: type}});
  }
  screenBlur() {
  }
  onChange(fieldName, value){
    this.setState({form: {...this.state.form,[fieldName]: value}});

  }
  onImageUpload(urlArray){
    this.setState({form: {...this.state.form, image: urlArray.uri}})
  }
  getscopeTypesList(){
    let scopeTypes = [];
    if (this.scopeTypes) {
      this.scopeTypes.map((item, index) => {
        scopeTypes.push(i18n.t('SCOPETYPES.'+item.key.toUpperCase()));
      });
    }
    return scopeTypes;
  }
  createPost(){
    post('/mediaPost', this.state.form)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        console.log(data);
        navigateTo('company');
      })
      .catch(error => {
        console.log(error)
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
        <View style={styles.content}>
          <View style={styles.contentInner}>
            <GVE_Input
              style={styles.input}
              //title="CREATEPOST.SHARETO"
              rightComponent={<Icon name="arrow-down" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
              autoFocus={false}
              picker onTouchEnd={()=>(
              showModal('pickerModal', {
                title:"CREATEPOST.SHARETO",
                gradientShow:false,
                onOkAction: (data) => this.onChange('ScopeType', this.scopeTypesIds[data]),
                selectedValue: this.state.form.ScopeType ? this.scopeTypesNames[this.state.form.ScopeType] : this.scopeTypesNames['0'],
                pickerData: this.getscopeTypesList(),
                style:{
                  height: 380,
                  borderBottomWidth: 1,
                  borderBottomColor: EStyleSheet.value('$mainColor'),
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  top: (screenHeight/2)-(380/2),
                  marginBottom: 'auto'
                  //backgroundColor: color.secondaryTextColor
                }
              })
            )}
              value={this.state.form.ScopeType ? this.scopeTypesNames[this.state.form.ScopeType] : this.scopeTypesNames['0']}
              placeholder="Role"
            />
            <GVE_Input
              style={styles.input}
              placeholder="CREATEPOST.NAME"
              //title="CREATEPOST.NAME"
              label="Name"
              name='Name'
              value={this.state.form.Name}
              returnKeyType="next"
              onChange={Name => this.onChange('Name', Name)}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <GVE_Input
              style={styles.input}
              placeholder="COMMON.DESCRIPTION"
              //title="COMMON.DESCRIPTION"
              label="Description"
              name='Description'
              value={this.state.form.Description}
              returnKeyType="next"
              onChange={description => this.onChange('Description', description)}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
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
              imageUrl={this.state.form.image}
              accept=".jpg,.jpeg,.png"
              isImageAutoPublish={true}
              onStartUpload={() => this.setState({isPreloader: true})}
              onError={() => this.setState({isPreloader: false})}
              onSuccess={this.onImageUpload.bind(this)}
            />
            <Button
              style={styles.button}
              title='COMMON.ACCEPT'
              titleColor={EStyleSheet.value('$btnText')}
              onPress={() => this.createPost()}
            />
          </View>
        </View>
      </View>
    )
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
});

const bindActions = dispatch => ({
});

export default connect(mapStateToProps, bindActions)(CreatePostPage);

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
    marginVertical: 40
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
  }
});
