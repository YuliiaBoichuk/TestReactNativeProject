import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image,Dimensions, FlatList } from 'react-native';
import { MapView } from '../../Routing';
import AllianceMapMarker from "../../components/alliance/AllianceMapMarker";
import {showModal} from "../../Services/modalService";
import {connect} from 'react-redux';
import {filterAlliances, getAllAlliances, sendPendingInvitation} from "../../redux/actions/organization";
import {getConfigItem} from "../../Services/configService";
import GVE_Input from "../../components/common/GVE_Input";
import {getParams, goBack} from "../../Services/navigationService";
import {GVE_Icon as Icon, SmallHeader, TextI18n} from "../../components/common/index";
import Button from "../../components/common/Button";
import {InvitationTypes} from "../../constants/invitationTypes.enum";
import AllianceListCard from "../../components/alliance/AllianceListCard";
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from "react-native-fast-image";

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

class
AllianceMapScreen extends Component {
  constructor(props){
    super(props);
    this.state= {
      filterText: '',
      markers: null,
      isShowOneAlliance: false,
      selectedAlliance: {},
      isLoading: true,
      from: 0,
      size: 20
    }
  }
  componentDidMount(){
    this.sendRequest({from: this.state.from, size: this.state.size})
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
  }
  screenLoad() {
    let navParams = getParams(this.props);
    if(navParams.markers){
      this.setState({markers:navParams.markers})
    }
  }

  screenBlur() {
    this.props.filterAlliances('');
  }

  handleLoadMore() {
    this.setState({from: this.state.from+this.state.size}, () =>{
      this.sendRequest({from: this.state.from, size: this.state.size})
    })
  }
  sendRequest(data) {
    this.props.getAlliances(data);
  }
  onMarkerPress(item) {
    this.setState({isShowOneAlliance: !this.state.isShowOneAlliance, selectedAlliance:item})
  }
  _onChangeText(filterText) {
    this.setState({filterText: filterText})
    this.props.filterAlliances(filterText)
  }
  joinToAlliance(id) {
    const data = {
      InvitationType: InvitationTypes.PersonAlliance,
      OrgId: id
    }
    this.props.sendPendingInvitation(data)
  }
  closeViewOneAlliance(){
    this.setState({isShowOneAlliance: false})
  }
  leaveAlliance(id){

  }
  onListItemPress(item){
    this.setState({isShowOneAlliance: !this.state.isShowOneAlliance, selectedAlliance:item})
  }
  render(){
    let { markers } = this.state;
    return (
      <View style={[styles.container]}>
        <View style={styles.headerContainer}>
        <SmallHeader
          isTransparent={true}
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={{marginRight:8}} onPress={() => goBack(this.props)} >
                <Icon
                  name='back'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                /></TouchableOpacity>
              <TextI18n textKey={'ALLIANCE.MAP'} style={styles.headerText} />
            </View>
          } />
        </View>
        <View style={styles.searchBar}>
          <GVE_Input
            inputStyle={styles.inputStyle}
            style={styles.input}
            placeholder={'Search...'}
            onChange={filterText => this._onChangeText(filterText)}
            value={this.state.filterText}
          />
        </View>
        <MapView
          provider={'google'}
          style={[styles.map]}
          initialRegion={{
            latitude: markers && markers.length && markers[0].geo.latitude || 52.433858,
            longitude: markers && markers.length &&  markers[0].geo.longitude ||13.294116,
            latitudeDelta: 1.015,
            longitudeDelta: 1.0121,
          }}
        region={this.state.selectedAlliance &&this.state.selectedAlliance.geo?{
          latitude:this.state.selectedAlliance.geo &&this.state.selectedAlliance.geo.latitude,
          longitude: this.state.selectedAlliance.geo&& this.state.selectedAlliance.geo.longitude,
          latitudeDelta: 1.015,
          longitudeDelta: 1.0121}: null}>
          {
            markers ?
              markers.map((item, index) =>
                <MapView.Marker
                  onPress={() => {this.onMarkerPress(item)}}
                  key={`${item.geo.latitude}_${item.geo.longitude}_${index}_${item.name}`}
                  coordinate={{
                    latitude: item.geo.latitude,
                    longitude: item.geo.longitude
                  }}
                >
                  <AllianceMapMarker {...item} />
                </MapView.Marker>
              )
              : null
          }
        </MapView>
        {this.state.isShowOneAlliance?
          <View style={styles.allianceFullCard}>
            <View style={styles.closebtnContainer}>

              <Icon
                name='close'
                size={20}
                onPress={() => this.closeViewOneAlliance()}
                color={EStyleSheet.value('$headerIconColor')}
              />
            </View>
            <View styles={styles.allianceFullCardImageWrapper}>
              {this.state.selectedAlliance.image ?
              <FastImage
                  style={styles.allianceFullCardImage}
                  source={{uri: this.state.selectedAlliance.image}}
                  resizeMode={FastImage.resizeMode.cover}
              /> : null}
            </View>
            <View style={styles.allianceFullCardHeader}>
              <Text style={styles.allianceFullCardName}>{this.state.selectedAlliance.name}</Text>
              <TextI18n style={styles.allianceFullCardSubscribers} textKey='ALLIANCE.SUBSCRIBERS' keys={{count: this.state.selectedAlliance.countMembers}}/>
            </View>
            <View>
              <Text>{this.state.selectedAlliance.description}</Text>
            </View>
            <View>
              {{
                0: <Button style={styles.buttons}
                           title='ALLIANCE.JOIN'
                           onPress={() => this.joinToAlliance(this.state.selectedAlliance.id)}
                />,
                1: <Button style={styles.buttons}
                           title='ALLIANCE.LEAVE'
                           onPress={() => this.leaveAlliance(this.state.selectedAlliance.id)}
                />,
                2: <Button style={styles.buttons}
                           title='ALLIANCE.PENDINGINVITE'
                />,
                3: null
              }[[this.state.selectedAlliance.inAlliance]]}
            </View>
          </View>: <View style={styles.allianceAllItemsCard}>
            {this.props.alliancesListForRender.length ?
            <FlatList
              ref={(ref) => this.flatlistref = ref}
              data={this.props.alliancesListForRender}
              renderItem={({item, index}) => <AllianceListCard data={item} onJoinToOrg={this.joinToAlliance.bind(this)} onPress={this.onListItemPress.bind(this)} isTransparent={true}/>}
              refreshing={this.props.isLoading}
              onEndReached={(x, y) => {
                if(this.props.alliancesListForRender.length % this.state.size === 0) {
                  this.handleLoadMore()
                }
              }}
              onEndReachedThreshold={0.01}
            />: <TextI18n style={styles.noAlliances} textKey="ALLIANCE.NOALLIANCES" />}
          </View>}
      </View>
    )
  }
}
const mapStateToProps = state => ({
  personId: state.auth.person_id,
  isLoading: state.organization.loading,
  alliancesList: state.organization.alliancesList,
  alliancesListForRender: state.organization.alliancesListForRender
});
const bindActions = dispatch => ({
  getAlliances: (data) => dispatch(getAllAlliances(data)),
  filterAlliances: (filterText) => dispatch(filterAlliances(filterText)),
  sendPendingInvitation: (data) => dispatch(sendPendingInvitation(data))
});
export default connect(mapStateToProps, bindActions)(AllianceMapScreen);

const styles = EStyleSheet.create({
  container: {
    flex:1
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 200,
  },
  searchBar:{
    backgroundColor: '$searchBarForAlliance',
    borderRadius: 20,
    height:45   ,
    width: '96%',
    marginLeft: '2%',
    paddingLeft:'7%',
    alignContent: 'center',
    marginBottom: 32,
    position: 'absolute',
    top: 80,
    zIndex: 20
  },
  allianceFullCard:{
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 30,
    width: '86%',
    alignItems: 'center',
    position: 'absolute',
    left: '7%',
    bottom: 10,
    zIndex:20,
    backgroundColor: '$bottomBar',
    height: HEIGHT/2,
  },
  closebtnContainer:{
    width: '95%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  allianceAllItemsCard:{
    borderRadius: 20,
    width: '96%',
    alignItems: 'center',
    position: 'absolute',
    left: '2%',
    bottom: 5,
    zIndex:20,
    height: HEIGHT/3,
    paddingTop:10,
    backgroundColor: '$listCardColor',
  },
  allianceFullCardImage:{
    width: 117,
    height:90,
    borderRadius:12
  },
  allianceFullCardImageWrapper:{
    justifyContent: 'center',
    alignItems: 'center',
    height:90,
  },
  allianceFullCardName:{
    fontSize: font.sizeP,
    fontWeight: '700'
  },
  allianceFullCardSubscribers:{
    fontSize: font.sizeS,
    color: '$secondaryTextColor'
  },
  allianceFullCardHeader:{
    justifyContent: 'center',
    alignItems: 'center'
  },
    headerText:{
    fontSize: font.sizeHeader,
    color: '$headerText'
  },
  headerContainer:{
    position: 'absolute',
    top: 0,
    zIndex:20
  },
  noAlliances:{
    textAlign:'center',
    fontSize: font.sizeHeader,
    color: '$headerText'
  }
});
