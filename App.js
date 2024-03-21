import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Button, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default App = () => {
  const [recording, setRecording] = useState(null);
  const [recordingUris, setRecordingUris] = useState([]);
  const [playback, setPlayback] = useState(null);
  const [permissionsResponse, requestPermission] = Audio.usePermissions();
  const counter = 0;
  useEffect(() => {
    // Load previously saved recordings from AsyncStorage
    const loadRecordings = async () => {
      try {
        const savedRecordings = await AsyncStorage.getItem('recordings');
        if (savedRecordings) {
          setRecordingUris(JSON.parse(savedRecordings));
        }
      } catch (error) {
        console.error('Failed to load recordings:', error);
      }
    };
    loadRecordings();
  }, []);

  const saveRecording = async (uri) => {
    try {
      // Save the recorded URI to AsyncStorage
      await AsyncStorage.setItem(
        'recordings',
        JSON.stringify([...recordingUris, uri])
      );
      console.log('Recording saved.');
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  const clearRecordings = async () => {
    try {
      // Clear the recordings from AsyncStorage
      await AsyncStorage.removeItem('recordings');
      setRecordingUris([]);
      console.log('Recordings cleared.');
    } catch (error) {
      console.error('Failed to clear recordings:', error);
    }
  };

  const playRecording = async (uri) => {
    try {
      if (!uri) {
        console.error('Recording URI is null or undefined.');
        return;
      }
  
      // Check if playback is already in progress
      if (playback !== null) {
        // Stop any existing playback
        await playback.stopAsync();
        await playback.unloadAsync();
      }
  
      // Create a new playback instance
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayback(sound);
      await sound.playAsync();
      console.log('Playing recorded sound from', uri);
    } catch (error) {
      console.error('Failed to play recording:', error);
      // Handle error, possibly reset playback state
      setPlayback(null);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Button title="Play" onPress={() => playRecording(item)} />
      <Text>Custom Sound {index+1}</Text>
    </View>
  );

  const startRecording = async () => {
    try {
      // request permission to use the mic
      if (permissionsResponse.status !== 'granted') {
        console.log('Requesting permissions.');
        await requestPermission();
      }
      console.log('Permission is ', permissionsResponse.status);

      // set some device specific values
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('...recording');
    }
    catch (errorEvent) {
      console.error('Failed to startRecording(): ', errorEvent);
    }
  }

  const stopRecording = async () => {
    try {
      // stop the actual recording
      await recording.stopAndUnloadAsync();

      // save the recorded object location
      const uri = recording.getURI();
      setRecordingUris(prevUris => [...prevUris, uri]);

      // forget the recording object
      setRecording(undefined);

      // log the result
      console.log('Recording stopped and stored at ', uri);

      saveRecording(uri);
    }
    catch (errorEvent) {
      console.error('Failed to stopRecording(): ', errorEvent);
    }
  }


  function getRecordingLines() {
    return recordingUris.map((recordingUri, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            New Sound #{index + 1}
          </Text>
          <Button onPress={() => playRecording(recordingUri)} title="Play"></Button>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      <FlatList
        data={recordingUris}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={3}
      />
      {recordingUris.length > 0 &&
        <Button
          title="Clear Recordings"
          onPress={clearRecordings}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flex: 1,
    minHeight: 100,
  },
});
