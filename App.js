import React,{ useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Canvas from 'react-native-canvas';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from'react-native-progress';

const Waveform = ({ isrecording, metering, press, title }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && Array.isArray(metering)) {
      const canvas = canvasRef.current;
      canvas.width = 280;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      metering.forEach((amp, i) => {
        const barWidth = 3;
        const gap = 2;
        const x = i * (barWidth + gap);
        const barHeight = amp * 30;
        ctx.fillRect(x, 30 - barHeight, barWidth, barHeight);
      });
    }
  }, [isrecording, metering]);
  return (
    <TouchableOpacity style={styles.button} onPress={press}> 
      <Canvas ref={canvasRef} style={styles.waveform} />
      <Text style={styles.btitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const App = () => { 
  const [rec, setRec] = useState(null);
  const [isrec, setIsRec] = useState(false);
  const [metering, setMetering] = useState(new Array(50).fill(0));
  const [audiouri, setAudioUri] = useState([]);
  const [sound, setSound] = useState(null);
  const [playuri, setPlayUri] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access microphone was denied');
        } 
      } catch (error) {
        alert('Error requesting permissions:');
      }
    })();
  }, []);

  const start = async () => {
    try {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
       
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        },
        isMeteringEnabled: true,
      });
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          setMetering((prev) => {
            const newValue = Math.max(status.metering + 160, 0) / 160;
            return [...prev.slice(1), newValue];
          });
        }
      });
      await recording.startAsync();
      setRec(recording);
      setIsRec(true);
    } catch (error) {
      alert('Error starting recording:');
      console.error('Error starting recording:', error);
    }
  };

  const stop = async () => {
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setAudioUri((prev) => [...prev, uri]);
      setRec(null);
      setIsRec(false);
      setMetering(new Array(50).fill(0));
    } catch (error) {
      alert('Error stopping recording:');
      console.error(error);
    }  
  };

  const play = async (uri) => {
    try {
      if (sound && playuri === uri) {
        await sound.pauseAsync();
        setPlayUri(null);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setPlayUri(uri);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setProgress((prev) => ({
              ...prev,
              [uri]: {
                position: status.positionMillis / 1000,
                duration: status.durationMillis / 1000 || 1,
              },
            }));
            if (status.didJustFinish) {
              setPlayUri(null);
              setProgress((prev) => ({ ...prev, [uri]: { position: 0, duration: prev[uri]?.duration || 1 } }));
            }
          }
        });
        await newSound.playAsync();
      }
    } catch (error) {
      alert('Error playing sound:');
      console.error(error);
    }
  };

  const seek = async (uri, value) => {
    try {
      if (sound && playuri === uri) {
        const duration = progress[uri]?.duration || 1;
        await sound.setPositionAsync(value * duration * 1000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recording App</Text>
      {audiouri.length > 0 && (
        <View style={styles.audioList}>
          {audiouri.map((uri, index) => (
          <View key={index} style={styles.audioCard}>
              <Text style={styles.cardText}>Recording {index + 1}</Text>
            <View style={styles.cardButtons}>
            <TouchableOpacity style={styles.cardButton} onPress={() => play(uri)}>
                  <Icon
                    name={uri === playuri ? 'pause' : 'play-arrow'}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {playuri === uri && (
                <Progress.Bar
                  progress={(progress[uri]?.position || 0) / (progress[uri]?.duration || 1)}
                  width={260}
                  height={8}
                  color="#ffb6c1"
                  unfilledColor="#d3d3d3"
                  borderWidth={0}
                  style={styles.progressBar}
                  onTouchEnd={(e) => {
                    const value = e.nativeEvent.locationX / 260;
                    seek(uri, value);
                  }}
                />
              )}
            </View>
          ))}
        </View>
      )}
      <Waveform
        isrecording={isrec}
        metering={metering} 
        press={isrec ? stop : start} 
        title={isrec ? 'Stop Recording' : 'Start Recording'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    color: '#000',
    alignSelf: 'flex-start', 
    marginTop: 70,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  uriText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  button: {
    borderWidth: 8,
    borderColor: '#d3d3d3',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 80,
    backgroundColor: 'white',
    alignSelf: 'center', 
    marginBottom: 30, 
  },
  waveform: {
    width: 280,
    height: 30,
    marginBottom: 5,
  },
  btitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  audioList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
  },
  audioCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    marginTop: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  cardButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButton: {
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    padding: 8,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginTop: 10,
    alignSelf: 'center',
  },
});

export default App;