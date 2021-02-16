import React, {Component} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, AsyncStorage, Text} from 'react-native';
import {GVE_Header, GVE_Icon as Icon, TextI18n} from '../../components/common';
import {getConfigItem} from '../../Services/configService';
import FollowerList from '../../components/common/FollowerList';
import TopFuns from "../../components/top-funs";
import {connect} from "react-redux";
import {getAllianceRanking} from "../../redux/actions/organization";
import {getParams, goBack} from "../../Services/navigationService";
import {API_URL, getById, getWithParams} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {fetchData} from "../../redux/actions/elasticAction";
import {Loading, SmallHeader} from "../../components/common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import {updateFollowCount} from "../../redux/actions/auth";


const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;


class AllianceRankingScreen extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      orgId: '',
      activeList: 'DailyTrending',
      isLoading: true,
      followingIds:[],
      filteredData:[],
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))

  }
  screenLoad() {
    const {id }= getParams(this.props);
    this.setState({orgId: id}, () => {
      this._getData()
    });
    getWithParams(API_URL + '/person/following')
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(data => {
          const mappedData = data.map((item, index) => {
            item.index = index +1;
            return item.id
          })
          this.setState({ followingIds: mappedData });
        }).catch(error => {
      console.log(error);
    });
  }
  selectActiveTab(item) {
    this.setState({activeList: item}, ()=>{
      if(item == 'Archive'){
        this._getArchiveData()
      }else {
        this._getData()
      }
    })
  }
  _getData(){
    const {activeList} = this.state;
    this.setState({isLoading: true})
    getById(`${API_URL}/organization/${this.state.orgId}/members`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((response)=> {
        const data = response.map((item)=>{
          return item.id;
        })
        const criteria = {
          size: 10000,
          bool: {
            must: [
              {
                terms: {"TrendingEntity.EntityId": data}
              },
              {terms: {"TrendingEntity.EntityType": [1]}}]
          },
          sort: [
            { [activeList +'.ExperiencePoints']:   { "order": "desc" }}
          ]
        }
        fetchData('trendsearch', criteria, true)
          .then(checkHttpStatus)
          .then(parseJSON)
          .then((data) => {
            const mappedData = data.hits.hits.map(item =>{
              const itemData = item._source;
              const isFollowFromRedux = this.props.followingIDS.find((id) => {
                return id == itemData.TrendingEntity.EntityId
              });
              return {
                coins: itemData[activeList].Coins,
                experiencePoints: itemData[activeList].ExperiencePoints,
                image: itemData.TrendingEntity.Image,
                alternateName: itemData.TrendingEntity.Name,
                id: itemData.TrendingEntity.EntityId,
                level: itemData.TrendingEntity.Level && itemData.TrendingEntity.Level.Name ? itemData.TrendingEntity.Level.Name.split(' ')[1] : 0,
                likes: itemData.TrendingEntity.AmountOfLike ? itemData.TrendingEntity.AmountOfLike : 0,
                role: itemData.TrendingEntity.RoleType,
                isFollow: isFollowFromRedux,
              }
            })
            this.setState({data: mappedData, isLoading: false})
          })
          .catch((err) => {
            this.setState({isLoading: false});
            console.log(err)
          })
      })
      .catch((error) =>{
        this.setState({isLoading: false});
        console.log(error.message);
      });
  }
  _getArchiveData(){
    this.setState({isLoading: true});
    getById(`${API_URL}/organization/${this.state.orgId}/members`)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((response)=> {
        const data = response.map((item)=>{
          return item.id;
        })
    const criteria = {
      size: 10000,
      terms: { "Id" : data},
      sort: [
        { ['ExperiencePoints']:   { "order": "desc" }}
      ]
    }
    fetchData('person', criteria, true)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((data) => {
        const mappedData = data.hits.hits.map(item =>{
          const itemData = item._source;
          const isFollowFromRedux = this.props.followingIDS.find((id) => {
            return id == itemData.Id
          });
          return {
            coins: itemData.Coins,
            experiencePoints: itemData.ExperiencePoints,
            image: itemData.Image,
            alternateName: itemData.Name,
            id: itemData.Id,
            level: itemData.Level && itemData.Level.Name ? itemData.Level.Name.split(' ')[1] : 0,
            likes: itemData.AmountOfLike ? itemData.AmountOfLike : 0,
            role: itemData.RoleType,
            isFollow: isFollowFromRedux
          }
        })
        this.setState({data: mappedData, isLoading: false})
      })
      .catch((err) => {
        this.setState({isLoading: false});
        console.log(err)
      })
      })
      .catch((error) =>{
        this.setState({isLoading: false});
        console.log(error.message);
      });
  }
  updateFollowStatus(id,followStatus){
    const newIds = [...this.state.followingIds];
    if (followStatus) {
      newIds.push(id)
    } else {
      const index = newIds.indexOf(id);
      if (index > -1) { newIds.splice(index, 1);}
    }
    this.props.updateFollowCount(followStatus);
    this.setState({followingIds: newIds});
    const newFilteredData = [...this.state.filteredData];
    const modifiedFilteredItemIndex = newFilteredData.findIndex((item => {return item.id == id}));
    if(modifiedFilteredItemIndex > -1 ){
      newFilteredData[modifiedFilteredItemIndex].isFollow = followStatus;
    }
    this.setState({filteredData: newFilteredData});
    const newData = [...this.state.data];
    const modifiedItemIndex = newData.findIndex((item => {return item.id == id}));
    if(modifiedItemIndex > -1 ){
      newData[modifiedItemIndex].isFollow = followStatus;
    }
    this.setState({data: newData});
  }

  render() {
       return ( <View style={styles.container}>
         <SmallHeader
           leftComponent={
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <TouchableOpacity onPress={() => goBack(this.props)} >
                 <Icon
                   name='back'
                   size={25}
                   color={EStyleSheet.value('$headerIconColor')}
                 /></TouchableOpacity>
               <TextI18n style={styles.headerText} textKey="ALLIANCE.RANKING"></TextI18n>
             </View>
           }
         />
          {/*<TextI18n textKey={'FOLLOWERRANKING.HEADER'}*/}
                    {/*style={styles.headerText}/>*/}
          <View style={[styles.tabsBar]}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => this.selectActiveTab('DailyTrending')}>
              <TextI18n style={[styles.text, this.state.activeList == 'DailyTrending' ? styles.activeText : null]}
                                                                       textKey="TRENDING.TODAY"></TextI18n>
              {
                this.state.activeList == 'DailyTrending' ? <View style={styles.activeBar} /> : null
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => this.selectActiveTab('WeeklyTrending')}>
              <TextI18n style={[styles.text, this.state.activeList == 'WeeklyTrending' ? styles.activeText : null]}
                        textKey="TRENDING.WEEK"></TextI18n>
              {
                this.state.activeList == 'WeeklyTrending' ? <View style={styles.activeBar} /> : null
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => this.selectActiveTab('MonthTrending')}>
              <TextI18n style={[styles.text, this.state.activeList == 'MonthTrending' ? styles.activeText : null]}
                        textKey="TRENDING.MONTH"></TextI18n>
              {
                this.state.activeList == 'MonthTrending' ? <View style={styles.activeBar} /> : null
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => this.selectActiveTab('Archive')}>
              <TextI18n style={[styles.text, this.state.activeList == 'Archive' ? styles.activeText : null]}
                        textKey="TRENDING.ARCHIVE"></TextI18n>
              {
                this.state.activeList == 'Archive' ? <View style={styles.activeBar} /> : null
              }
            </TouchableOpacity>
          </View>
          {this.state.isLoading ? <Loading/> :
            <View>
              <TopFuns topFuns={this.state.data.slice(0, 3)}/>
              {this.state.data.length > 3 ?
                <ScrollView>
                  <FollowerList
                    navigation={this.props.navigation}
                    data={this.state.data.slice(3, this.state.data.length)}
                    updateFollowStatus={this.updateFollowStatus.bind(this)}
                    follower={
                      <View style={{flexDirection: 'row'}}>
                        <Icon
                          icon="star"
                          active
                        />
                      </View>
                    }
                  />
                </ScrollView>
                : null}
            </View>
          }
        </View>)
  }
}

const mapStateToProps = state => ({
  usersList: state.organization.membersForRanking,
  followingIDS: state.auth.followingIDS,
});

const mapDispatchToProps = dispatch => ({
  updateFollowCount: (isFollow) => dispatch(updateFollowCount(isFollow)),
  getAllianceRanking: (id) => dispatch(getAllianceRanking(id))
  });

export default connect(mapStateToProps, mapDispatchToProps)(AllianceRankingScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8f8'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    color: '$textColor',
    fontSize: font.sizeH1,
    marginLeft: '43%'
  },
  tabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activeText:{
    color: '$mainColor'
  },
  text: {
    fontSize: font.sizeH2,
    color: '$textColor'
  },
  activeBar:{
    height:2,
    marginLeft: 4,
    width: '80%',
    backgroundColor: '$mainColor'
  },
  tabItem:{
    justifyContent: 'center'
  }
});
