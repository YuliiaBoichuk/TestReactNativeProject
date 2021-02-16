import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  Dimensions
} from "react-native";
import { GVE_Icon as Icon, GVE_Input, Loading, SmallHeader, TextI18n } from '../../components/common/index';
import TextField from '../../components/common/TextField';
import AllianceCreateTab from '../../components/common/AllianceCreateTab';
import { containerActions } from "../../redux/actions/organization";
import { organizationSelector } from "../../Services/organizationService";
import { goBack, navigateTo } from "../../Services/navigationService";
import { Button, GVE_Image } from '../../components/common/index';
import { GVE_ImagePicker, GVE_TextEditor } from '../../Routing';
import Form from '../../components/common/form-validation/Form';
import { getConfigItem } from '../../Services/configService';
import { getParams } from '../../Services/navigationService';
import EStyleSheet from "react-native-extended-stylesheet";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const BASE_URL = '/';
const ABOUT_URL = '/aboutUs';


class AllianceCreateScreen extends Component {

  constructor(props) {
    super(props);
    const navProps = getParams(props);
    this.id = navProps && navProps.companyId || 0;
    this.state = {
      firstForm: this.id != 0 ? true : false,
      // secondForm: this.id != 0 ? true : false,
      //thirdForm: this.id != 0 ? true : false,
      fourthForm: this.id != 0 ? true : false,
      isButtonEnabled: true,
      data: {
        name: "", // +
        telephone: "", // +,
        email: "", // +
        url: "", // +
        logo: "", // +-
        sameAs: "", // +
        description: "", // +
        descriptionMarkdown: "", // +
        isAlliance: true,
        image: "",
        legalName: "",
        address: {
          addressCountry: "",
          addressLocality: "",
          addressRegion: "",
          postalCode: "",
          streetAddress: ""
        },
        geo: {
        },
        employeesIds: [],
        subscriptionEventSeasonIds:null
      },
      facebook: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      activeScreen: 0,
      showDialogSuccess: false,
      shodDialogError: false,
      isPreloader: false,
    };
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    submitted: PropTypes.bool.isRequired,
    getOrganization: PropTypes.func.isRequired,
    fetchOrganization: PropTypes.func.isRequired,
    updateOrganization: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { getOrganization } = this.props;
    if (this.id != 0) {
      getOrganization(this.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.isError(nextProps.error))
      setTimeout(() => this.renderAlert(false, 'Error.', nextProps.error), 200);
    
    if (nextProps.organization.data && nextProps.organization.data.id != this.state.data.id)
      this.setState({ data: { ...nextProps.organization.data } }, function() {this.getLinks()});
  }

  validate(inputName) {
    let forms = ['firstForm', /*'secondForm',*/ /*'thirdForm',*/ 'fourthForm'];

    let formValidationState = this[forms[this.state.activeScreen]].validate(inputName);

    this.setState({
      [forms[this.state.activeScreen]]: formValidationState
    });
  }

  isError(error) {
    return error && error !== this.props.error;
  }

  isSuccess(success) {
    return success && success !== this.props.submitted;
  }

  concatSocial() {
    const {
      facebook,
      linkedin,
      twitter,
      instagram,
    } = this.state;

    return [].concat(facebook, linkedin, twitter, instagram);
  }

  toAbout = () => {
    navigateTo('aboutUs')
    // const { history } = this.props;
    // history.push(OrganizationScreen.ABOUT_URL);
  };

  // handlers
  handleChangeDataTextField = inputName => (value) => {
    this.setState(state => ({
      data: {
        ...state.data,
        [inputName]: value,
      }
    }), () => {
      this.validate(inputName)
    });
  };

  /*handleChangeAddressTextField = inputName => (value) => {
    let chAddress = Object.assign({}, this.state.data.address);
    chAddress[inputName] = value;
    this.setState(state => ({
      data: {
        ...state.data,
        address: chAddress
      }
    }), () => {
      this.validate(inputName)
    });
  };*/

  handleChangeTextField = inputName => value => {
    this.setState({ [inputName]: value }, () => {
      this.validate(inputName)
    });
  }

  handlePressToScreen = activeScreen => () => this.setState({ activeScreen });

  handleClickCancel = () => {
    /*const { history } = this.props;
    history.push(OrganizationScreen.BASE_URL);*/
    goBack(this.props);
  };

  handleSubmit = () => {
    /*this.setState(
      ...this.state,
      Object.assign(...this.state.data, { sameAs: this.concatSocial() })
    );*/
    if(!this.state.isButtonEnabled){
      return;
    }
    const { fetchOrganization, updateOrganization } = this.props;
    const { data } = this.state;

    console.log("DATA");
    console.log(data);
     // fetchOrganization(Object.assign(data, { sameAs: this.concatSocial() }))
    this.setState({isButtonEnabled: false}, () => {
      if (this.id != 0) {
        updateOrganization(this.id, data);
      } else {
        //fetchOrganization(data);
        fetchOrganization(Object.assign(data, { sameAs: this.concatSocial(), matrixAccessToken: this.props.matrixAccessToken}))
      }
    })
    
  };

  handleClickGoBack = () => {
    this.props.history.goBack()
  };

  // renders
  renderAlert(isSuccess, title, desc) {
    return Alert.alert(
      title,
      desc,
      [
        {
          text: 'OK',
          onPress: isSuccess ? this.toAbout : null
        },
      ],
      { cancelable: false }
    );
  }

  /*renderHeaderLeftComponent() {
    return (
      <TouchableOpacity
        onPress={this.handleClickGoBack}
        style={styles.headerLeft}
      >
        <Icon
          name='back'
          color={color.iconColor}
        />
        <Text style={styles.headerLeftText}>
          Organization
        </Text>
      </TouchableOpacity>
    );
  }*/

  loadLogo(urlArray) {
    let chData = Object.assign({}, this.state.data);
    chData.image = urlArray.uri;
    this.setState({ isPreloader: false, data: chData });
  }

  getLinks() {
    if(this.state.data.sameAs) {
      const flink = this.state.data.sameAs.find(function (value) {return (/facebook/.test(value));});
      const llink = this.state.data.sameAs.find(function (value) {return (/linkedin/.test(value));});
      const ilink = this.state.data.sameAs.find(function (value) {return (/instagram/.test(value));});
      const tlink = this.state.data.sameAs.find(function (value) {return (/twitter/.test(value));});
      this.setState(
        {
          facebook: flink ? flink : "",
          linkedin: llink ? llink : "",
          instagram: ilink ? ilink : "",
          twitter: tlink ? tlink : ""
        }
      );
    }
  }

  renderFirstScreen() {
    return (
      <View>
        <View style={styles.fields}>
          <Form
            ref={firstForm => this.firstForm = firstForm}
          >
            <GVE_Input
              style={styles.input}
              placeholder="ALLIANCE.CREATE.NAME_ALLIANCE"
              //title="ALLIANCE.CREATE.NAME_ALLIANCE"
              label="Text"
              name='name'
              value={this.state.data.name}
              returnKeyType="next"
              onChange={this.handleChangeDataTextField('name')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              //placeholder="+7(999)-999-9999"
              placeholder="ALLIANCE.CREATE.PHONE"
              //title="ALLIANCE.CREATE.PHONE"
              label="phone"
              mask
              name='phoneNumber'
              value={this.state.data.telephone}
              returnKeyType="next"
              keyboardType='phone-pad'
              onChange={this.handleChangeDataTextField('telephone')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              placeholder="ALLIANCE.CREATE.EMAIL"
              //title="ALLIANCE.CREATE.EMAIL"
              label="Email"
              name='email'
              value={this.state.data.email}
              returnKeyType="next"
              onChange={this.handleChangeDataTextField('email')}
              keyboardType='email-address'
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              placeholder="ALLIANCE.CREATE.WEBSITE"
              //title="ALLIANCE.CREATE.WEBSITE"
              label="Website"
              name='url'
              value={this.state.data.url}
              returnKeyType="next"
              onChange={this.handleChangeDataTextField('url')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <View style={{ flexDirection: 'row', marginBottom: 10, width: '100%' }}>
              <GVE_ImagePicker
                style={styles.imagePicker}
                containerStyle={styles.imagePickerContainer}
                styles={styles.imagePickerButton}
                iconStyle={styles.imagePickerIconStyle}
                iconName={"add-image"}
                iconSize={26}
                title='ALLIANCE.CREATE.LOGO'
                titleColor={EStyleSheet.value('$mainColor')}
                rounded
                hidePlayIcon={false}
                imageUrl={this.state.data.image}
                accept=".jpg,.jpeg,.png"
                isImageAutoPublish={true}
                onStartUpload={() => this.setState({ isPreloader: true })}
                onError={() => this.setState({ isPreloader: false })}
                onSuccess={(urlArray) => this.loadLogo(urlArray)}
              />
            </View>
          </Form>
        </View>
        <View style={styles.btnGroup}>
          <Button title="Cancel" style={styles.btnBack} onPress={() => this.handleClickCancel(this.props)} />
          <Button title="Next" disabled={!this.state.firstForm} onPress={this.handlePressToScreen(1)} />
        </View>
      </View>

    );
  }

  renderSecondScreen() {
    return (
      <View>
        <View style={styles.fields}>
          <Form
            ref={secondForm => this.secondForm = secondForm}
          >
            <GVE_Input
              style={styles.input}
              placeholder="COMMON.SOCIAL_NETWORKS.FACEBOOK"
              //title="COMMON.SOCIAL_NETWORKS.FACEBOOK"
              label="Text"
              name='facebook'
              value={this.state.facebook}
              returnKeyType="next"
              onChange={this.handleChangeTextField('facebook')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              placeholder="COMMON.SOCIAL_NETWORKS.LINKEDIN"
              //title="COMMON.SOCIAL_NETWORKS.LINKEDIN"
              label="Text"
              name='linkedin'
              value={this.state.linkedin}
              returnKeyType="next"
              onChange={this.handleChangeTextField('linkedin')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              placeholder="COMMON.SOCIAL_NETWORKS.TWITTER"
              //title="COMMON.SOCIAL_NETWORKS.TWITTER"
              label="Text"
              name='twitter'
              value={this.state.twitter}
              returnKeyType="next"
              onChange={this.handleChangeTextField('twitter')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />

            <GVE_Input
              style={styles.input}
              placeholder="COMMON.SOCIAL_NETWORKS.INSTAGRAM"
              //title="COMMON.SOCIAL_NETWORKS.INSTAGRAM"
              label="Text"
              name='instagram'
              value={this.state.instagram}
              returnKeyType="next"
              onChange={this.handleChangeTextField('instagram')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
          </Form>
        </View>
        <View style={styles.btnGroup}>
          <Button title="Back" onPress={this.handlePressToScreen(0)} style={styles.btnBack} />
          <Button title="Ok" onPress={() => this.handleSubmit()} />
        </View>
      </View>
    );
  }

  renderThirdScreen() {
    const { data } = this.state;
    // TODO: add update image
    return (

      <View>
        {/*<View style={styles.fields}>
          <Form
            ref={thirdForm => this.thirdForm = thirdForm}
          >
            <Text style={styles.labelInput}>Country</Text>
            <GVE_Input
              style={styles.input}
              placeholder="Country"
              label="Text"
              name='addressCountry'
              value={this.state.data.address.addressCountry}
              returnKeyType="next"
              onChange={this.handleChangeAddressTextField('addressCountry')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Text style={styles.labelInput}>City</Text>
            <GVE_Input
              style={styles.input}
              placeholder="City"
              label="Text"
              name='addressLocality'
              value={this.state.data.address.addressLocality}
              returnKeyType="next"
              onChange={this.handleChangeAddressTextField('addressLocality')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Text style={styles.labelInput}>Region</Text>
            <GVE_Input
              style={styles.input}
              placeholder="Region"
              label="Text"
              name='addressRegion'
              value={this.state.data.address.addressRegion}
              returnKeyType="next"
              onChange={this.handleChangeAddressTextField('addressRegion')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Text style={styles.labelInput}>Postal Code</Text>
            <GVE_Input
              style={styles.input}
              placeholder="Postal Code"
              label="Text"
              name='postalCode'
              value={this.state.data.address.postalCode}
              keyboardType='phone-pad'
              returnKeyType="next"
              onChange={this.handleChangeAddressTextField('postalCode')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
            <Text style={styles.labelInput}>Street</Text>
            <GVE_Input
              style={styles.input}
              placeholder="Street"
              label="Text"
              name='streetAddress'
              value={this.state.data.address.streetAddress}
              returnKeyType="next"
              onChange={this.handleChangeAddressTextField('streetAddress')}
              underlineColorAndroid='rgba(0,0,0,0)'
            />
          </Form>
        </View>
        <View style={styles.btnGroup}>
          <Button title="Back" onPress={this.handlePressToScreen(1)} style={styles.btnBack} />
          <Button title="Next" disabled={!this.state.thirdForm} onPress={this.handlePressToScreen(3)} />
        </View>*/}
      </View>
    );
  }

  onDescriprionChange = (contentObj) => {
    this.setState(prevState => {
      return {
        ...prevState,
        data: {...prevState.data, description: contentObj.html, descriptionMarkdown: contentObj.markdown} // contentObj = {html, markdown, draftjs}
      }
    }, function() {console.log(this.state)})
  }

  renderFourthScreen() {
    // const { data } = this.state;
    // TODO: add update image
    return (
      <View>
        <View style={styles.fields}>
          <Form
            ref={fourthForm => this.fourthForm = fourthForm}
          >
            {
              Platform.OS === 'web' ?
                <GVE_TextEditor
                  title={'COMMON.DESCRIPTION'}
                  value={this.state.data.description}
                  onChange={(content)=>this.onDescriprionChange(content)} />
                :
                <TextField
                  multiline
                  numberOfLines={5}
                  title={'ALLIANCE.CREATE.DESCRIPTION'}
                  placeholder={'ALLIANCE.CREATE.DESCRIPTION'}
                  value={this.state.data.description}
                  onChange={this.handleChangeDataTextField('description')}
                />
            }

          </Form>
        </View>
        <View style={styles.btnGroup}>
          <Button title="Back" onPress={this.handlePressToScreen(1)} style={styles.btnBack} />
          <Button title="Ok" onPress={() => this.handleSubmit()} />
        </View>
      </View>
    );
  }

  renderScreens() {
    return [
      this.renderFirstScreen(),
      // this.renderSecondScreen(),
      //this.renderThirdScreen(),
      this.renderFourthScreen()
    ];
  }
  render() {
    const { activeScreen } = this.state;
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
                /></TouchableOpacity>
              <View style={[{width: '95%'} ,styles.headerTextWrap]}>
                <TextI18n textKey={'ALLIANCE.CREATE.TITLE'} style={styles.headerText} />
              </View>
            </View>
          }
        />
        <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
          <AllianceCreateTab screens={this.renderScreens()} current={activeScreen} />
        </ScrollView>
      </View>
    )
  }
}

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
  fields: {
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  btnGroup: {
    paddingLeft: 5,
    paddingRight: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  appIntro: {
    fontSize: 30,
    textAlign: 'center',
  },
  btnBack: {
    //backgroundColor: '$cancelButton',
  },
  /*headerLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerLeftText: {
    color: color.headerText,
    fontSize: font.sizeHeader,
    marginLeft: 10
  },
  labelInput: {
    color: color.commonInputTitle,
    fontSize: font.inputTitle,
    fontWeight: "bold"
  },*/
  imagePicker: {
    display: 'flex',
    width: '100%',
    marginVertical: 10
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
});


const mapStateToProps = state => ({
  organization: organizationSelector.getData(state),
  loading: organizationSelector.isLoading(state),
  error: organizationSelector.getError(state),
  submitted: organizationSelector.isSubmitted(state),
  matrixAccessToken: state.chatReducer.token
});

export default connect(mapStateToProps, containerActions)(AllianceCreateScreen);
