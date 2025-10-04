import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ShelterSelector from '../../components/ShelterSelector';

interface Shelter {
  id: string;
  name: string;
  location: any;
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'civilian' | 'shelter'>('civilian');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [shelterSelectorVisible, setShelterSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (userType === 'shelter' && !selectedShelter) {
      Alert.alert('Error', 'Please select a shelter');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    // TODO: Implement actual sign up logic with shelter selection
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/');
    }, 1000);
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join PawPatrol and help reunite pets</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'civilian' && styles.userTypeButtonActive]}
              onPress={() => setUserType('civilian')}
            >
              <Text style={[styles.userTypeButtonText, userType === 'civilian' && styles.userTypeButtonTextActive]}>
                Civilian
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'shelter' && styles.userTypeButtonActive]}
              onPress={() => setUserType('shelter')}
            >
              <Text style={[styles.userTypeButtonText, userType === 'shelter' && styles.userTypeButtonTextActive]}>
                Shelter
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {userType === 'shelter' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Shelter</Text>
            <TouchableOpacity
              style={styles.shelterSelector}
              onPress={() => setShelterSelectorVisible(true)}
            >
              <Text style={[styles.shelterSelectorText, !selectedShelter && styles.placeholderText]}>
                {selectedShelter ? selectedShelter.name : 'Choose a shelter'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a secure password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/signin')}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <ShelterSelector
        visible={shelterSelectorVisible}
        onClose={() => setShelterSelectorVisible(false)}
        onSelect={setSelectedShelter}
        selectedShelter={selectedShelter || undefined}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
  userTypeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  shelterSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shelterSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
});