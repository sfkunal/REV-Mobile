import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image } from 'react-native'
import React, { useEffect } from 'react'
import { theme } from '../constants/theme'
import { ProfileStackParamList } from '../types/navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Entypo } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigationContext } from '../context/NavigationContext'
import { useAuthContext } from '../context/AuthContext'
import * as WebBrowser from 'expo-web-browser'
import { config } from '../../config'
import phone from '../../assets/phone.png'
import { MailIcon, RightArrowIcon } from '../components/shared/Icons'

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>

const SettingsPage = ({ navigation }: Props) => {
    const { userToken, signOut } = useAuthContext()
    const { rootNavigation } = useNavigationContext()

    // useEffect(() => {
    //   navigation.setOptions({
    //     headerRight: () => (
    //       <>
    //         {userToken ?
    //           <TouchableOpacity onPress={() => signOut()}>
    //             <Text style={styles.textButton}>LOG OUT</Text>
    //           </TouchableOpacity> :
    //           <TouchableOpacity onPress={() => rootNavigation.push('LoginStackNavigator', { screen: 'Login' })}>
    //             <Text style={styles.textButton}>LOG IN</Text>
    //           </TouchableOpacity>
    //         }
    //       </>
    //     )
    //   })
    // }, [userToken])

    const deleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure that you want to delete your account? Please note that there is no option to restore your account or its data. You would still be able to check your order status using its order number.',
            [
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => signOut()
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        )
    }

    const handleEmailPress = () => {

        const emailAddress = 'team@rev.delivery' // could add things like subject and message if you wanted to get spicy
        const mailToLink = `mailto:${emailAddress}`
        try {
            Linking.openURL(mailToLink)
        } catch (e) {
            Alert.alert('Oops')
        }

    }

    const handlePhonePress = () => {
        const phoneNumber = '+12068336358'
        const smsLink = `sms:${phoneNumber}`
        try {
            Linking.openURL(smsLink)
        } catch (e) {
            Alert.alert('Oops')
        }
    }

    return (
        <View
            style={styles.container}
        // if you want to make this back a scrollview, uncomment
        // contentContainerStyle={styles.container}
        // showsVerticalScrollIndicator={false}
        >

            {/* CONTACT US */}
            {/* <View style={{
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                height: 130,
                marginBottom: 24,
                // borderWidth: 1,
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
                shadowColor: 'black', shadowRadius: 1,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6
            }}>
                <View style={{ display: 'flex', marginLeft: 12, marginTop: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#4B2D83' }}>
                        Contact Us
                    </Text>
                    <View style={{ marginLeft: 8, marginTop: 16, flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginBottom: 20 }}>
                        
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <View style={{ justifyContent: 'center', marginRight: 6, marginTop: 2 }}>
                                <MailIcon color={'black'} size={20} />
                            </View>

                            <Text onPress={handleEmailPress} style={{ fontSize: 18, fontWeight: '300', textDecorationLine: 'underline' }}>team@rev.delivery</Text>
                        </View>

                        <View style={{ width: 250, height: 1, borderRadius: 2, backgroundColor: '#3C3C4333' }}></View>

                        
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <Image source={phone} style={{ width: 20, height: 20, marginRight: 2 }} />
                            <Text onPress={handlePhonePress} style={{ fontSize: 18, fontWeight: '300', textDecorationLine: 'underline' }}>(206)833-6358</Text>
                        </View>
                    </View>
                </View>
            </View> */}

            {/* LIKED ITEMS */}
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => navigation.push('Wishlist')}>
                <Text style={styles.settingTitle}>Liked Items</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>




            {/* ORDER HISTORY */}
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => {
                    if (userToken) {
                        navigation.push('Orders')
                    } else {
                        rootNavigation.push('LoginStackNavigator', { screen: 'Login' })
                    }
                }}
            >
                <Text style={styles.settingTitle}>History</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>

            {/* Personal Information */}
            {userToken &&
                <TouchableOpacity style={styles.cardContainer}
                    onPress={() => navigation.push('PersonalInformations')}>
                    <Text style={styles.settingTitle}>Personal Information</Text>
                    {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                    <RightArrowIcon size={40} color={'#4B2D83'} />
                </TouchableOpacity>
            }



            {/* TODO Customer Support */}
            {/* WHERE DO I LINK? */}
            {/* <TouchableOpacity style={styles.cardContainer}>
                <Text style={styles.settingTitle}>
                    Contact (MK LINK)
                </Text>
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity> */}




            {/* INSTAGRAM LINK */}
            <TouchableOpacity style={styles.cardContainer}
                onPress={() => Linking.openURL('https://www.instagram.com/rev.delivery/')}
            >
                <Text style={styles.settingTitle}>Instagram</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>



            {/* TOS */}
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => WebBrowser.openBrowserAsync('https://rev.delivery/policies/terms-of-service')}
            >
                <Text style={styles.settingTitle}>Terms of Service</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>

            {/* PRIVACY POLICY */}
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => WebBrowser.openBrowserAsync('https://rev.delivery/policies/privacy-policy')}
            >
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>

            {/* DELETE ACCOUNT */}
            {userToken &&
                <>
                    <TouchableOpacity
                        style={styles.cardContainer}
                        onPress={deleteAccount}
                    >
                        <Text style={styles.settingTitle}>Delete Account</Text>
                        {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                        <RightArrowIcon size={40} color={'#4B2D83'} />
                    </TouchableOpacity>
                </>
            }

            {userToken &&
                <>
                    <TouchableOpacity
                        style={styles.cardContainer}
                        onPress={() => signOut()}
                    >
                        <Text style={styles.settingTitle}>Log Out</Text>
                        {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                        <RightArrowIcon size={40} color={'#4B2D83'} />
                    </TouchableOpacity>
                </>}
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 16,
        width: '95%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 12
    },
    greeting: {
        color: theme.colors.text,
        fontSize: 20,
        letterSpacing: 1,
        // marginBottom: 32
    },
    text: {
        color: theme.colors.text
    },
    textButton: {
        color: theme.colors.text,
        letterSpacing: 0.5,
        fontSize: 15,
        fontWeight: '500'
    },
    subTitle: {
        color: theme.colors.infoText,
        letterSpacing: 1,
    },
    settingTitle: {
        color: '#000000',
        letterSpacing: 1,
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 8
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 45,
        marginBottom: 30,

    }
})

export default SettingsPage