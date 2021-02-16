import React from 'react';
import {
  View, StyleSheet, FlatList, Text, TouchableOpacity
} from 'react-native';
import {Router, Switch, Link, Route, GVE_Avatar_ImagePicker} from '../../Routing';
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, GVE_Input, Loading, SmallHeader, TextI18n} from "../../components/common/index";
import {filterAlliances, getAllAlliances, leaveAlliance, sendPendingInvitation} from "../../redux/actions/organization";
import {AllianceListCard} from "../../components/alliance/index";
import {InvitationTypes} from "../../constants/invitationTypes.enum";
import {goBack, navigateTo} from "../../Services/navigationService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {authUserSelector} from "../../Services/authService";
import {showModal} from "../../Services/modalService";
import {API_URL, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      isLoading: true,
      from: 0,
      size: 80
    }
  }


  componentDidMount(){
    this.sendRequest({from: this.state.from, size: this.state.size})
  }

  handleLoadMore() {
    this.setState({from: this.state.from+this.state.size}, () =>{
      this.sendRequest({from: this.state.from, size: this.state.size})
    })
  }
  sendRequest(data) {
    this.props.getAlliances(data);
  }
  joinToAlliance(orgId){
    const joinedAlliance = this.props.auth.role.filter((role) => {
      return role.indexOf('-alliance:member')>-1 || role.indexOf('-alliance:candidate')>-1
    });
    if(joinedAlliance && joinedAlliance.length >= 3){
      showModal('alert', {
        title: '',
        message: 'ALLIANCE.TOOMUCHALLIANCES'
      });
      return;
    }
    const data = {
      InvitationType: InvitationTypes.PersonAlliance,
      OrgId: orgId
    };
    if(!authUserSelector.isUserAdminOfOrgSync(this.props, orgId)) {
      this.props.sendPendingInvitation(data)
    }
  }
  leaveAlliance(orgId){
    this.props.leaveAlliance(orgId)
  }
  goToMapScreen(){
    const geoData = this.props.alliancesList.map(item => {
      return {
        coordinates:item.geo,
        name: item.name,
        description: item.description,
        image: item.image
      };
    })
    console.log(geoData)
    navigateTo('alliance_map', {markers: this.props.alliancesList})
  }
  goToCreateScreen(){
    navigateTo('alliance_create', {markers: this.props.alliancesList})
  }
  _onChangeText(filterText) {
    this.setState({filterText: filterText})
    this.props.filterAlliances(filterText)
  }
  cleanFilter(){
    this._onChangeText('')
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
              <TextI18n textKey={'ALLIANCE.ALLIANCES'} style={styles.headerText} />
            </View>
          }
          rightComponent={
          <View style={styles.headerIcons}>
            <View style={{paddingHorizontal:5}}>
              <Icon
                name='map'
                color={EStyleSheet.value('$headerIconColor')}
                size={30}
                onPress={() =>{this.goToMapScreen()}}
              />
            </View>
            {this.props.currentRole == 'Manager' &&this.props.level && this.props.level.name.split(" ")[1] > 2 ?
              <View style={{right:0,paddingLeft:10}}>
              <Icon
                name='plus'
                color={EStyleSheet.value('$headerIconColor')}
                size={30}
                onPress={() =>{this.goToCreateScreen()}}
              />
            </View>: null}
          </View>
        }/>
        <View style={{paddingHorizontal:5, flex:1}}>
          <View style={styles.searchBar}>
              <GVE_Input
                  inputStyle={styles.inputStyle}
                  style={styles.input}
                  placeholder={'Search...'}
                  onChange={filterText => this._onChangeText(filterText)}
                  value={this.state.filterText}
              />
            <TouchableOpacity style={styles.cleanButton} onPress={() => this.cleanFilter()}>
              <Icon name="close"/>
            </TouchableOpacity>
          </View>


        {
          this.props.alliancesListForRender.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              keyExtractor={(item, index) => item.id}
              data={this.props.alliancesListForRender}
              renderItem={({item, index}) => <AllianceListCard data={item} onJoinToOrg={this.joinToAlliance.bind(this)} onLeaveOrg={this.leaveAlliance.bind(this)}/>}
              onEndReached={(x, y) => {
                console.log('reached');
                if(this.props.alliancesListForRender.length  % this.state.size === 0) {
                  this.handleLoadMore()
                }
              }}
              onEndReachedThreshold={0.01}
            /> : this.props.isLoading ? <Loading/> : <View/>
        }
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  personId: state.auth.person_id,
  isLoading: state.organization.loading,
  alliancesList: state.organization.alliancesList,
  alliancesListForRender: state.organization.alliancesListForRender,
  currentRole: state.auth.selectedRole,
  level: state.auth.person.level,
});
const bindActions = dispatch => ({
  getAlliances: (data) => dispatch(getAllAlliances(data)),
  filterAlliances: (filterText) => dispatch(filterAlliances(filterText)),
  sendPendingInvitation: (data) => dispatch(sendPendingInvitation(data)),
  leaveAlliance:(orgId) => dispatch(leaveAlliance(orgId))
});
export default connect(mapStateToProps, bindActions)(AllianceListScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '$listCardColor',
    paddingHorizontal: 0
  },
  emptyHeader:{
    height: 70
  },
  searchBar:{
    backgroundColor: '$searchBarForAlliance',
    borderRadius: 20,
    height:45   ,
    width: '96%',
    marginTop: 10,
    marginLeft: '2%',
    paddingLeft:'7%',
    alignContent: 'center',
    marginBottom: 20,
  },
  headerIcons:{
    flexDirection: 'row'
  },
  headerText:{
    fontSize: font.sizeHeader,
    color: '$headerText'
  },
  cleanButton:{
    position: 'absolute',
    right: 10,
    top: 15
  }
});
