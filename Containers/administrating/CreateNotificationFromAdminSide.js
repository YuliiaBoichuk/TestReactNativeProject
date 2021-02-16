import React, {Component} from 'react';
import {View, TouchableOpacity, Keyboard} from 'react-native';
import {GVE_Icon as Icon, SmallHeader, TextI18n, GVE_Input} from '../../components/common/index';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import {getConfigItem} from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';

;
import {post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {ScrollView} from "../../components/common/video-player/ScrollView";
import Button from "../../components/common/Button";
import {showModal} from "../../Services/modalService";

const font = getConfigItem('AccessTheme').font;

const getEmptyState = () => {
    return {
        title: '',
        message: '',
    }
}

class CreateNotificationFromAdminSide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: getEmptyState(),
            isKeyboardOpen: false,
        };
        this.inputs = {}
        this.onKeyboardWillShow = (e) => {
            this.setState({isKeyboardOpen: true});
        };
        this.onKeyboardWillHide = (_e) => {
            this.setState({isKeyboardOpen: false});
        };
    }

    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardWillShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardWillHide.bind(this));
        this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
    }

    componentWillUnmount() {
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
        }
        if (this.keyboardWillHideListener) {
            this.keyboardWillHideListener.remove();
        }
    }

    onChange(fieldName, val) {
        this.setState({notification: {...this.state.notification, [fieldName]: val}})
    }

    screenLoad() {
        let navParams = getParams(this.props);
        let personId = navParams.id;
        this.setState({notification: {...this.state.notification, personId: personId}})
    }

    onAccept() {
        const data = this.state.notification
        post('/person/send/push', data)
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(data => {
                console.log(data)
                showModal('alert', {
                    title: "SENDNOTIFICATION.SUCCESS",
                    message: "SENDNOTIFICATION.ONSEND",
                    onOkAction: () => goBack(this.props)
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <SmallHeader
                    leftComponent={
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity style={{marginRight: 8}} onPress={() => goBack(this.props)}>
                                <Icon
                                    name='back'
                                    size={25}
                                    color={EStyleSheet.value('$headerIconColor')}
                                /></TouchableOpacity>
                            <TextI18n style={styles.headerText} textKey="SENDNOTIFICATION.SENDNOTIFICATION"/>
                        </View>}/>
                <ScrollView style={styles.container} contentContainerStyle={{paddingHorizontal: 10}}>
                    <GVE_Input
                        title="SENDNOTIFICATION.TITLE"
                        style={styles.input}
                        placeholder="SENDNOTIFICATION.TITLE"
                        label="SENDNOTIFICATION.TITLE"
                        name='title'
                        value={this.state.notification.title}
                        returnKeyType="next"
                        onChange={title => this.onChange('title', title)}
                        keyboardType='default'
                        underlineColorAndroid='rgba(0,0,0,0)'
                    />
                    <GVE_Input
                        title="SENDNOTIFICATION.MESSAGE"
                        style={styles.input}
                        placeholder="SENDNOTIFICATION.MESSAGE"
                        label="SENDNOTIFICATION.MESSAGE"
                        name='message'
                        value={this.state.notification.message}
                        returnKeyType="next"
                        onChange={message => this.onChange('message', message)}
                        keyboardType='default'
                        underlineColorAndroid='rgba(0,0,0,0)'
                        multiline={true}
                        height={80}
                    />
                    <Button style={styles.button}
                            title='SENDNOTIFICATION.SEND'
                            titleColor={EStyleSheet.value('$btnText')}
                            onPress={() => {
                                this.onAccept()
                            }}
                    />
                </ScrollView>
            </View>
        )
    }
}

export default CreateNotificationFromAdminSide;

const styles = EStyleSheet.create({
    headerText: {
        color: '$headerText',
        fontSize: font.sizeHeader,
    },
    container: {
        backgroundColor: '$mainBgColor',
        flex: 1,
        padding: 10,
    },
    input: {
        width: '100%',
        fontSize: font.sizeP,
        backgroundColor: '$mainBgColor'
    },
    button: {
        width: '100%',
        marginBottom: 20,
        marginTop: '25%'
    },
});


