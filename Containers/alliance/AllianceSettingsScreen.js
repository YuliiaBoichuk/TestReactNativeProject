import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {getParams, goBack, navigateTo } from '../../Services/navigationService';
import {getConfigItem} from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';
import {leaveAlliance} from "../../redux/actions/organization";
import {SmallHeader, TextI18n, GVE_Icon as Icon} from "../../components/common/index";
import {TypeOrganizer} from "../../constants/postTypes.enums";
import {authUserSelector} from "../../Services/authService";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

class AllianceSettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgId: null,
      founderId: null
    }
  }

  componentDidMount(){

    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))

  }
  screenLoad() {
    const {id, founderId }= getParams(this.props);
    this.setState({orgId: id, founderId: founderId});
  }
  screenBlur() {
  }
  leaveAlliance() {
    if(this.state.orgId){
      this.props.leaveAlliance(this.state.orgId)
    }
  }
  createPost() {
    navigateTo('createPost', {id: this.state.orgId, type:TypeOrganizer.Organization})
  }
  scanQR() {
    navigateTo('qr', {orgId: this.state.orgId})
  }

  render() {
    return (

      <View style={styles.container}>
        <SmallHeader
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={{marginRight:8}} onPress={() => goBack(this.props)} >
                <Icon
                  name='back'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                /></TouchableOpacity>
              <TextI18n textKey={'COMMON.SETTINGS'} style={styles.headerText} />
            </View>
          } />
        <View style={styles.settingItemsContainer}>
          <TouchableOpacity style={styles.settingItem} onPress={() => this.createPost()}>
            <TextI18n textKey={'ALLIANCE.CREATEPOST'}  style={styles.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => this.scanQR()}>
            <TextI18n textKey={'ALLIANCE.SCANSERVICEQR'}  style={styles.text} />
          </TouchableOpacity>
          {authUserSelector.isUserAdminOfOrgSync(this.props, this.state.orgId)?
          <TouchableOpacity style={styles.settingItem} onPress={() => navigateTo('administratingAllianceUsers', {id: this.state.orgId, founderId: this.state.founderId})}>
            <TextI18n textKey={'ALLIANCE.MANAGEUSERS'}  style={styles.text} />
          </TouchableOpacity> : null}
          {/*<TouchableOpacity style={styles.settingItem} onPress={() => this.leaveAlliance()}>*/}
          {/*  <TextI18n textKey={'ALLIANCE.LEAVE'} />*/}
          {/*</TouchableOpacity>*/}
          {/*<TouchableOpacity style={styles.settingItem} onPress={() => navigateTo()}>*/}
          {/*  <TextI18n textKey={'PROFILE.SETTINGS.RULES'} />*/}
          {/*</TouchableOpacity>*/}
          {/*<TouchableOpacity style={styles.settingItem} onPress={() => navigateTo()}>*/}
          {/*  <TextI18n textKey={'PROFILE.SETTINGS.PRIVACYPOLICY'} />*/}
          {/*</TouchableOpacity>*/}
        </View>
      </View>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth
});
const bindActions = dispatch => ({
  leaveAlliance:(orgId) => dispatch(leaveAlliance(orgId))
});
export default connect(mapStateToProps, bindActions)(AllianceSettingsScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    color: '$headerText',
    fontSize: font.sizeHeader,
    marginLeft: '35%'
  },
  settingItemsContainer:{
    paddingHorizontal:25,
    marginTop: 15,
  },
  settingItem:{
    marginVertical: 15,
    fontSize: font.sizeH2
  },
  text:{
    color: '$headerText',
    fontSize: font.sizeH3
  },


});
