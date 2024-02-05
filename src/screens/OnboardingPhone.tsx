import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { LoginStackParamList } from '../types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackArrowIcon } from '../components/shared/Icons';
import { theme } from '../constants/theme';
import { config } from '../../config';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingPhone'>

const OnboardingPhone = ({ navigation, route }: Props) => {
    const { firstName, lastName } = route.params;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()
    const scrollRef = useRef<ScrollView>()


    const handleNext = () => {
        if (!phoneNumber) {
            setErrorMessage('Please enter your phone number')
            return
        }
        setErrorMessage(null)
        setLoading(true)
        navigation.navigate('OnboardingEmail', { firstName, lastName, phoneNumber });
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
                    <Text style={styles.headerText}>Contact</Text>
                    <Text style={styles.descText}>Can we get your digits?📲</Text>
                    {errorMessage &&
                        <View style={{ height: 20, justifyContent: 'flex-end' }}>
                            <Text style={{ color: 'red' }}>{errorMessage}</Text>
                        </View>
                    }
                    <TextInput
                        placeholder="Phone Number"
                        placeholderTextColor={theme.colors.disabledText}
                        style={styles.input}
                        autoComplete='tel'
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                        keyboardType="phone-pad"
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

export default OnboardingPhone;

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
})