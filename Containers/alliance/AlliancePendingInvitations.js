import React from 'react';
import {
  View, StyleSheet, FlatList, Text, TouchableOpacity
} from 'react-native';
import {Router, Switch, Link, Route} from '../../Routing';
import {connect} from 'react-redux';

import {getConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, Loading, SmallHeader, TextI18n} from "../../components/common/index";
import {
  approvePendingInvitation, getAllAlliances, getPendingInvitations,
  sendPendingInvitation
} from "../../redux/actions/organization";
import { AlliancePendingInvitation} from "../../components/alliance/index";
import {InvitationTypes} from "../../constants/invitationTypes.enum";
import {getParams, goBack} from "../../Services/navigationService";
import {selectRole} from "../../redux/actions/auth";
import EStyleSheet from "react-native-extended-stylesheet";


const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AlliancePendingInvitations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgId: ''
    }
  }
  
  
  componentDidMount(){
    
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
    
  }
  screenLoad() {
    const {id }= getParams(this.props);
    this.setState({orgId: id});
    this.props.setAdministrationRole(`${id}-alliance:admin`);
    this.props.getPendingInvitations();
  }
  screenBlur() {
    const role = this.props.roles.find(item =>{
      return item.indexOf('-')<0;
    })
    this.props.setAdministrationRole(role)
  }
  
  handleRefresh = () => {
    this.props.getPendingInvitations()
  };
  
  handleLoadMore = () => {
    //ToDo: discuss if needed Infinity scroll
  };
  joinToAlliance(personId){
    const data = {
      InvitationType: InvitationTypes.PersonAlliance,
      Id1: personId,
      Id2: this.state.orgId,
      InvitationStatus: 1,
      accessToken: this.props.matrixToken
    }
    this.props.approvePendingInvitation(data)
  }
  rejectPendingInvitation(personId){
    const data = {
      InvitationType: InvitationTypes.PersonAlliance,
      Id1: personId,
      Id2: this.state.orgId,
      InvitationStatus: 2
    }
    this.props.approvePendingInvitation(data)
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
                <TextI18n style={styles.headerText} textKey="ALLIANCE.PENDINGINVITATIONS"></TextI18n>
              </View>
            }
        />
        {this.props.isLoading ? <Loading/> :
          this.props.pendingInvitations.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.props.pendingInvitations}
              renderItem={({item, index}) => <AlliancePendingInvitation data={item} approveJoin={this.joinToAlliance.bind(this)} rejectJoin={this.rejectPendingInvitation.bind(this)}/>}
              refreshing={this.props.isLoading}
              onRefresh={this.handleRefresh}
              keyExtractor={(item, index) => item.id.toString()}
              onEndReached={(x, y) => {
                console.log('reached');
                this.handleLoadMore()
              }}
              onEndReachedThreshold={0.01}
            /> : <View/>
        }
      
      </View>
    );
  }
}

const mapStateToProps = state => ({
  roles: state.auth.role,
  personId: state.auth.person_id,
  isLoading: state.organization.loading,
  pendingInvitations: state.organization.pendingInvitations,
  matrixToken: state.chatReducer.token
});
const bindActions = dispatch => ({
  getPendingInvitations: () => dispatch(getPendingInvitations()),
  approvePendingInvitation: (data) => dispatch(approvePendingInvitation(data)),
  setAdministrationRole: (role) => dispatch(selectRole(role))
});
export default connect(mapStateToProps, bindActions)(AlliancePendingInvitations);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f8f8f8f8',
    paddingHorizontal: 10
  },
  headerText:{
    fontSize: font.sizeH1,
    color: '$headerText',
    marginLeft: 60
  }
});