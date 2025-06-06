import React, { useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';

const App = () => { 
  const [rec, setRec] = useState(null);
  const [isrec, setIsRec] = useState(false);

  const start = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone was denied');
        return;
      }
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRec(recording);
      setIsRec(true);
    } catch (error) {
      alert('Error starting recording:');
    }
  };

  const stop = async () => {
    try {
      await rec.stopAndUnloadAsync();
      setRec(null);
      setIsRec(false);
    } catch (error) {
      alert('Error stopping recording:');
    }
      
  };

  return (
    <View style={styles.container}>
      <Text>Audio Recording App</Text>
      <Button
        title={isrec ? 'Stop Recording' : 'Start Recording'}
        onPress={isrec ? stop : start}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;