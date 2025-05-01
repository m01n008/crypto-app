// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MarketOverviewScreen from './screens/MarketOverViewScreen'
import CoinDetailsScreen from './screens/CoinDetailsScreen';
import { View, Text, Button, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    try {
      const hasBiometric = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isFaceIDAvailable = Platform.OS === 'ios' && supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      // On iOS, attempt authentication even if biometrics aren't enrolled to allow passcode fallback
      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: 'Authenticate to access Crypto Market',
        disableDeviceFallback: false, // Allow passcode/password fallback
        cancelLabel: 'Cancel',
      };

      // Prioritize Face ID on iOS if available
      if (Platform.OS === 'ios' && isFaceIDAvailable) {
        authOptions.promptMessage = 'Use Face ID to access Crypto Market';
      }

      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        setIsAuthenticated(true);
        // Clear biometric prompt flag on successful authentication
        await AsyncStorage.removeItem('biometricPrompt');
      } else {
        // Set prompt flag if authentication fails
        await AsyncStorage.setItem('biometricPrompt', 'true');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      await AsyncStorage.setItem('biometricPrompt', 'true');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Authentication Required</Text>
        <Button title="Try Again" onPress={checkBiometricAuth} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MarketOverview" component={MarketOverviewScreen} />
          <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;