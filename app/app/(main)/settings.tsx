import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [showCreateShelter, setShowCreateShelter] = useState(false);
  const [shelterName, setShelterName] = useState('');
  const [shelterAddress, setShelterAddress] = useState('');
  const [shelterPhone, setShelterPhone] = useState('');
  const [shelterEmail, setShelterEmail] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleCreateShelter = async () => {
    if (!shelterName.trim()) {
      Alert.alert('Error', 'Please enter a shelter name');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const shelterData = {
        name: shelterName,
        address: shelterAddress,
        phone: shelterPhone,
        email: shelterEmail,
      };

      console.log('Creating shelter:', shelterData);
      Alert.alert('Success', 'Shelter created successfully!');
      
      // Reset form
      setShelterName('');
      setShelterAddress('');
      setShelterPhone('');
      setShelterEmail('');
      setShowCreateShelter(false);
    } catch (error) {
      console.error('Error creating shelter:', error);
      Alert.alert('Error', 'Failed to create shelter');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowCreateShelter(!showCreateShelter)}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="home" size={24} color="#007AFF" />
            <Text style={styles.settingItemText}>Create New Shelter</Text>
          </View>
          <Ionicons
            name={showCreateShelter ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {showCreateShelter && (
          <View style={styles.createShelterForm}>
            <Text style={styles.formTitle}>New Shelter Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shelter Name *</Text>
              <TextInput
                style={styles.textInput}
                value={shelterName}
                onChangeText={setShelterName}
                placeholder="Enter shelter name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                value={shelterAddress}
                onChangeText={setShelterAddress}
                placeholder="Enter shelter address"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={shelterPhone}
                onChangeText={setShelterPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={shelterEmail}
                onChangeText={setShelterEmail}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleCreateShelter}>
              <Text style={styles.submitButtonText}>Create Shelter</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="person" size={24} color="#007AFF" />
            <Text style={styles.settingItemText}>Profile Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.settingItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <Ionicons name="help-circle" size={24} color="#007AFF" />
            <Text style={styles.settingItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  createShelterForm: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});