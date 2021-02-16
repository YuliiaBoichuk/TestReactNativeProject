import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import { Router, Switch, Link, Route } from '../../Routing';
import {connect} from 'react-redux';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import {getConfigItem, setConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, SmallHeader, TextI18n} from "../../components/common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import {cleanQuestResultsForPerson} from "../../redux/actions/questAction";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

class AdminProfileSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      personId: null
    }
  }
  
  componentDidMount() {
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this));
  
  }
  screenLoad(){
    console.log(this.props);
    let navParams = getParams(this.props);
    this.setState({personId: navParams && navParams.id || null})
  }
  resetQuestResult(){
    this.props.cleanQuestResultsForPerson(this.state.personId)
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
              <TextI18n textKey={'COMMON.ADMINISTERINGUSER'} style={styles.headerText} />
            </View>
          } />
        <View style={styles.settingItemsContainer}>
          <TouchableOpacity style={styles.settingItem} onPress={() => this.resetQuestResult()}>
            <TextI18n textKey={'ADMINISTRATING_USER.CLEANQUESTRESULTS'} style={styles.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigateTo('createNotificationFromAdminSide', {id: this.state.personId})}>
            <TextI18n textKey={'ADMINISTRATING_USER.SENDNOTIFICATION'} style={styles.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const mapStateToProps = state => ({

});
const bindActions = dispatch => ({
  cleanQuestResultsForPerson: (personId) => dispatch(cleanQuestResultsForPerson(personId)),
});
export default connect(mapStateToProps, bindActions)(AdminProfileSettings);

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
    fontSize: font.sizeH1,
    marginLeft: 10,
    marginBottom: 5,
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
