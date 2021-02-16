import React, {Component} from 'react';
import {View, TouchableOpacity, Dimensions, Text} from 'react-native';
import {connect} from 'react-redux';
import {GVE_Icon as Icon, SmallHeader, TextI18n, GVE_Input} from '../../components/common';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import {getConfigItem} from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';
import {API_URL, deleteById, getWithParams, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {showModal} from "../../Services/modalService";
import {ScrollView} from "../../components/common/video-player/ScrollView";
import Button from "../../components/common/Button";
import {authUserSelector} from "../../Services/authService";
import ServicePoints from "../../components/common/points/ServicePoints";
import {selectRole} from "../../redux/actions/auth";


const window = Dimensions.get('window');


const font = getConfigItem('AccessTheme').font;

class AllianceApplyServiceScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      service:{},
      useCount: 1
    }
  }
  
  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
  }
  
  screenLoad() {
    const navParams = getParams(this.props)
    console.log(navParams);
    if(authUserSelector.isUserAdminOfOrgSync(this.props, navParams.orgId)) {
      this.props.setAdministrationRole(`${navParams.orgId}-alliance:admin`)
    }
    getWithParams(`/service/${navParams.serviceId}/person/${navParams.personId}`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        console.log(data);
        this.setState({service: data})
      }).catch(error => {
        console.log(error);
      })
  }
  screenBlur() {
    const role = this.props.roles.find(item =>{
      return item.indexOf('-')<0;
    })
    this.props.setAdministrationRole(role)
  }

  applyService() {
    const navParams = getParams(this.props)
  
    post(`/service/apply`, {serviceId:navParams.serviceId , personId:navParams.personId})
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((data) => {
        showModal('alert', {
          message: 'ALLIANCE.SERVICEWASAPPLIED',
          onOkAction: () => {goBack(this.props), goBack()}
        })
      })
      .catch((error) => {
        if(error && error.response && error.response.data && error.response.data.message && error.response.data.message.indexOf('does not provide this service')){
          showModal('alert', {
            message: 'ALLIANCE.SERVICENOTPRESSENTED',
          })
        } else {
          showModal('alert', {
            message: 'COMMON.ERROR',
          })
        }
      })
  }
  
  render() {
    return (
      <View style={{flex: 1}}>
        <SmallHeader
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between'}}>
              <TouchableOpacity onPress={() => goBack(this.props)}>
                <Icon
                  name='back'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                /></TouchableOpacity>
            </View>}
          centerComponent={<TextI18n style={styles.headerText} textKey="ALLIANCE.APPLYSERVICE"/>}
          />
        <TouchableOpacity style={styles.serviceCard}>
          <View>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceCardTextLine}>
                <Text style={styles.serviceCardHeaderText}>{this.state.service.name}</Text>
                <TextI18n style={styles.serviceCardHours} textKey={'WISHLIST.HOUR'}
                          keys={{amountTime: this.state.service.receivedCount}}></TextI18n>
              </View>
            </View>
            {/*<View style={styles.serviceCardContainer}>*/}
              {/*<GVE_Input*/}
                {/*title="ALLIANCE.USECOUNT"*/}
                {/*style={styles.input}*/}
                {/*placeholder="ALLIANCE.USECOUNT"*/}
                {/*label="ALLIANCE.USECOUNT"*/}
                {/*name='useCount'*/}
                {/*value={this.state.useCount.toString()}*/}
                {/*returnKeyType="next"*/}
                {/*onChange={count => this.setState({useCount: count})}*/}
                {/*keyboardType='decimal-pad'*/}
                {/*underlineColorAndroid='rgba(0,0,0,0)'*/}
              {/*/>*/}
              {/**/}
              {/*/!*<Text style={styles.serviceCardDescriptionText}>{this.state.service.description}</Text>*!/*/}
            {/*</View>*/}
            <Button
              style={styles.button}
              title='WISHLIST.USE'
              titleColor={EStyleSheet.value('$btnText')}
              onPress={() => {
                this.applyService()
              }}
              full={false}
              wrapperStyle={{paddingVertical: 10}}
            />
    
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.auth.role
});
const mapDispatchToProps = (dispatch) => ({
  setAdministrationRole: (role) => dispatch(selectRole(role))
});

export default connect(mapStateToProps, mapDispatchToProps) (AllianceApplyServiceScreen);

const styles = EStyleSheet.create({
  headerText: {
    color: '$headerText',
    fontSize: font.sizeHeader,
  },
  container: {
    backgroundColor: '$mainBgColor'
  },
  serviceCard: {
    backgroundColor: '$genBackgroundColor',
    borderRadius: 10,
    margin: 5,
    padding: 15,
  },
  serviceCardTextLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  serviceCardHeaderText: {
    textAlign: 'right',
    fontSize: font.sizeH1,
    color: '$headerText',
    fontWeight: 'bold',
    marginBottom:10
  },
  serviceCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  serviceCardGradient: {
    flexDirection: 'row',
    paddingVertical: 7,
    marginBottom: 7
  },
  serviceCardDescriptionText: {
    textAlign: 'justify',
    fontSize: font.sizeH3,
    color: '$headerText',
  },
  serviceRightCoins: {
    paddingHorizontal: 2,
    fontSize: font.sizeH2,
    color: '$headerText',
  },
  serviceCardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 10,
    width: '40%',
    alignSelf: 'center'
  },
  serviceButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  serviceCardHours:{
    fontSize: font.sizeH3,
  },
  serviceCardHeader:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noWishesContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  noWishesText:{
    fontSize: font.sizeH2,
  },
  btnContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center'
  },
  addServiceContainer:{
    padding:10
  },
  input: {
    width: '100%',
    fontSize: font.sizeP,
  },
});


