import {Expo} from '../Routing';
import deviceStorage from './deviceStorage';
import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import uk from '../i18n/uk';
import ru from '../i18n/ru';
import en from '../i18n/en';
import cn from '../i18n/cn';
import { NativeModules, Platform } from 'react-native';

const WHITELIST = ['ru', 'en', 'cn', 'uk'];
const getDefaultLanguage = () => {
    return deviceStorage.getKey('locale').then(locale=>{
        return new Promise((resolve, reject)=>{
            if(typeof locale === 'string'){
                resolve(locale)
            } else {
                if(Platform.OS === 'web') {
                    resolve(window.navigator.language);
                } else {
                  const locale = Platform.OS === 'ios'
                    ? NativeModules.SettingsManager.settings.AppleLocale
                    : NativeModules.I18nManager.localeIdentifier;
                  console.log(locale.substring(0, 3));
                    // Expo.DangerZone.Localization.getCurrentLocaleAsync().then(lng=>{
                    //     resolve(locale.substring(0, 2)) //ToDo: uncomment this string later
                        resolve('en')
                    // })
                }
            }
        })
    })
};

const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng, (err)=>{
        if (err) return console.log('something went wrong loading', err);
        else deviceStorage.saveLocale(lng);
    });
};

const getCurrentLanguage = async () => {
  return await deviceStorage.getKey('locale')
}

const initLocalization = (successCallback) => {
    getDefaultLanguage().then(lng => {
        let currentLocale = lng.replace('_', '-').split('-').shift();

        // set English if locale of device is different from available <WHITELIST>. Default <EN>
        let defaultLng = WHITELIST.indexOf(currentLocale) >= 0 ? currentLocale : 'en';

        i18n
        //.use(languageDetector)  //*Error: this.services.language Detector.detect is not a function
            .use(reactI18nextModule)
            .init({
                fallbackLng: defaultLng,
                resources: {en,ru,cn,uk},
                whitelist: WHITELIST,
                // nonExplicitWhitelist: true,
                ns: ['localization'],
                defaultNS: 'localization',
                debug: false
            }, (err, t) => {
                if(err) {
                    console.error('Some wrong ', err)
                }
                else {
                    console.log('SYSTEM LOCALIZATION : ', defaultLng.toUpperCase(), 'translate: ', t);
                    deviceStorage.saveLocale(defaultLng);
                    successCallback();
                }
            })
    });
};

export default {
    initLocalization,
    changeLanguage,
  getCurrentLanguage
}
