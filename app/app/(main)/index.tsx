import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { apiGet } from '../../lib/fetch';

interface DogReport {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [dogReports, setDogReports] = useState<DogReport[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    fetchDogReports();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      
      if (!isLocationLoaded) {
        const newRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        setIsLocationLoaded(true);
        
        // Animate to user location after a short delay to ensure map is ready
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location');
    }
  };

  const fetchDogReports = async () => {
    try {
      const response = await apiGet('/dog-reports');
      if (response.data) {
        setDogReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching dog reports:', error);
      // Fallback to mock data if API fails
      const mockReports: DogReport[] = [
        {
          id: '1',
          latitude: 37.78825,
          longitude: -122.4324,
          title: 'Golden Retriever Found',
          description: 'Friendly golden retriever found in the park'
        },
        {
          id: '2',
          latitude: 37.78925,
          longitude: -122.4224,
          title: 'Lost Beagle',
          description: 'Small beagle, answers to Max'
        }
      ];
      setDogReports(mockReports);
    }
  };

  const handleNewReport = () => {
    router.push('/(main)/new-report');
  };

  const handleSettings = () => {
    router.push('/(main)/settings');
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    } else {
      getCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {dogReports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
            description={report.description}
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
          <Ionicons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={centerOnUserLocation}>
          <Ionicons name="locate" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleNewReport}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    marginTop: -50,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});