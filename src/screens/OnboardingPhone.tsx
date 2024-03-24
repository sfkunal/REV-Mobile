import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Keyboard, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackArrow, BackArrowIcon, DownArrowIcon, EyeIcon, LockIcon, RightArrowIcon, WhiteLogo } from '../components/shared/Icons';
import { theme } from '../constants/theme';
import { config } from '../../config';
import { CountryPicker } from "react-native-country-codes-picker";
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';





type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingPhone'>

const OnboardingPhone = ({ navigation, route }: Props) => {
    const { firstName, lastName } = route.params;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()
    const scrollRef = useRef<ScrollView>()

    // // country useState variables
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('');
    // const USA = { "callingCode": ["1"], "cca2": "US", "currency": ["USD"], "flag": "flag-us", "name": "United States", "region": "Americas", "subregion": "North America" }
    // const [countryCode, setCountryCode] = useState('US');
    // const [country, setCountry] = useState(USA);
    // const [isPickerVisible, setPickerVisible] = useState<boolean>(false);


    // const onSelect = (country) => {
    //     setCountryCode(country.cca2);
    //     setCountry(country);
    // };

    // useEffect(() => {
    //     console.log(country);
    //     console.log(isPickerVisible)
    // }, [country])





    const handleNext = () => {
        // TODO do I need a check for length here? 
        // any additional way to validate a phone number
        if (!phoneNumber) {
            setErrorMessage('Please enter your phone number')
            return
        } else if (phoneNumber.length < 9) {
            setErrorMessage('Please enter a valid phone number')
            return
        }
        setErrorMessage(null)
        setLoading(true)

        // make sure that we are grabbing the phone number in the correct format
        // const phoneNumber = phoneToE164(phoneNumber)
        navigation.navigate('OnboardingName', { phoneNumber });
        // navigation.navigate('OnboardingEmail', { firstName, lastName, phoneNumber });
        setLoading(false)
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: -20 }}>
                    <BackArrow
                        color={'#4B2D83'}
                        size={20}
                    />
                </TouchableOpacity>

            ),
            headerTitle: () => (
                <WhiteLogo />
            )
        });
    }, [])


    // formats the phone number to be in the format of (XXX)XXX-XXXX
    const handlePhoneNumberChange = (value) => {
        const cleanedNumber = value.replace(/\D/g, '')
        // clean the phone number
        // replace all non-numbers with nothing. Now we have a string of just numbers
        let formattedNumber = '';

        // if length (0,3] => (XXX)
        if (cleanedNumber.length > 0) {
            formattedNumber = `(${cleanedNumber.slice(0, 3)}`
        }
        if (cleanedNumber.length >= 4) {
            formattedNumber += `) ${cleanedNumber.slice(3, 6)}`;
        }
        if (cleanedNumber.length >= 7) {
            formattedNumber += `-${cleanedNumber.slice(6, 10)}`;
        }
        console.log(phoneToE164(cleanedNumber))
        setPhoneNumber(formattedNumber)
    }

    const phoneToE164 = (number) => {
        return `+1${number}`
    }

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}
            style={{ flex: 1, }}
        >
            <TouchableWithoutFeedback style={{ height: '100%' }} onPress={Keyboard.dismiss}>
                <ScrollView
                    scrollEnabled={Platform.OS == 'ios' ? false : true}
                    showsVerticalScrollIndicator={false}
                    ref={scrollRef}
                    contentContainerStyle={{
                        justifyContent: 'space-between', flex: 1, alignItems: 'center',
                    }}
                    // style={{ display: 'flex', height: '100%', backgroundColor: 'yellow', }}
                    keyboardShouldPersistTaps='always'
                >

                    {/* <View style={{
                    display: 'flex', height: '100%', padding: 0, backgroundColor: 'green'
                    // backgroundColor: 'yellow' 
                }}> */}

                    <View style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 150,
                    }} >
                        {/* little top bar things */}
                        <View style={{ width: '90%', height: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                            <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                            <View style={{ backgroundColor: '#D9D9D9', width: 106, height: 8, borderRadius: 12 }}></View>
                            <View style={{ backgroundColor: '#D9D9D9', width: 106, height: 8, borderRadius: 12 }}></View>
                        </View>

                        {/* title */}
                        <View style={{ width: '90%', marginBottom: 15, marginLeft: 36 }}>
                            <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 38, fontStyle: 'italic', }}>
                                What's your number?
                            </Text>
                        </View>
                    </View>

                    <View style={{

                        flex: 1, justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <View>
                            {errorMessage ?
                                (<View style={{ height: 20, justifyContent: 'flex-end', marginBottom: 20, alignItems: 'center' }}>
                                    <Text style={{ color: 'red' }}>{errorMessage}</Text>
                                </View>) : (<View style={{ height: 40, width: '100%' }}></View>)
                            }
                            <View style={{
                                width: '75%', flexDirection: 'row', display: 'flex', justifyContent: 'space-between',
                                // backgroundColor: 'pink' 
                            }} >
                                {/* country container */}



                                <View >
                                    <Text style={styles.inputSubTitle}>
                                        Country
                                    </Text>
                                    <View style={{ backgroundColor: '#D9D9D9', height: 35, width: 75, flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 }}>
                                        <Text>
                                            US +1
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ width: '70%' }}>
                                    <Text style={styles.inputSubTitle}>
                                        Phone number
                                    </Text>
                                    <TextInput
                                        // placeholder="Phone Number"
                                        placeholderTextColor={theme.colors.disabledText}
                                        style={phoneNumber ? (styles.input) : (styles.inputEmpty)}
                                        autoComplete='tel'
                                        onChangeText={handlePhoneNumberChange}
                                        value={phoneNumber}
                                        keyboardType="phone-pad"
                                        placeholder='(555) 555-5555'
                                    />
                                </View>
                            </View>

                        </View>



                    </View>





                    {/* </View> */}
                    <View style={{
                        // backgroundColor: 'orange',
                        // position: 'absolute',
                        // bottom: Platform.OS === 'ios' ? 30 : 20,
                        // right: 20,
                        width: '90%',
                        // display: 'flex',
                        // justifyContent: 'space-between',
                        // flexDirection: 'row',
                        // marginBottom: 30,
                        // backgroundColor: 'orange',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        // position: 'absolute',
                        bottom: 30,
                        // right: 10,
                        // left: 10,

                        // marginTop: 60
                    }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '70%' }}>
                            {/* eye icon */}
                            <LockIcon size={30} color='black' />
                            <Text style={{ color: 'black', fontSize: 14, marginTop: 4, marginLeft: 4 }}>We never share this with anyone.</Text>

                        </View>
                        {loading ?
                            <ActivityIndicator /> :
                            <TouchableOpacity
                                style={phoneNumber.length > 9 ? (styles.nextCircle) : (styles.nextCircleEmpty)}
                                // style={styles.loginContainer}
                                onPress={handleNext}>
                                {/* <Text style={styles.loginText}>Next</Text> */}
                                <RightArrowIcon color='#FFFFFF' size={30} />
                                <View style={{ marginTop: 10 }}></View>
                            </TouchableOpacity>


                        }
                    </View>
                    {/* </TouchableWithoutFeedback> */}

                </ScrollView>
            </TouchableWithoutFeedback >
        </KeyboardAvoidingView >

    );
};

export default OnboardingPhone;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6,
        // backgroundColor: 'pink',
        // paddingBottom: 250
    },
    image: {
        width: config.logoWidth,
        height: config.logoWidth * config.logoSizeRatio,
        marginBottom: 48,
    },
    input: {
        // marginTop: 15,
        fontSize: 14,
        width: '100%',
        borderRadius: 8,
        height: 38,
        backgroundColor: '#D9D9D9',
        // padding: 10,
        paddingLeft: 16,
        paddingHorizontal: 4,
        color: theme.colors.text,
        borderWidth: 1,
        borderBottomWidth: 3,
        borderColor: '#4B2D83',
    },
    inputEmpty: {
        fontSize: 14,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        // padding: 10,
        height: 36,
        paddingLeft: 16,
        paddingHorizontal: 4,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: '#4B2D83',
    },
    loginContainer: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        width: '60%',
        backgroundColor: '#4B2D83',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: '10%'
    },
    loginText: {
        color: theme.colors.background,
        fontSize: 18,
        letterSpacing: 1,
        fontWeight: '500'
    },
    headerText: {
        color: '#4B2D83',
        fontSize: 40,
        fontWeight: '900',
        marginBottom: 24
    },
    descText: {
        color: '#3C3C43',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 24
    },
    nextCircle: {
        width: 60,
        height: 60,
        borderRadius: 60,
        backgroundColor: '#4B2D83',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    nextCircleEmpty: {
        width: 60,
        height: 60,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputSubTitle: {
        color: '#4B2D83',
        fontSize: 14,
        marginLeft: 6,
        marginBottom: 4
    },
})