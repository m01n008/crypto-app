import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Platform,
  Linking,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricGateProps {
  onAuthenticated: () => void;
}

const BiometricGate: React.FC<BiometricGateProps> = ({ onAuthenticated }) => {
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    try {
      setIsLoading(true);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsBiometricEnrolled(false);
        return;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isFaceIDAvailable =
        Platform.OS === 'ios' &&
        supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: isFaceIDAvailable
          ? 'Use Face ID to access Crypto Market'
          : 'Authenticate to access Crypto Market',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      };

      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        setIsAuthenticated(true);
        await AsyncStorage.removeItem('biometricPrompt');
        onAuthenticated();
      } else {
        await AsyncStorage.setItem('biometricPrompt', 'true');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isBiometricEnrolled) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
          Biometrics are not set up. Please enable Face ID or fingerprint in device settings.
        </Text>
        <Button title="Open Settings" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={{ marginBottom: 16 }}>Authentication Required</Text>
        <Button title="Try Again" onPress={checkBiometricAuth} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BiometricGate;
