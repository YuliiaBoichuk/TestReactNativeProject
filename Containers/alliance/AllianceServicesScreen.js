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

class AllianceServicesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myServices: [],
      isAddService: false,
      service:{},
      services:[]
    }
  }
  
  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
  }
  
  screenLoad() {
    const navParams = getParams(this.props)
    console.log(navParams);
    this.getService();
    if(authUserSelector.isUserAdminOfOrgSync(this.props, navParams.id)) {
      this.props.setAdministrationRole(`${navParams.id}-alliance:admin`)
    }
    getWithParams(`/service/organization/${navParams.id}/provideList`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        console.log(data);
        this.setState({myServices: [...data]})
      }).catch(error => {
      console.log(error);
    })
  }
  screenBlur() {
    // const role = this.props.roles.find(item =>{
    //   return item.indexOf('-')<0;
    // })
    // this.props.setAdministrationRole(role)
  }
  getService() {
    getWithParams(API_URL + '/service')
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        this.setState({services: data});
      }).catch(error => {
      console.log(error)
    });
  }
  addService() {
    this.setState({
      isAddService: true
    })
  }
  getServiceId(name) {
    const services = this.state.services;
    if (services) {
      this.onModifyService('serviceId', services.find((item) => {
        return item.name === name;
      }).id);
    }
  }
  onModifyService(fieldName, value) {
    this.setState({service: {...this.state.service, [fieldName]: value}})
  }
  getServiceList() {
    let sList = [];
    const services = this.state.services;
    if (services) {
      services.map((item, index) => {
        sList.push(item.name);
      });
    }
    return sList;
  }
  getServiceNameById(serviceId) {
    if (!serviceId) {
      return ''
    }
    return this.state.services.find((item) => {
      return item.id === serviceId;
    }).name
  }
  discardService() {
    this.setState({isAddService: false})
  }
  
  applyService() {
    post(`/service/${this.state.service.serviceId}/organization/provideList`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((data) => {
        this.setState({isSaved: true, isAddService: false, service:{}});
        this.screenLoad();
      })
      .catch((error) => {
        console.log(error)
      })
  }
  removeService(service) {
    console.log(service)
    deleteById(`/service/${service.id}/organization/provideList`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((data) => {
        this.screenLoad();
      })
      .catch((error) => {
        console.log(error)
      })
  }
  
  renderServiceCard(srvc) {
    return (
      <TouchableOpacity style={styles.serviceCard}>
        <View>
          <View style={styles.serviceCardHeader}>
            <View style={styles.serviceCardTextLine}>
              <Text style={styles.serviceCardHeaderText}>{srvc.name}</Text>
              <TextI18n style={styles.serviceCardHours} textKey={'WISHLIST.HOUR'}
                        keys={{amountTime: srvc.amountTime}}></TextI18n>
            </View>
            <View style={styles.serviceCardCoins}>
              <TouchableOpacity onPress={() => {this.removeService(srvc)}}>
                <Icon
                  name="trash"
                  color={EStyleSheet.value('$btnIconColor')}
                  size={25}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.serviceCardContainer}>
            <Text style={styles.serviceCardDescriptionText}>{srvc.description}</Text>
          </View>
          

        </View>
      </TouchableOpacity>
    )
  }
  renderModify() {
    return (
      <View >
        <View style={styles.addServiceContainer}>
          <GVE_Input
            style={{width: '100%'}}
            title="WISHLIST.SELECT"
            rightComponent={<Icon name="arrow-down" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
            autoFocus={false}
            picker onTouchEnd={() => (
            showModal('pickerModal', {
              title: "WISHLIST.SELECT",
              gradientShow: false,
              onOkAction: (data) => this.getServiceId(data),
              selectedValue: this.state.service.serviceId,
              pickerData: this.getServiceList(),
              style: {
                height: 380,
                borderBottomWidth: 1,
                borderBottomColor: EStyleSheet.value('$mainColor'),
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                top: (window.height / 2) - (380 / 2),
                marginBottom: 'auto'
              }
            })
          )}
            value={this.getServiceNameById(this.state.service.serviceId)}
            placeholder="WISHLIST.SELECT"
          />
          
        </View>
        <View style={styles.btnContainer}>
          <Button style={styles.applyBtn}
                  title="WISHLIST.APPLY"
                  onPress={this.applyService.bind(this)}
                  wrapperStyle={{paddingVertical: 12}}
          />
          <Button style={styles.cancelBtn}
                  title="WISHLIST.CANCEL"
                  noBackgroundColor
                  titleColor={EStyleSheet.value('$cancelButton')}
                  onPress={this.discardService.bind(this)}
                  wrapperStyle={{paddingVertical: 12}}
          />
        </View>
      </View>
    )
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
          centerComponent={<TextI18n style={styles.headerText} textKey="ALLIANCE.PROVIDEDSERVICES"/>}
          rightComponent={<TouchableOpacity onPress={() => this.addService()}>
            <Icon
              name='plus'
              size={25}
              color={EStyleSheet.value('$headerIconColor')}
            /></TouchableOpacity>}/>
        {this.state.isAddService ? this.renderModify() : null}
        {this.state.myServices.length ?
          <ScrollView style={styles.container}>
            {
              this.state.myServices.map(srvc => {
                return (
                  this.renderServiceCard(srvc)
                )
              })
            }
          </ScrollView>:
          <View style={styles.noWishesContainer}>
            <TextI18n textKey={'ALLIANCE.NOPROVIDEDSERVICES'} style={styles.noWishesText}/>
          </View>}
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

export default connect(mapStateToProps, mapDispatchToProps) (AllianceServicesScreen);

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
    fontWeight: 'bold'
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
    width: '40%'
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
  }
});


