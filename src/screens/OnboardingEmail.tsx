import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackArrowIcon, EyeIcon, RightArrowIcon, WhiteLogo } from '../components/shared/Icons';
import { config } from '../../config';
import { theme } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingEmail'>


const OnboardingEmail = ({ navigation, route }: Props) => {
    const { signUp } = useAuthContext()
    const { firstName, lastName, phoneNumber } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    const { rootNavigation } = useNavigationContext()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()
    const scrollRef = useRef<ScrollView>()

    const handleNext = async () => {
        setLoading(true)
        setErrorMessage(null)

        if (!email || !password || !verifyPassword) {
            setErrorMessage('Please enter your email and password')
            setLoading(false)
            return
        }

        if (password != verifyPassword) {
            setErrorMessage('Please make sure that passwords match')
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

    return (
        // <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        //     keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        //     style={{ flex: 1, }}>
        <View style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'pink' }}>


            {/* <ScrollView
            scrollEnabled={Platform.OS == 'ios' ? true : true}
            showsVerticalScrollIndicator={false}
            ref={scrollRef}
            contentContainerStyle={{ justifyContent: 'space-between', flex: 1, paddingBottom: 120 }}
            // style={{ display: 'flex', height: '100%', backgroundColor: 'yellow', }}
            keyboardShouldPersistTaps='never'
        > */}
            {/* <View style={{ display: 'flex', height: '100%' }}> */}

            {/* top section */}
            <View style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                height: 150,
                // backgroundColor: 'pink'
            }}>
                {/* little top bar things */}
                <View style={{ width: '90%', height: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                    <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                    <View style={{ backgroundColor: '#4B2D83', width: 106, height: 8, borderRadius: 12 }}></View>
                </View>


                {/* Title */}
                <View style={{ width: '75%', marginBottom: 15, paddingTop: 32 }}>
                    <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 38, fontStyle: 'italic' }}>
                        Sign up with email
                    </Text>
                </View>
            </View>

            {/* bottom section */}
            <ScrollView
                scrollEnabled={Platform.OS == 'ios' ? true : true}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
                contentContainerStyle={{ justifyContent: 'space-between', flex: 1, paddingBottom: 120 }}
                // style={{ display: 'flex', height: '100%', backgroundColor: 'yellow', }}
                keyboardShouldPersistTaps='never'
            >
                <View style={{
                    flex: 1,
                    // backgroundColor: 'orange',
                    justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'orange', height: 4
                }}>

                    {/* input container */}
                    <View style={{
                        width: '75%', backgroundColor: 'yellow'
                    }}>
                        {errorMessage ?
                            (<View style={{ height: 20, justifyContent: 'flex-end', marginBottom: 20, alignItems: 'center' }}>
                                <Text numberOfLines={1}
                                    style={{ color: 'red' }}>{errorMessage}</Text>
                            </View>) : (<View style={{ height: 40, width: '100%' }}></View>)
                        }
                        <Text style={styles.inputSubTitle}>
                            Email
                        </Text>
                        <TextInput
                            onChangeText={setEmail}
                            placeholderTextColor={theme.colors.disabledText}
                            style={email ? (styles.input) : (styles.inputEmpty)}
                            value={email}
                            autoComplete='email'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={styles.inputSubTitle}>
                            Password
                        </Text>
                        <TextInput
                            onChangeText={setPassword}
                            placeholderTextColor={theme.colors.disabledText}
                            style={password ? (styles.input) : (styles.inputEmpty)}
                            value={password}
                            autoComplete='email'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            secureTextEntry
                            autoCorrect={false}
                        />
                        <Text style={styles.inputSubTitle}>
                            Confirm Password
                        </Text>
                        <TextInput
                            onChangeText={setVerifyPassword}
                            placeholderTextColor={theme.colors.disabledText}
                            style={verifyPassword ? (styles.input) : (styles.inputEmpty)}
                            value={verifyPassword}
                            autoComplete='email'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            secureTextEntry
                        />
                    </View>

                    <View style={{ width: '90%', display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 20 }}>
                        {loading ?
                            <TouchableOpacity style={styles.nextCircle}>
                                <ActivityIndicator />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                style={email && password ? (styles.nextCircle) : (styles.nextCircleEmpty)}
                                // style={styles.loginContainer}
                                onPress={handleNext}>
                                {/* <Text style={styles.loginText}>Next</Text> */}
                                <RightArrowIcon color='#FFFFFF' size={30} />
                                <View style={{ marginTop: 10 }}></View>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </ScrollView>
        </View>

        // </KeyboardAvoidingView>
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
        marginBottom: 48,
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
        marginBottom: 12,
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
        borderColor: '#4B2D83', marginBottom: 12,
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