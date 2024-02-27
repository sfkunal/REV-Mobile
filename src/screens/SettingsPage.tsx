import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native'
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
import { RightArrowIcon } from '../components/shared/Icons'

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

    return (
        <View
            style={styles.container}
        // if you want to make this back a scrollview, uncomment
        // contentContainerStyle={styles.container}
        // showsVerticalScrollIndicator={false}
        >
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

            {/* INSTAGRAM LINK */}
            <TouchableOpacity style={styles.cardContainer}
                onPress={() => Linking.openURL('https://www.instagram.com/rev.delivery/')}
            >
                <Text style={styles.settingTitle}>Instagram</Text>
                {/* <Entypo name={`chevron-small-right`} size={40} color={'#4B2D83'} /> */}
                <RightArrowIcon size={40} color={'#4B2D83'} />
            </TouchableOpacity>

            {/* TODO Customer Support */}
            {/* WHERE DO I LINK? */}
            <TouchableOpacity style={styles.cardContainer}>
                <Text style={styles.settingTitle}>
                    Contact (MK LINK)
                </Text>
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

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 16,
        width: '95%',
        alignSelf: 'center',
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
        marginBottom: 30
    }
})

export default SettingsPage