import React from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  ActivityIndicator, Image, Keyboard, Picker, TouchableOpacity,
  TextInput, Dimensions, Animated, Platform, ScrollView, NativeModules
} from 'react-native';
import {connect} from 'react-redux';
import {Button, GVE_Input, GVE_Image, TextI18n, GVE_Link, GVE_Icon as Icon} from '../../components/common/index'
import Form from '../../components/common/form-validation/Form';
import {getConfigItem} from "../../Services/configService";
import {goBack, navigateTo} from "../../Services/navigationService";
import { showModal } from "../../Services/modalService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {SmallHeader} from "../../components/common/index";
import {post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {AllRoles} from "../../constants/allRoles.enum";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const window = Dimensions.get('window');
const LOGO_HEIGHT_SMALL = 50;
const LOGO_HEIGHT = 50;
const FORM_WIDTH = window.width - 60;
const WIDTH_INPUT = FORM_WIDTH - 50;

class AdminRegisterUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {
      },
      isValidForm: false,
      userName: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      familyName: '',
      givenName: '',
      birthDate: '',
      role: '0',
      token: '',
      smallForm: false,
      provider: null,
      externalAccessToken: null,
      isScreenVisible: true,
      showInviteCode: false,
    };
    this.logoPath = getConfigItem('LogoPath');
    this.imageHeight = new Animated.Value(LOGO_HEIGHT);
    this.inputs = {};
    this.roles = [];
    this.rolesNames = [];
    this.rolesIds = [];
    const roles = {...AllRoles};
    for (const key in roles) {
      this.roles.push({key: key, value: roles[key]})
      this.rolesNames[roles[key]] = key;
      this.rolesIds[key] = roles[key];
    }
  }
  
  componentWillMount() {
    this.props.navigation.addListener('willFocus', this.screenload.bind(this));
    this.props.navigation.addListener('willBlur', this.screenUnload.bind(this))
    if (Platform.OS == 'ios') {
      this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
      this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
    } else {
      this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
      this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    }
  }
  screenload() {
    this.setState({isScreenVisible: true})
  }
  screenUnload(){
    this.setState({isScreenVisible: false})
  }
  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }
  
  keyboardWillShow = (event) => {
    Animated.parallel([
      Animated.timing(this.imageHeight, {duration: event.duration, toValue: LOGO_HEIGHT_SMALL}),
      // Animated.timing(this.imageOpacity, {duration: event.duration, toValue: 0}),
    ]).start();
    
  }
  
  keyboardWillHide = (event) => {
    Animated.parallel([
      Animated.timing(this.imageHeight, {duration: event.duration, toValue: LOGO_HEIGHT}),
      // Animated.timing(this.imageOpacity, {duration: event.duration, toValue: 1}),
    ]).start();
    
  }
  
  keyboardDidShow = () => {
    Animated.parallel([
      Animated.timing(this.imageHeight, {toValue: LOGO_HEIGHT_SMALL}),
      // Animated.timing(this.imageOpacity, {toValue: 0}),
    ]).start();
  }
  
  keyboardDidHide = () => {
    Animated.parallel([
      Animated.timing(this.imageHeight, {toValue: LOGO_HEIGHT}),
      // Animated.timing(this.imageOpacity, {toValue: 1}),
    ]).start();
  }
  
  onRedirectTo(route){
    Keyboard.dismiss();
    navigateTo(route);
  }
  
  singUp() {
    const currLang = (Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier).substring(0, 3);
    let lang = ['ru', 'en', 'cn', 'uk'].indexOf(currLang) >= 0 ? currLang : 'en';

      if (!this.state.isValidForm) {
        return
      }
      
      Keyboard.dismiss();
      const data = {
        UserName: this.state.email,
        Email: this.state.email,
        Password: this.state.password,
        PhoneNumber: this.state.phoneNumber,
        Role: this.state.role,
        BirthDate: this.state.birthDate,
        GivenName: this.state.givenName,
        InLanguage: lang
      };
      if(this.state.token && this.state.token.length){
        data['Token'] = this.state.token
      }
      post('/account/registration/newUser', data)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then((data) => {
          console.log(data)
          goBack(this.props)
        })
        .catch((error) => {
          if(error && error.response && error.response.data && error.response.data.message){
            showModal('alert', {
              title: 'COMMON.ERROR',
              message: error.response.data.message
            })
          }
          console.error(error)
        })
    
  }
  
  // Validation functions
  validate(inputName) {
    let formValidationState = this.singupForm.validate(inputName);
    console.log('FORM VALID STATE: ', formValidationState)
    
    this.setState({
      isValidForm: formValidationState
    })
  }
  
  onChange(filedName, value) {
    let newState = {};
    newState[filedName] = value;
    
    this.setState({
      person: Object.assign({}, this.state.person, newState),
      [filedName]: value
    }, () => {
      this.validate(filedName)
    })
  }
  dateFormat(isostring) {
    if (isostring) {
      let date = new Date(isostring);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let dt = date.getDate();
      if (dt < 10) {
        dt = '0' + dt;
      }
      if (month < 10) {
        month = '0' + month;
      }
      return dt + '.' + month + '.' + year;
    }
  }
  getRolesList(){
    let rList = [];
    if (this.roles) {
      this.roles.map((item, index) => {
        rList.push(item.key);
      });
    }
    return rList;
  }

  render() {
    const {signupUser, isSingnUp, isAuthenticating} = this.props;
    return (
      <KeyboardAvoidingView style={styles.container}>
        <SmallHeader
            leftComponent={
              <View style={{flexDirection: 'row', alignItems: 'center', width: 370}}>
                <TouchableOpacity style={{marginRight:5}} onPress={() => goBack(this.props)} >
                  <Icon
                      name='back'
                      size={25}
                      color={'#000'}
                  /></TouchableOpacity>
                <TextI18n textKey={'ADMINISTRATING_EXPERTS.INVITE'} style={styles.headerText} />
              </View>
            }
        />
        {isSingnUp && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <ActivityIndicator size="small" color={EStyleSheet.value('$loginRegLoader')} style={{
              backgroundColor: EStyleSheet.value('$loginRegIndicatorBG'),
              padding: 16,
              borderRadius: 10
            }}/>
          </View>
        )}

        <View
          style={styles.wrapper}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
              <Form
                ref={signupForm => this.singupForm = signupForm}
              >
                <GVE_Input
                  title="COMMON.REALNAME"
                  style={styles.input}
                  placeholder="COMMON.REALNAME"
                  label="GivenName"
                  name='givenName'
                  value={this.state.givenName}
                  returnKeyType="next"
                  onChange={givenName => this.onChange('givenName', givenName)}
                  keyboardType='default'
                  underlineColorAndroid='rgba(0,0,0,0)'
                  onRef={(ref) => {
                    this.inputs['givenName'] = ref
                  }}
                />
                <GVE_Input
                  title="COMMON.EMAIL"
                  style={styles.input}
                  placeholder="COMMON.EMAIL"
                  label="Email"
                  name='email'
                  value={this.state.email}
                  returnKeyType="next"
                  onChange={email => this.onChange('email', email)}
                  keyboardType='email-address'
                  underlineColorAndroid='rgba(0,0,0,0)'
                  onRef={(ref) => {
                    this.inputs['email'] = ref
                  }}
                />
                <GVE_Input
                  style={styles.input}
                  placeholder="+7(999)-999-9999"
                  label="phone"
                  mask
                  name='phoneNumber'
                  title='COMMON.PHONE_NUMBER'
                  value={this.state.phoneNumber}
                  returnKeyType="next"
                  keyboardType='phone-pad'
                  onChange={phoneNumber => this.onChange('phoneNumber', phoneNumber)}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  onRef={(ref) => {
                    this.inputs['phone'] = ref
                  }}
                  /*action={(input)=>this.inputs['password'].focus()}*/
                />
                {/*<GVE_Avatar_ImagePicker*/}
                {/*    style={{*/}
                {/*        width: 78,*/}
                {/*        height: 78,*/}
                {/*        borderRadius: 39,*/}
                {/*        borderWidth: 2,*/}
                {/*        zIndex: 15*/}
                {/*    }}*/}
                {/*    rounded*/}
                {/*    imageUrl={this.state.person.image}*/}
                {/*    onSuccess={this.onImageUpload.bind(this)}*/}
                {/*/>*/}
                <GVE_Input
                  style={{width: '100%'}}
                  title="PROFILE.FIELDS.BIRTHDATE"
                  rightComponent={<Icon name="calendar" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
                  autoFocus={false}
                  picker onTouchEnd={()=>(
                  showModal('datepickerModal', {
                    gradientShow:false,
                    onOkAction: (data) => this.onChange('birthDate', data),
                    minimumDate: new Date(-1573226669000),
                    date: (this.state.person.birthDate ? new Date(this.state.person.birthDate) : new Date()),
                    style:{
                      height: 340,
                      borderBottomWidth: 1,
                      borderBottomColor: EStyleSheet.value('$mainColor'),
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      top: (window.height/2)-(340/2),
                      marginBottom: 'auto'
                      //backgroundColor: color.secondaryTextColor
                    }
                  })
                )}
                  value={this.state.person.birthDate ? this.dateFormat(this.state.person.birthDate) : new Date()}
                  //placeholder="COMMON.PLACEHOLDERS.BIRTHDATE"
                  placeholder="DD.MM.YY"
                />
                {/*<Picker
                                    selectedValue={this.state.role || '0'}
                                    style={{height: 50}}
                                    onValueChange={(itemValue, itemIndex) => this.onChange('role', itemValue)}>
                                    {
                                        this.roles.map((item, index) => {
                                            return (<Picker.Item label={item.key} value={item.value} key={item.key}/>)
                                        })
                                    }
                                </Picker>*/}
                <GVE_Input
                  style={{width: '100%'}}
                  title="PROFILE.FIELDS.ROLE"
                  rightComponent={<Icon name="arrow-down" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
                  autoFocus={false}
                  picker onTouchEnd={()=>(
                  showModal('pickerModal', {
                    title:"PROFILE.FIELDS.ROLE",
                    gradientShow:false,
                    onOkAction: (data) => this.onChange('role', this.rolesIds[data]),
                    selectedValue: this.state.role ? this.rolesNames[this.state.role] : this.rolesNames['0'],
                    pickerData: this.getRolesList(),
                    style:{
                      height: 380,
                      borderBottomWidth: 1,
                      borderBottomColor: EStyleSheet.value('$mainColor'),
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      top: (window.height/2)-(380/2),
                      marginBottom: 'auto'
                      //backgroundColor: color.secondaryTextColor
                    }
                  })
                )}
                  value={this.state.role ? this.rolesNames[this.state.role] : this.rolesNames['0']}
                  placeholder="Role"
                />
                <GVE_Input
                  style={styles.input}
                  secureTextEntry
                  placeholder="COMMON.PLACEHOLDERS.PASSWORD"
                  title="COMMON.PLACEHOLDERS.PASSWORD"
                  label="Password"
                  name='password'
                  value={this.state.password}
                  returnKeyType="next"
                  onChange={password => this.onChange('password', password)}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  onRef={(ref) => {
                    this.inputs['password'] = ref
                  }}
                  //action={(input)=>this.inputs['confirm_password'].focus()}
                />
                <GVE_Input
                  style={styles.input}
                  secureTextEntry
                  placeholder="AUTH.CONFIRM_PASSWORD"
                  title="AUTH.CONFIRM_PASSWORD"
                  label="Password"
                  name='confirmPassword'
                  value={this.state.confirmPassword}
                  returnKeyType="go"
                  onChange={confirmPassword => this.onChange('confirmPassword', confirmPassword)}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  action={() => this.singUp()}
                />
              </Form>
            <View style={[styles.btnWrapper]}>
              <Button
                style={styles.button}
                title='ADMINISTRATING_EXPERTS.CREATE'
                disabled={isSingnUp || !this.state.isValidForm}
                onPress={() => this.singUp()}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '$mainBgColor', //#4b088a
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  headerText: {
      fontSize: font.sizeH1,
      color: '$headerText',
      marginLeft: 90,
      marginBottom: 5,
  },
  topSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  iagree:{
    fontSize: font.sizeH3,
    marginTop: 15,
  },
  ihavecode:{
    fontSize: font.sizeH4,
  },
  privacy:{
    marginTop: 15,
    color: '#7B68EE',
    fontSize: font.sizeH3,
  },
  btnWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  input: {
    width: FORM_WIDTH,
    // height: 25
    fontSize: font.sizeP,
    backgroundColor: '$mainBgColor'
  },
  label: {
    color: '#BCC5D3',
    fontSize: font.sizeS
  },
  formWrapper: {
    flex: 3,
    borderWidth: 1,
  },
  wrapper: {
    flex: 1,
    width: FORM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '$mainBgColor'
  },
  button: {
    marginVertical: 20,
    width: '100%'
  },
});

const mapStateToProps = state => ({
  isSingUpFailed: state.auth.isSingUpFailed,
  statusText: state.auth.statusText,
  isSingnUp: state.auth.isSingnUp,
  isAuthenticating: state.auth.isAuthenticating
});

const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(AdminRegisterUser);
