import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackArrowIcon } from '../components/shared/Icons';
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
            setErrorMessage('Please make sure that passwords match. Try again.')
            setLoading(false)
            return
        }

        try {
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
        });
    }, [])

    return (
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'position' : 'height'} >
            <ScrollView
                scrollEnabled={Platform.OS == 'ios' ? false : true}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
            >
                <View style={styles.container} >
                    <Text style={styles.headerText}>Account Setup</Text>
                    <Text style={styles.descText}>You're almost there!😄</Text>
                    {errorMessage &&
                        <View style={{ height: 20, justifyContent: 'flex-end' }}>
                            <Text style={{ color: 'red' }}>{errorMessage}</Text>
                        </View>
                    }
                    <TextInput
                        placeholder="Email"
                        onChangeText={setEmail}
                        placeholderTextColor={theme.colors.disabledText}
                        style={styles.input}
                        value={email}
                        autoComplete='email'
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        placeholder="Password"
                        onChangeText={setPassword}
                        placeholderTextColor={theme.colors.disabledText}
                        style={styles.input}
                        value={password}
                        autoComplete='email'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        secureTextEntry
                    />
                    <TextInput
                        placeholder="Confirm Password"
                        onChangeText={setVerifyPassword}
                        placeholderTextColor={theme.colors.disabledText}
                        style={styles.input}
                        value={verifyPassword}
                        autoComplete='email'
                        keyboardType="email-address"
                        autoCapitalize="none"
                        secureTextEntry
                    />
                    {loading ?
                        <ActivityIndicator /> :
                        <TouchableOpacity style={styles.loginContainer} onPress={handleNext}>
                            <Text style={styles.loginText}>Next</Text>
                        </TouchableOpacity>
                    }
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default OnboardingEmail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 100
    },
    image: {
        width: config.logoWidth,
        height: config.logoWidth * config.logoSizeRatio,
        marginBottom: 48,
    },
    input: {
        marginTop: 15,
        fontSize: 18,
        width: '85%',
        borderRadius: 12,
        backgroundColor: '#D9D9D9',
        padding: 10,
        paddingLeft: 16,
        paddingHorizontal: 4,
        color: theme.colors.text
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
    }
}
)