import React from 'react';
import {View, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {Router, Switch, Link, Route} from '../../Routing';
import {connect} from 'react-redux';
import {getConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, Loading, SmallHeader, TextI18n} from "../../components/common/index";
import {getAllianceMembers} from "../../redux/actions/organization";
import {AllianceMemberCard} from "../../components/alliance/index";
import {getParams, goBack} from "../../Services/navigationService";
import EStyleSheet from 'react-native-extended-stylesheet';
import {API_URL, post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceMembersListScreen extends React.Component {
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
    // this.props.setAdministrationRole(`${id}-alliance:admin`)
    this.props.getAllianceMembers(id);
  }
  screenBlur() {
  }

  handleRefresh = () => {
    this.props.getAllianceMembers(this.state.orgId)
  };

  handleLoadMore = () => {
    //ToDo: discuss if needed Infinity scroll
  };
  followRequest = (id) => {
    const requestModel = {
      id1: this.props.authId, // todo with token
      id2: id,
      typeId: 1,
      typeRelation: 1
    }
    post(API_URL + '/socialAction', requestModel)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(data => {
          console.log(data);
          //ToDo: check correct updating (now not correct)
          // const dataForStorage = {
          //   amountFollowers: this.props.amountFollowers,
          //   amountFollowings: (data.status == 1 ? this.props.amountFollowings -1 :  this.props.amountFollowings +1 )
          // }
          //this.props.updateFollowers(dataForStorage)
          if (this.props.isForFollowerRanking) {
            const itemForUpdate = this.props.data.find(item => {
              return item.id == id
            })
            if (itemForUpdate) {
              itemForUpdate.isFollow = (data.status && data.status == 2);
              (data.status && data.status == 2) ? this.props.updateFollowStatus(id, true) : this.props.updateFollowStatus(id, false);
            }
          } else {
            (data.status && data.status == 2) ? this.props.updateFollowStatus(id, true) : this.props.updateFollowStatus(id, false);
          }
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
              renderItem={({item, index}) => <AllianceMemberCard data={item} followRequest={this.followRequest.bind(this)}/>}
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
  authId: state.auth.person_id
});
const bindActions = dispatch => ({
  getAllianceMembers: (id) => dispatch(getAllianceMembers(id)),
});
export default connect(mapStateToProps, bindActions)(AllianceMembersListScreen);

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
