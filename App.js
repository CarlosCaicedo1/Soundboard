import { StatusBar } from 'expo-status-bar';
import React, {useEffect} from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, Button } from 'react-native';
import Sound from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [recording, setRecording] = React.useState();
  const [item, setItems] = React.useState();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  const startRecording = async (soundIndex) => {
    try {
      console.log('Requesting permissions...');
      await Audio.requestPermissionsAsync();
      console.log('Starting recording...');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording({ soundIndex, recording });
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };


  const stopRecording = async () => {
    console.log('Stopping recording...');
    try {
      await recording.recording.stopAndUnloadAsync();
      const uri = recording.recording.getURI();
      await saveRecording(uri, recording.soundIndex);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const playSound = async (soundIndex) => {
    console.log('Playing sound...');
    try {
      const uri = await getRecordingUri(soundIndex);
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        await sound.playAsync();
      } else {
        console.log('No recording found for soundIndex:', soundIndex);
      }
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  const saveRecording = async (uri, soundIndex) => {
    try {
      const existingRecordings = await AsyncStorage.getItem('recordings');
      let recordings = existingRecordings ? JSON.parse(existingRecordings) : {};
      recordings[soundIndex] = uri;
      await AsyncStorage.setItem('recordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Failed to save recording', error);
    }
  };

  const getRecordingUri = async (soundIndex) => {
    try {
      const recordings = await AsyncStorage.getItem('recordings');
      const parsedRecordings = recordings ? JSON.parse(recordings) : {};
      return parsedRecordings[soundIndex];
    } catch (error) {
      console.error('Failed to get recording', error);
      return null;
    }
  };

  function clearRecordings(){}

  const playButtons = [
    { title: 'Sound 1', onPress: () => playSound(1) },
    { title: 'Sound 2', onPress: () => playSound(2) },
    { title: 'Sound 3', onPress: () => playSound(3) },
    { title: 'Sound 4', onPress: () => playSound(4) },
    { title: 'Sound 5', onPress: () => playSound(5) },
    { title: 'Sound 6', onPress: () => playSound(6) },
    { title: 'Sound 7', onPress: () => playSound(7) },
    { title: 'Sound 8', onPress: () => playSound(8) },
    { title: 'Sound 9', onPress: () => playSound(9) },
  ];

  const recordButtons = [
    { title: 'Record Sound 1', onPress: () => startRecording(1) },
    { title: 'Record Sound 2', onPress: () => startRecording(2) },
    { title: 'Record Sound 3', onPress: () => startRecording(3) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <FlatList
          data={playButtons}
          numColumns={3}
          renderItem={({ item }) => (
            <View >
              <Button style={styles.button} title={item.title} onPress={item.onPress} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b262c",
  },
  buttonContainer: {
    flex: 1,
    margin: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',


  },
  button: {
    height:110,
    width: "29%",
    margin: 10,
    backgroundColor: "red",
  },
});
