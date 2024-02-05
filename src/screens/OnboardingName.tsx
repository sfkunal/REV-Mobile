// OnboardingName.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoginStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<LoginStackParamList, 'OnboardingName'>

const OnboardingName = ({ navigation }: Props) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    //  const navigation = useNavigation();
    const { rootNavigation } = useNavigationContext()


    const handleNext = () => {
        // Navigate to the next screen with the first and last name
        console.log(firstName, lastName)
        navigation.navigate('OnboardingPhone', { firstName, lastName });
    };

    return (
        <View>
            <Text>Enter Your Name</Text>
            <TextInput
                placeholder="First Name"
                onChangeText={setFirstName}
                value={firstName}
            />
            <TextInput
                placeholder="Last Name"
                onChangeText={setLastName}
                value={lastName}
            />
            <Button title="Next" onPress={handleNext} />
        </View>
    );
};

export default OnboardingName;