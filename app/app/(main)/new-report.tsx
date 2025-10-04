import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

export default function NewReportScreen() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'found' | 'lost'>('found');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const handleBack = () => {
    router.back();
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Alert.alert('Location Set', 'Current location has been set for this report');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleSubmitReport = async () => {
    if (!dogName.trim() || !description.trim() || !contactInfo.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please set a location for this report');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const reportData = {
        type: reportType,
        dogName,
        dogBreed,
        description,
        contactInfo,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      console.log('Creating dog report:', reportData);
      Alert.alert('Success', 'Dog report created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating report:', error);
      Alert.alert('Error', 'Failed to create report');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Dog Report</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.reportTypeContainer}>
          <Text style={styles.sectionTitle}>Report Type</Text>
          <View style={styles.reportTypeButtons}>
            <TouchableOpacity
              style={[
                styles.reportTypeButton,
                reportType === 'found' && styles.reportTypeButtonActive,
              ]}
              onPress={() => setReportType('found')}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={reportType === 'found' ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.reportTypeButtonText,
                  reportType === 'found' && styles.reportTypeButtonTextActive,
                ]}
              >
                Found Dog
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reportTypeButton,
                reportType === 'lost' && styles.reportTypeButtonActive,
              ]}
              onPress={() => setReportType('lost')}
            >
              <Ionicons
                name="alert-circle"
                size={24}
                color={reportType === 'lost' ? '#fff' : '#FF6B6B'}
              />
              <Text
                style={[
                  styles.reportTypeButtonText,
                  reportType === 'lost' && styles.reportTypeButtonTextActive,
                ]}
              >
                Lost Dog
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Dog Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dog Name *</Text>
            <TextInput
              style={styles.textInput}
              value={dogName}
              onChangeText={setDogName}
              placeholder="Enter dog's name or 'Unknown'"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.textInput}
              value={dogBreed}
              onChangeText={setDogBreed}
              placeholder="Enter dog's breed"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the dog (size, color, collar, etc.)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Ionicons name="location" size={24} color="#007AFF" />
            <Text style={styles.locationButtonText}>
              {location ? 'Location Set' : 'Set Current Location'}
            </Text>
            {location && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
          {location && (
            <Text style={styles.locationText}>
              Lat: {location.coords.latitude.toFixed(6)}, 
              Lng: {location.coords.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Info *</Text>
            <TextInput
              style={styles.textInput}
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="Phone number or email"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
          <Text style={styles.submitButtonText}>Create Report</Text>
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
    paddingVertical: 20,
  },
  reportTypeContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  reportTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reportTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  reportTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reportTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  reportTypeButtonTextActive: {
    color: '#fff',
  },
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
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
  textInputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});