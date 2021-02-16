import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import {getConfigItem, setConfigItem} from '../../Services/configService';
import {GVE_Icon as Icon, SmallHeader, TextI18n} from "../../components/common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import Button from "../../components/common/Button";
import deviceStorage from "../../Services/deviceStorage";

const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;

class AnonymousIntroScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {

  }
  goToAnonymous(){
    deviceStorage.saveKey('anonymousFlow', true);
    this.props.navigation.navigate('Anonymous');
  }
  render() {
    return (

      <View style={styles.container}>
          <View style={styles.mainTextContainer}>
            <Icon name="alert-circle" size={35} color={EStyleSheet.value('$mainColor')}/>
            <TextI18n style={styles.mainText} textKey="ANONYMOUS.INTRO.TEXT"/></View>
          <View style={styles.buttonsContainer}>
            <Button style={styles.toLoginBtn} title="COMMON.BUTTONS.RETURN_TO_LOGIN" onPress={goBack}/>
            <Button noBackgroundColor titleColor={EStyleSheet.value('$cancelButton')}
                    title="COMMON.BUTTONS.CONTINUE" onPress={this.goToAnonymous.bind(this)}
                    style={styles.continueBtn}/>
          </View>
      </View>
    );
  }
}

export default AnonymousIntroScreen;

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
  },
  mainTextContainer:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  mainText:{
    fontSize: font.sizeP,
    textAlign: 'center',
  },
  buttonsContainer:{
    paddingHorizontal: 50,
    paddingBottom: 50
  },
  toLoginBtn:{
    width: '100%'
  },
  continueBtn:{
    width: '100%'
  }

});
