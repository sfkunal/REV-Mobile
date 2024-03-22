// OnboardingName.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginStackParamList } from '../types/navigation';
import { BackArrowIcon, EyeIcon, RightArrowIcon, WhiteLogo } from '../components/shared/Icons';
import { theme } from '../constants/theme';
import { config } from '../../config';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingName'>

const OnboardingName = ({ navigation, route }: Props) => {
    const { phoneNumber } = route.params;
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

        // navigation.navigate('OnboardingPhone', { firstName, lastName });
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
            headerTitle: () => (
                <WhiteLogo />
            )
        });
        if (firstName && lastName) {
            setErrorMessage(null)
        }
    }, [])

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
                keyboardShouldPersistTaps='always'
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
                            <View style={{ backgroundColor: '#D9D9D9', width: 106, height: 8, borderRadius: 12 }}></View>
                        </View>

                        {/* title */}
                        <View style={{
                            width: '75%',
                            marginBottom: 0,
                            paddingTop: 30,
                            //  backgroundColor: 'yellow'
                        }}>
                            <Text style={{ fontWeight: '900', color: '#4B2D83', fontSize: 38, fontStyle: 'italic' }}>
                                What's your name?
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
                                    First
                                </Text>
                                <TextInput
                                    // placeholder="First Name"
                                    placeholderTextColor={theme.colors.disabledText}
                                    autoComplete='given-name'
                                    onChangeText={setFirstName}
                                    value={firstName}
                                    style={firstName ? (styles.input) : (styles.inputEmpty)}
                                />
                                <Text style={styles.inputSubTitle}>
                                    Last
                                </Text>
                                <TextInput
                                    // placeholder="Last Name"
                                    placeholderTextColor={theme.colors.disabledText}
                                    autoComplete='family-name'
                                    onChangeText={setLastName}
                                    value={lastName}
                                    style={lastName ? (styles.input) : (styles.inputEmpty)}
                                />
                            </View>
                        </View>





                        <View style={{
                            width: '90%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row',
                            // position: 'absolute',
                            // bottom: 0
                            marginBottom: 40,

                        }}>

                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                {/* eye icon */}
                                <EyeIcon size={30} color='black' />
                                <Text style={{ color: 'black', fontSize: 14, marginTop: 4, marginLeft: 4 }}>This will be seen by REV staff.</Text>

                            </View>
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

export default OnboardingName;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6,
        paddingBottom: 250,
        height: '100%',
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
        marginBottom: 6,
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
        marginBottom: 6,
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
        justifyContent: 'center',
        marginTop: -5
    },
    nextCircleEmpty: {
        width: 60,
        height: 60,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -5
    }
})