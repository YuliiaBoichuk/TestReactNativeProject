import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { GVE_Icon as Icon, SmallHeader, TextI18n, GVE_Input } from '../../components/common/index';
import {getParams, goBack} from '../../Services/navigationService';
import { getConfigItem } from '../../Services/configService';
import EStyleSheet from 'react-native-extended-stylesheet';
import {connect} from 'react-redux';
import {getWithParams, post, put} from "../../redux/actions/http-request";
import {checkHttpStatus, parseJSON} from "../../utils/index";
import {ProductTypes} from "../../constants/product.types";
import { SvgCss  } from 'react-native-svg';
import {Gifts} from "../../constants/gifts.enum";
import {showModal} from "../../Services/modalService";
import {OfferEntityTypes} from "../../constants/offerEntity.types";
import {ScrollView} from "../../components/common/video-player/ScrollView";
import Button from "../../components/common/Button";
import i18n from 'i18next';
const window = Dimensions.get('window');


const font = getConfigItem('AccessTheme').font;

const getEmptyState = () => {
  return{
    name: '',
    description: '',
    price: 0,
    availability: null,
    validFrom: null,
    validTo: null,
    currency: "USD",
    title: null,
    entityId: null,
    offerEntityType: 0,
    baseEventId: null,
    products: []
  }
}

class OfferEditScreen extends Component {
  constructor(props){
    super(props);
    this.state={
      offer: getEmptyState(),
      isAddOrModifyProduct: false,
      isSaved: false,
      modifiedProduct: null
    }
    this.inputs={}
    this.offerEntityTypes = [];
    this.offerEntityTypeNames = [];
    this.offerEntityTypeIds = [];
    this.productNames=[]
    this.productIds=[]
    for (const key in OfferEntityTypes) {
      this.offerEntityTypes.push({key: i18n.t('EDITOFFER.TYPES.'+key), value: OfferEntityTypes[key]})
      this.offerEntityTypeNames[OfferEntityTypes[key]] = i18n.t('EDITOFFER.TYPES.'+key);
      this.offerEntityTypeIds[i18n.t('EDITOFFER.TYPES.'+key)] = OfferEntityTypes[key];
    }
    this.props.products.map((product) => {
      this.productNames[product.id] = product.name;
      this.productIds[product.name] = product.id
    })
  }
  componentDidMount() {
    
    this.props.navigation.addListener('willFocus', this.screenLoad.bind(this))
  }
  onChange(fieldName, val){
    this.onModify()
    this.setState({offer: {...this.state.offer, [fieldName]: val}})
  }
  getOfferEntityType(){
    let rList = [];
    if (this.offerEntityTypes) {
      this.offerEntityTypes.map((item, index) => {
        rList.push(item.key);
      });
    }
    return rList;
  }
  getProducts(){
    let rList = [];
    if (this.props.products) {
      this.props.products.map((item, index) => {
        rList.push(item.name);
      });
    }
    return rList;
  }
  dateFormat(isostring) {
    if (isostring) {
      let date = new Date(isostring);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let dt = date.getDate();
      if (dt < 10) {
        dt = '0' + dt;
      }
      if (month < 10) {
        month = '0' + month;
      }
      return dt + '.' + month + '.' + year;
    }
  }
  
  screenLoad() {
    let navParams = getParams(this.props);
    this.setState({offer: navParams &&navParams.offer || getEmptyState()})
  }
  getProductInfoFromId(id){
    return this.props.products.find(item => {
      return item.id == id
    })
  }
  addProduct(){
    this.onModify()
    this.setState({isAddOrModifyProduct:true,
      modifiedProduct:{productId: null, quantity: 0, position:this.state.offer.products.length+1}})
  }
  changeProduct(position){
    const product = this.state.offer.products.find((product)=> {
      return product.position == position
    })
    this.setState({isAddOrModifyProduct:true,
      modifiedProduct:{productId: product.productId, quantity: product.quantity, position:position}})
  }
  deleteProduct(position){
    this.onModify()
    const existProductIndex = this.state.offer.products.findIndex((existProduct) =>{
      return existProduct.position == position
    });
    const modifiedProducts = [...this.state.offer.products];
    modifiedProducts.splice(existProductIndex,1);
    this.setState({offer:{...this.state.offer, products: modifiedProducts}})
  }
  onModifyProduct(fieldName, value){
    this.onModify()
    this.setState({modifiedProduct: {...this.state.modifiedProduct, [fieldName]: value}})
  }
  discardProduct(){
    this.setState({isAddOrModifyProduct: false, modifiedProduct: null})
  }
  applyProduct(){
    this.onModify()
    const existProductIndex = this.state.offer.products.findIndex((existProduct) =>{
      return existProduct.position == this.state.modifiedProduct.position
    });
    if(existProductIndex>-1){
      const modifiedProducts = [...this.state.offer.products];
      modifiedProducts[existProductIndex] = this.state.modifiedProduct;
      this.setState({isAddOrModifyProduct: false,
        offer:{...this.state.offer, products:modifiedProducts,
        modifiedProduct: null}});
    }else {
      this.setState({isAddOrModifyProduct: false,
        offer:{...this.state.offer, products: [...this.state.offer.products, this.state.modifiedProduct]},
        modifiedProduct: null});
    }
    
  }
  getTotalPrice(){
    let price = 0;
    this.state.offer.products.map((product) => {
      if(this.state.modifiedProduct && product.position ==this.state.modifiedProduct.position){
        const storeProduct = this.getProductInfoFromId(this.state.modifiedProduct.productId);
        price += ((storeProduct.price ||0)*this.state.modifiedProduct.quantity);
      }else {
        const storeProduct = this.getProductInfoFromId(product.productId);
        price += ((storeProduct.price ||0)*product.quantity);
      }
    })
    return price + '$'
  }
  onModify(){
    this.setState({isSaved: false})
  }
  saveChanges(){
    if(this.state.offer.products.length<1){
      showModal('alert',{
        message: 'EDITOFFER.NOPRODUCTS'})
      return;
    }
    let navParams = getParams(this.props);
    if(navParams.isEdit){
      put('/offer', this.state.offer)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then((data)=>{
          this.setState({isSaved: true})
          console.log(data)
        })
        .catch((error) => {
          console.log(error)
        })
    }else if(navParams.isCreate){
      post('/offer', this.state.offer)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then((data)=>{
          this.setState({isSaved: true})
          console.log(data)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
  renderModify(){
    return(
      <View style={[styles.addProductContainer, styles.addProductContainerOuter]}>
        <View style={styles.addProductContainer}>
          <GVE_Input
            style={{width: '100%'}}
            title="EDITOFFER.SELECTPRODUCT"
            rightComponent={<Icon name="arrow-down" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
            autoFocus={false}
            picker onTouchEnd={() => (
            showModal('pickerModal', {
              title: "EDITOFFER.SELECTPRODUCT",
              gradientShow: false,
              onOkAction: (data) => this.onModifyProduct('productId', this.productIds[data]),
              selectedValue: this.state.modifiedProduct.productId ? this.productNames[this.state.modifiedProduct.productId] : this.productNames['0'],
              pickerData: this.getProducts(),
              style: {
                height: 380,
                borderBottomWidth: 1,
                borderBottomColor: EStyleSheet.value('$mainColor'),
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                top: (window.height / 2) - (380 / 2),
                marginBottom: 'auto'
                //backgroundColor: color.secondaryTextColor
              }
            })
          )}
            value={this.state.modifiedProduct.productId ? this.productNames[this.state.modifiedProduct.productId] : this.productNames['0']}
            placeholder="Select product"
          />
          <GVE_Input
            title="EDITOFFER.COUNT"
            style={styles.input}
            placeholder="EDITOFFER.COUNT"
            label="Count"
            name='count'
            value={this.state.modifiedProduct.quantity.toString()}
            returnKeyType="next"
            onChange={price => this.onModifyProduct('quantity', price)}
            keyboardType='decimal-pad'
            underlineColorAndroid='rgba(0,0,0,0)'
            onRef={(ref) => {
              this.inputs['Quantity'] = ref
            }}
          />
        </View>
        <View>
          <Button style={styles.applyBtn} title="EDITOFFER.APPLY" onPress={this.applyProduct.bind(this)}/>
          <Button style={styles.cancelBtn}
                  title="EDITOFFER.CANCEL"
                  noBackgroundColor
                  titleColor={EStyleSheet.value('$cancelButton')}
                  onPress={this.discardProduct.bind(this)}/>

        </View>
      </View>
    )

  }
  renderProductIconAndName(product){
    const productInfo = this.getProductInfoFromId(product.productId)
    switch (productInfo.productType){
      case ProductTypes.Coin:
        return (this.renderCoins(productInfo))
        break;
      case ProductTypes.Gift:
        return (this.renderGifts(productInfo))
    }
  }
  renderCoins(product){
    return(
      <View style={styles.coinsContainer}>
        <Icon size={30} name="coin" color="#FFD700"></Icon><TextI18n style={styles.blackText} textKey="EDITOFFER.COINS"/>
      </View>
    )
  }
  renderGifts(product){
    const gift = Gifts.find((gift) => {return gift.id == product.productTypeEntityId});
    return(
      <View style={styles.giftsContainer}>
        
        <View style={styles.giftImage}>
          <SvgCss xml={gift.image} width="100%" height="100%" />
        </View>
        <Text style={styles.blackText} >{gift.name}</Text>
      </View>
    )
  }
  renderProductList(){
    return(
      <View>
        {this.state.offer.products.map((item, index) => (
          <View style={styles.productItem}>
            <View>
              {this.renderProductIconAndName(item)}
            </View>
            <View>
              <Text>{item.quantity}</Text>
            </View>
            <View style={styles.modificationProductContainer}>
              <TouchableOpacity onPress={() => this.changeProduct(item.position)}>
                <Icon
                  name='edit'
                  size={25}
                  color={EStyleSheet.value('$detailEditorDateIcon')}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.deleteProduct(item.position)}>
                <Icon
                  name='trash'
                  size={25}
                  color={EStyleSheet.value('$detailEditorDateIcon')}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    )
  }
  
  render(){
    return (
      <View style={{flex: 1}}>
        <SmallHeader
          leftComponent={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={{marginRight:8}} onPress={() => goBack(this.props)} >
                <Icon
                  name='back'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                /></TouchableOpacity>
              <TextI18n style={styles.headerText} textKey="EDITOFFER.HEADER"/>
            </View>}/>
        <ScrollView style={styles.container} contentContainerStyle={{paddingHorizontal:10}}>
          <GVE_Input
            title="EDITOFFER.NAME"
            style={styles.input}
            placeholder="EDITOFFER.NAME"
            label="Name"
            name='name'
            value={this.state.offer.name}
            returnKeyType="next"
            onChange={name => this.onChange('name', name)}
            keyboardType='default'
            underlineColorAndroid='rgba(0,0,0,0)'
            onRef={(ref) => {
              this.inputs['name'] = ref
            }}
          />
          <GVE_Input
            title="EDITOFFER.PRICE"
            style={styles.input}
            placeholder="EDITOFFER.PRICE"
            label="Price"
            name='price'
            value={this.state.offer.price.toString()}
            returnKeyType="next"
            onChange={price => this.onChange('price', price)}
            keyboardType='decimal-pad'
            underlineColorAndroid='rgba(0,0,0,0)'
            onRef={(ref) => {
              this.inputs['price'] = ref
            }}
          />
          <GVE_Input
            title="EDITOFFER.CURRENCY"
            style={styles.input}
            placeholder="EDITOFFER.CURRENCY"
            label="Currency"
            name='currency'
            value={this.state.offer.currency}
            returnKeyType="next"
            onChange={currency => this.onChange('currency', currency)}
            keyboardType='default'
            underlineColorAndroid='rgba(0,0,0,0)'
            onRef={(ref) => {
              this.inputs['currency'] = ref
            }}
          />
          <GVE_Input
            style={{width: '100%'}}
            title="EDITOFFER.VALIDFROM"
            rightComponent={<Icon name="calendar" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
            autoFocus={false}
            picker onTouchEnd={()=>(
            showModal('datepickerModal', {
              gradientShow:false,
              onOkAction: (data) => this.onChange('validFrom', data),
              minimumDate: new Date(),
              maximumDate:new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
              date: (this.state.offer.validFrom ? new Date(this.state.offer.validFrom) : new Date()),
              style:{
                height: 340,
                borderBottomWidth: 1,
                borderBottomColor: EStyleSheet.value('$mainColor'),
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                top: (window.height/2)-(340/2),
                marginBottom: 'auto'
                //backgroundColor: color.secondaryTextColor
              }
            })
          )}
            value={this.state.offer.validFrom ? this.dateFormat(this.state.offer.validFrom) : new Date()}
            //placeholder="COMMON.PLACEHOLDERS.BIRTHDATE"
            placeholder={i18n.t('COMMON.DATEPLACEHOLDER')}
          />
          <GVE_Input
            style={{width: '100%'}}
            title="EDITOFFER.VALIDTO"
            rightComponent={<Icon name="calendar" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
            autoFocus={false}
            picker onTouchEnd={()=>(
            showModal('datepickerModal', {
              gradientShow:false,
              onOkAction: (data) => this.onChange('validTo', data),
              minimumDate: new Date(),
              maximumDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
              date: (this.state.offer.validTo ? new Date(this.state.offer.validTo) : new Date()),
              style:{
                height: 340,
                borderBottomWidth: 1,
                borderBottomColor: EStyleSheet.value('$mainColor'),
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                top: (window.height/2)-(340/2),
                marginBottom: 'auto'
                //backgroundColor: color.secondaryTextColor
              }
            })
          )}
            value={this.state.offer.validTo ? this.dateFormat(this.state.offer.validTo) : new Date()}
            //placeholder="COMMON.PLACEHOLDERS.BIRTHDATE"
            placeholder={i18n.t('COMMON.DATEPLACEHOLDER')}
          />
          <GVE_Input
            style={{width: '100%'}}
            title="EDITOFFER.FORWHOM"
            rightComponent={<Icon name="arrow-down" color={EStyleSheet.value('$detailEditorDateIcon')}/>}
            autoFocus={false}
            picker onTouchEnd={()=>(
            showModal('pickerModal', {
              title:"EDITOFFER.FORWHOM",
              gradientShow:false,
              onOkAction: (data) => this.onChange('offerEntityType', this.offerEntityTypeIds[data]),
              selectedValue: this.state.offer.offerEntityType ? this.offerEntityTypeNames[this.state.offer.offerEntityType] : this.offerEntityTypeNames['0'],
              pickerData: this.getOfferEntityType(),
              style:{
                height: 380,
                borderBottomWidth: 1,
                borderBottomColor: EStyleSheet.value('$mainColor'),
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                top: (window.height/2)-(380/2),
                marginBottom: 'auto'
                //backgroundColor: color.secondaryTextColor
              }
            })
          )}
            value={this.state.offer.offerEntityType ? this.offerEntityTypeNames[this.state.offer.offerEntityType] : this.offerEntityTypeNames['0']}
            placeholder="EDITOFFER.FORWHOM"
          />
          <View style={styles.productContainer}>
            <View style={styles.productHeader}>
              <TextI18n style={styles.productHeaderText} textKey="EDITOFFER.PRODUCTS"/>
              <TouchableOpacity onPress={() => this.addProduct()}>
                <Icon
                  name='plus'
                  size={25}
                  color={EStyleSheet.value('$headerIconColor')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.productList}>
              {this.renderProductList()}
            </View>
            {this.state.isAddOrModifyProduct? this.renderModify(): null}
            <View style={styles.totalContainer}>
              <TextI18n textKey="EDITOFFER.TOTAL" style={styles.totalText}/>
              <Text style={styles.totalText}>{this.getTotalPrice()}</Text>
            </View>
          </View>
          <Button title={this.state.isSaved?"COMMON.BUTTONS.SAVED_CHANGES":"COMMON.BUTTONS.SAVE"} style={styles.saveBtn} onPress={this.saveChanges.bind(this)}/>

        </ScrollView>
      </View>
    )
  }
}
const mapStateToProps = state => ({
  products: state.offersReducer.products
});

export default connect(mapStateToProps, null)(OfferEditScreen);

const styles = EStyleSheet.create({
  headerText: {
    color: '$headerText',
    fontSize: font.sizeHeader,
    marginLeft: 10
  },
  container:{
    backgroundColor:'$mainBgColor'
  },
  productContainer:{
    borderWidth:1,
    borderColor: '$timelineCardBorder',
    borderRadius: 10,
    padding:5,
    marginVertical:5
  },
  productHeader:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom:5
  },
  productHeaderText:{
    fontSize: font.sizeP,
    fontWeight: "bold",
    color: '$headerText'
  },
  productList:{
  
  },
  productItem:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8ED',
    height: 35,
    marginTop:8,
    alignItems: 'center'
  },
  giftsContainer:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  coinsContainer:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  giftImage:{
    height:30,
    width:30
  },
  blackText: {
    color: '$headerText'
  },
  addProductContainer:{
    flexDirection:'column'
  },
  input: {
    width: '100%',
    // height: 25
    fontSize: font.sizeP,
    backgroundColor: '$mainBgColor'
  },
  applyBtn:{
    width: '100%'
  },
  cancelBtn:{
    width: '100%'
  },
  saveBtn:{
    width:'100%'
  },
  modificationProductContainer:{
    flexDirection: 'row'
  },
  addProductContainerOuter:{
  
  },
  totalContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:10
  },
  totalText:{
    fontSize: font.sizeP,
    fontWeight: "bold",
    color: '$headerText'
  }
});


