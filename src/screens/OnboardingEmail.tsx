import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackArrowIcon, EyeIcon, EyeOffIcon, RightArrowIcon, WhiteLogo } from '../components/shared/Icons';
import { config } from '../../config';
import { theme } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingEmail'>


const OnboardingEmail = ({ navigation, route }: Props) => {
    const { signUp } = useAuthContext()
    const { firstName, lastName, phoneNumber } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { rootNavigation } = useNavigationContext()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()
    const scrollRef = useRef<ScrollView>()
    const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true)

    const handleNext = async () => {
        setLoading(true)
        setErrorMessage(null)

        if (!email || !password) {
            setErrorMessage('Please enter your email and password')
            setLoading(false)
            return
        }

        try {
            // this is where users are signed up
            await signUp(firstName, lastName, email, phoneNumber, password, true)
            rootNavigation.goBack()
        } catch (error: any) {
            error.code === 'CUSTOMER_DISABLED' && navigation.push('VerifyEmail', { message: error.message })
            typeof error.message === 'string' && setErrorMessage(error.message)
        }
        setLoading(false)
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <BackArrowIcon
                    color={'#4B2D83'}
                    size={20}
                    onPress={() => navigation.goBack()}
                />
            ),
            headerTitle: () => (
                <WhiteLogo />
            )
        });
    }, [])

    const toggle = () => {
        setSecureTextEntry(!secureTextEntry);
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            style={{ flex: 1, }}

        >
            <ScrollView
                scrollEnabled={Platform.OS == 'ios' ? false : true}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                contentContainerStyle={{
                    justifyContent: 'space-between',
                    flex: 1,
                    // backgroundColor: 'yellow', height: '100%', display: 'flex'
                }}
                // style={{ backgroundColor: 'green', height: '100%', }}
                keyboardShouldPersistTaps='never'
            >


                {/* flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6,
        backgroundColor: 'pink',
        paddingBottom: 250,
        height: '100%', */}
                {/* <View style={{ display: 'flex', height: '100%' }}> */}



                <View style={{
                    // backgroundColor: 'pink', 
                    height: '100%', flex: 1
                }}
                // style={styles.container} 
                >

                    {/* top section */}
                    <View style={{
                        // backgroundColor: 'pink', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        // height: 150
                    }} >
                        {/* little top bar things */}
                        <View style={{ width: '90%', height: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                            <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                            <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                            <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                        </View>

                        {/* title */}
                        <View style={{
                            width: '75%',
                            marginBottom: 0,
                            paddingTop: 30,
                            //  backgroundColor: 'yellow'
                        }}>
                            <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 38, fontStyle: 'italic' }}>
                                Sign up with email
                            </Text>
                        </View>
                    </View>


                    {/* bottom section */}
                    <View style={{
                        // backgroundColor: 'green', 
                        flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <View style={{

                            width: '75%'
                        }}>
                            {errorMessage ?
                                (<View style={{ top: 0, justifyContent: 'flex-end', marginBottom: 10, alignItems: 'center' }}>
                                    <Text style={{ color: 'red' }}>{errorMessage}</Text>
                                </View>) : (<View style={{ marginBottom: 30, width: '100%', backgroundColor: 'red' }}></View>)
                            }
                            {/* Input container */}
                            <View style={{ width: '100%', alignItems: 'flex-start', }}>
                                <Text style={styles.inputSubTitle}>
                                    Email
                                </Text>
                                <TextInput
                                    // placeholder="First Name"
                                    placeholderTextColor={theme.colors.disabledText}
                                    onChangeText={setEmail}
                                    value={email}
                                    style={email ? (styles.input) : (styles.inputEmpty)}
                                />
                                <Text style={styles.inputSubTitle}>
                                    Password
                                </Text>
                                <TextInput
                                    // placeholder="Last Name"
                                    placeholderTextColor={theme.colors.disabledText}
                                    onChangeText={setPassword}
                                    value={password}
                                    style={password ? (styles.input) : (styles.inputEmpty)}
                                    secureTextEntry={secureTextEntry}
                                    autoCorrect={false}
                                    numberOfLines={1}
                                />
                                {/* the touchable to toggle pw sight */}
                                <TouchableOpacity onPress={toggle}
                                    style={{ width: 40, height: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 2, bottom: 15, }}>
                                    {secureTextEntry ? (<EyeOffIcon size={30} color={'black'} />) : (<EyeIcon size={30} color={'black'} />)}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{
                            width: '90%', display: 'flex', justifyContent: 'flex-end', flexDirection: 'row',
                            // position: 'absolute',
                            // bottom: 0
                            marginBottom: 40,

                        }}>

                            {loading ?
                                <ActivityIndicator /> :
                                <TouchableOpacity
                                    style={firstName && lastName ? (styles.nextCircle) : (styles.nextCircleEmpty)}
                                    // style={styles.loginContainer}
                                    onPress={handleNext}>
                                    {/* <Text style={styles.loginText}>Next</Text> */}
                                    <RightArrowIcon color='#FFFFFF' size={30} />
                                    <View style={{ marginTop: 10 }}></View>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>





                </View>
            </ScrollView>
            {/* </View> */}
        </KeyboardAvoidingView >
    );
};

export default OnboardingEmail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6,
        // backgroundColor: 'pink',
    },
    image: {
        width: config.logoWidth,
        height: config.logoWidth * config.logoSizeRatio,
        // marginBottom: 48,
    },
    input: {
        // marginTop: 15,
        fontSize: 18,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        padding: 10,
        paddingLeft: 16,
        paddingHorizontal: 4,
        color: theme.colors.text,
        borderWidth: 1,
        borderBottomWidth: 3,
        borderColor: '#4B2D83',
        // marginBottom: 12,
    },
    inputEmpty: {
        fontSize: 18,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        padding: 10,
        paddingLeft: 16,
        paddingHorizontal: 4,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: '#4B2D83',
        // marginBottom: 12,
    },
    loginContainer: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        width: '60%',
        backgroundColor: '#4B2D83',
        alignItems: 'center',
        borderRadius: 10,
        // marginTop: '10%'
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
        // marginBottom: 24
    },
    descText: {
        color: '#3C3C43',
        fontSize: 16,
        fontWeight: '500',
        // marginBottom: 24
    },
    inputSubTitle: {
        color: '#4B2D83',
        fontSize: 14,
        marginLeft: 6,
        marginBottom: 4
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
        // position: 'absolute',
        // bottom: 15,
        width: 60,
        height: 60,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}
)