import React from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {Router, Switch, Link, Route} from '../../Routing';
import {connect} from 'react-redux';
import {getConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, Loading, SmallHeader, TextI18n} from "../../components/common/index";
import {getAllianceMembers, updateAllianceMember} from "../../redux/actions/organization";
import {AllianceAdministratingMemberCard} from "../../components/alliance/index";
import {getParams, goBack} from "../../Services/navigationService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {API_URL, deleteById, post, put} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils";
import {refreshToken, selectRole} from "../../redux/actions/auth";
import {AllianceRoles} from "../../constants/allianceRoles.enum";
import {InvitationTypes} from "../../constants/invitationTypes.enum";
import {showModal} from "../../Services/modalService";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AdministratingAllianceUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgId: '',
      leaveScreen: false,
      founderId: null
    }
  }
  
  
  componentDidMount(){
    
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
    
  }
  
  componentWillReceiveProps(nextProps) {
    if(this.state.orgId && !this.state.leaveScreen && nextProps.selectedRole != `${this.state.orgId}-alliance:admin`){
      const user = this.props.members.find((member) => {
        return member.id == this.props.authId;
      })
      if(user && (user.allianceRole == AllianceRoles.OWNER || user.allianceRole == AllianceRoles.ADMIN) || !user) {
        this.props.setAdministrationRole(`${this.state.orgId}-alliance:admin`)
      } else{
        goBack(this.props);
        goBack(this.props)
      }
    } else if(this.state.leaveScreen){
      const role = this.props.roles.find(item => {
        return item.indexOf('-') < 0;
      })
      this.props.setAdministrationRole(role);
    }
  }
  
  screenLoad() {
    const {id, founderId }= getParams(this.props);
    this.setState({orgId: id, leaveScreen: false, founderId: this.state.founderId && this.state.founderId != founderId? this.state.founderId: founderId});
    this.props.setAdministrationRole(`${id}-alliance:admin`)
    this.props.getAllianceMembers(id);
  }
  screenBlur() {
    const role = this.props.roles.find(item => {
      return item.indexOf('-') < 0;
    })
    this.setState({leaveScreen: true});
    this.props.setAdministrationRole(role)
  }
  
  handleRefresh = () => {
    this.props.getAllianceMembers(this.state.orgId)
  };
  
  handleLoadMore = () => {
    //ToDo: discuss if needed Infinity scroll
  };
  deleteUserAlliance(id){
    const data = {
      memberId: id,
      accessToken: this.props.matrixToken,
      authorizedPersonId: Number(this.props.authId),
      organizationId: this.state.orgId,
    }
    showModal('confirm', {
      title: 'EDITOFFER.DELETEITEM.TITLE',
      icon: 'alert-circle',
      message: 'EDITOFFER.DELETEITEM.MESSAGE',
      onOkAction: () => {
        deleteById(`/organization/${this.state.orgId}/member`, data)
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(data => {
              console.log(data);
              if(id == this.props.authId){
                this.props.refreshToken();
                setTimeout(() => {
                  goBack(this.props);
                  goBack(this.props);
                }, 500)
                
              }
              this.screenLoad();
            })
            .catch(error => {
              console.log(error);
            })
      }
    });

  }
  changeRole = (id, roleId) => {
    const requestModel = {
      "personId": id,
      "allianceId": this.state.orgId,
      "role":roleId
    }
    put('/alliance/personrole', requestModel)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(data => {
        if(roleId == AllianceRoles.OWNER){
          this.setState({founderId: id})
        }
        console.log(data);
        this.props.refreshToken();
        this.props.updateAllianceMember(id, {allianceRole: roleId})
      
      }).catch(error => {
      console.log(error);
      this.setState({isLoading: false})
    })
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
              <TextI18n style={styles.headerText} textKey="ALLIANCE.MEMBERS"></TextI18n>
            </View>
          }
        />
        
        {this.props.isLoading ? <Loading/> :
          this.props.members.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.props.members}
              renderItem={({item, index}) => <AllianceAdministratingMemberCard data={item}
                                                                               founderId={this.state.founderId}
                                                                               ownId={this.props.authId}
                                                                               deleteUser={this.deleteUserAlliance.bind(this)}
                                                                               changeRoleFunction={this.changeRole.bind(this)}/>}
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
  isLoading: state.organization.loading,
  members: state.organization.members,
  authId: state.auth.person_id,
  roles: state.auth.role,
  selectedRole: state.auth.selectedRole,
  matrixToken: state.chatReducer.token
});
const bindActions = dispatch => ({
  getAllianceMembers: (id) => dispatch(getAllianceMembers(id)),
  refreshToken: () => dispatch(refreshToken()),
  updateAllianceMember:(id, objToUpdate) => dispatch(updateAllianceMember(id, objToUpdate)),
  setAdministrationRole: (role) => dispatch(selectRole(role))
});
export default connect(mapStateToProps, bindActions)(AdministratingAllianceUsers);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f8f8f8f8',
    paddingHorizontal: 5
  },
  emptyHeader:{
    height: 70
  },
  headerText:{
    fontSize: font.sizeH1,
    color: '$headerText',
    marginLeft: 95
  }
});
