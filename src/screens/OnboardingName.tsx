// OnboardingName.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../components/shared/Icons';
import { theme } from '../constants/theme';
import { config } from '../../config';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingName'>

const OnboardingName = ({ navigation }: Props) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const scrollRef = useRef<ScrollView>()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>()


    const handleNext = () => {
        if (!firstName || !lastName) {
            setErrorMessage('Please enter your first and last name')
            return
        }
        setErrorMessage(null)
        setLoading(true)
        // console.log(firstName, lastName)
        navigation.navigate('OnboardingPhone', { firstName, lastName });
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
        if (firstName && lastName) {
            setErrorMessage(null)
        }
    }, [])

    return (
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'position' : 'height'} >
            <ScrollView
                scrollEnabled={Platform.OS == 'ios' ? false : true}
                showsVerticalScrollIndicator={false}
                ref={scrollRef}
            >
                <View style={styles.container} >
                    <Text style={styles.headerText}>Welcome👋</Text>
                    <Text style={styles.descText}>What should we call you?</Text>
                    {errorMessage &&
                        <View style={{ height: 20, justifyContent: 'flex-end' }}>
                            <Text style={{ color: 'red' }}>{errorMessage}</Text>
                        </View>
                    }
                    <TextInput
                        placeholder="First Name"
                        placeholderTextColor={theme.colors.disabledText}
                        autoComplete='given-name'
                        onChangeText={setFirstName}
                        value={firstName}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Last Name"
                        placeholderTextColor={theme.colors.disabledText}
                        autoComplete='family-name'
                        onChangeText={setLastName}
                        value={lastName}
                        style={styles.input}
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

export default OnboardingName;

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