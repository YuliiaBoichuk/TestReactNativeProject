import React, {Component} from "react";
import {View, TouchableOpacity, ScrollView, Image, Dimensions} from "react-native";
import {TextI18n, Button, GVE_Icon as Icon} from '../../components/common/index';
import {getParams, goBack, navigateTo} from '../../Services/navigationService';
import {getConfigItem} from '../../Services/configService';
import {connect} from 'react-redux';
import {SmallHeader} from "../../components/common/index";
import EStyleSheet from 'react-native-extended-stylesheet';
import {GVE_ImagePicker} from "../../Routing";
import {post} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {selectRole} from "../../redux/actions/auth";


const color = getConfigItem('AccessTheme').color;
const font = getConfigItem('AccessTheme').font;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


class AddMediaToAllianceScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            creativeWorkId: null,
        }

    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
        this.props.navigation.addListener('willBlur', this.screenBlur.bind(this))
    }

    screenLoad() {
        const {creativeWorkId, id} = getParams(this.props);
        this.setState({creativeWorkId: creativeWorkId});
        this.props.setAdministrationRole(`${id}-alliance:admin`)
    }

    screenBlur() {
        const role = this.props.roles.find(item => {
            return item.indexOf('-') < 0;
        })
        this.props.setAdministrationRole(role)
    }

    onImageUpload(formData) {
        console.log(formData)
        this.setState({
            file: formData
        })
    }

    onUploadImage() {
        this.state.file.append('creativeWorkId', this.state.creativeWorkId);
        this.state.file.append('mediaObjectType', 3);
        post('/filemanager/uploadfile/organization', this.state.file, {'Content-Type': 'multipart/form-data'})
            .then(checkHttpStatus)
            .then(parseJSON)
            .then(data => {
                console.log('SUCCESS', data);
                const {isBand} = getParams(this.props);
                if(isBand){
                    navigateTo('band')
                }else {
                  navigateTo('company')
                }
            })
            .catch(error => {
                alert('Error. Try again later')
            })
    }

    // todo Bohdan new place of upload images, handle image uri
    render() {
        const image = this.state && this.state.file && this.state.file._parts && this.state.file._parts[0]
            && this.state.file._parts[0][1] && this.state.file._parts[0][1].uri || '';
        return (
            <View style={styles.container}>
                <SmallHeader
                    leftComponent={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity style={{width: '5%'}} onPress={() => goBack(this.props)}>
                                <Icon
                                    name='back'
                                    size={25}
                                    color={EStyleSheet.value('$headerIconColor')}
                                />
                            </TouchableOpacity>
                            <View style={[{width: '95%'}, styles.headerTextWrap]}>
                                <TextI18n style={styles.headerText} textKey="ALLIANCE.ADD_MEDIA_FILE"/>
                            </View>
                        </View>
                    }
                />
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.contentInner}>
                        <GVE_ImagePicker
                            style={styles.imagePicker}
                            containerStyle={styles.imagePickerContainer}
                            styles={styles.imagePickerButton}
                            iconStyle={styles.imagePickerIconStyle}
                            iconName={"add-image"}
                            iconSize={26}
                            title='COMMON.ADD_PHOTO'
                            titleColor={EStyleSheet.value('$mainColor')}
                            rounded
                            imageUrl={image}
                            hidePlayIcon={false}
                            accept=".jpg,.jpeg,.png"
                            isImageAutoPublish={true}
                            onStartUpload={() => this.setState({isPreloader: true})}
                            onError={() => this.setState({isPreloader: false})}
                            onSuccess={(data) => {
                                this.onImageUpload(data)
                            }}
                            upload={false}
                        />
                        <Button
                            style={styles.button}
                            title='COMMON.ACCEPT'
                            disabled={!this.state.file}
                            titleColor={EStyleSheet.value('$btnText')}
                            onPress={() => this.onUploadImage()}
                        />
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    roles: state.auth.role,
});

const bindActions = dispatch => ({
    setAdministrationRole: (role) => dispatch(selectRole(role))
});

export default connect(mapStateToProps, bindActions)(AddMediaToAllianceScreen);

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '$genBackgroundColor',
    },
    headerTextWrap: {
        display: 'flex',
        alignItems: 'center',
    },
    headerText: {
        color: '$headerText',
        fontSize: font.sizeHeader,
    },
    content: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentInner: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        width: '90%',
    },
    input: {
        width: '100%',
    },
    imagePicker: {
        display: 'flex',
        marginVertical: 20
    },
    imagePickerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePickerButton: {
        backgroundColor: 'transparent',
        width: 'auto',
    },
    imagePickerIconStyle: {
        borderWidth: 0,
        width: 45,
        height: 45,
    },
    button: {
        width: '100%',
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
    },
    required: {
        color: 'red',
        alignSelf: 'flex-start'
    }
});
