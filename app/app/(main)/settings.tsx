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
import { apiPost, apiGet } from '../../lib/fetch';
import * as Location from 'expo-location';
import { useEffect } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [showCreateShelter, setShowCreateShelter] = useState(false);
  const [shelterName, setShelterName] = useState('');
  const [isCreatingShelter, setIsCreatingShelter] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState('Not detected');
  const [userShelter, setUserShelter] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await apiGet('/users/me');
      if (response.data && response.data.shelterId) {
        const shelterResponse = await apiGet(`/shelters/${response.data.shelterId}`);
        if (shelterResponse.data) {
          setUserShelter(shelterResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getCurrentLocation = async () => {
    try {
      setLocationStatus('Getting location...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLocationStatus(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('Failed to get location');
    }
  };

  const handleCreateShelter = async () => {
    if (!shelterName.trim()) {
      Alert.alert('Error', 'Please enter a shelter name');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Please get your current location first');
      return;
    }

    setIsCreatingShelter(true);

    try {
      const shelterData = {
        name: shelterName,
        location: {
          x: currentLocation.longitude,
          y: currentLocation.latitude
        }
      };

      const response = await apiPost('/shelters', shelterData);
      
      if (response.error) {
        Alert.alert('Error', response.error);
        setIsCreatingShelter(false);
        return;
      }

      Alert.alert('Success', 'Shelter created successfully at your current location!');
      
      // Reset form and refresh user info
      setShelterName('');
      setCurrentLocation(null);
      setLocationStatus('Not detected');
      setShowCreateShelter(false);
      fetchUserInfo();
    } catch (error) {
      console.error('Error creating shelter:', error);
      Alert.alert('Error', 'Failed to create shelter. Please try again.');
    } finally {
      setIsCreatingShelter(false);
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
        {!isLoadingUser && !userShelter && (
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
        )}

        {!isLoadingUser && userShelter && (
          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="home" size={24} color="#007AFF" />
              <Text style={styles.settingItemText}>My Shelter: {userShelter.name}</Text>
            </View>
          </View>
        )}

        {!isLoadingUser && !userShelter && showCreateShelter && (
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
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>{locationStatus}</Text>
                <TouchableOpacity 
                  style={styles.locationButton} 
                  onPress={getCurrentLocation}
                >
                  <Ionicons name="location" size={16} color="#007AFF" />
                  <Text style={styles.locationButtonText}>Get Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, isCreatingShelter && styles.submitButtonDisabled]} 
              onPress={handleCreateShelter}
              disabled={isCreatingShelter}
            >
              <Text style={styles.submitButtonText}>
                {isCreatingShelter ? 'Creating Shelter...' : 'Create Shelter'}
              </Text>
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
});