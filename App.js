import React,{ useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import Waveform from './Wave'; 
import { start, stop, play, seek } from './AudioFunc'; 
 
const App = () => { 
  const [rec, setRec] = useState(null);
  const [isrec, setIsRec] = useState(false);
  const [metering, setMetering] = useState(new Array(50).fill(0));
  const [audiouri, setAudioUri] = useState([]);
  const [sound, setSound] = useState(null);
  const [playuri, setPlayUri] = useState(null);
  const [progress, setProgress] = useState({});
  const [isPlay, setIsPlay] = useState(false);

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
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordify</Text>
      {audiouri.length === 0 ? (
        <Text style={styles.justText}>No recordings available</Text>
      ) : (
        <ScrollView style={styles.audioList} contentContainerStyle={styles.audioListContent}>
          {audiouri.map((uri, index) => (
            <View key={index} style={[styles.audioCard, playuri === uri && styles.activeCard]}>
              <View style={styles.cardContent}>
              <Text style={styles.cardText}>Recording {index + 1}</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => play(uri, sound, setSound, setPlayUri, setIsPlay, setProgress, isPlay, playuri)}>
                  <Icon
                    name={uri === playuri ? 'pause' : 'play-arrow'}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              {playuri === uri && (
                <View style={styles.progressContainer}>
                <Progress.Bar
                  progress={(progress[uri]?.position || 0) / (progress[uri]?.duration || 1)}
                  width={260}
                  height={10}
                  color="#87CEEB"
                  unfilledColor="#d3d3d3"
                  borderWidth={0}
                  style={styles.progressBar}
                  onTouchEnd={(e) => {
                    const value = e.nativeEvent.locationX / 260;
                    seek(uri, value, sound, playuri, progress);
                  }}
                />
                <View
                    style={[
                      styles.thumb,
                      {
                        left: ((progress[uri]?.position || 0) / (progress[uri]?.duration || 1)) * 260 - 6,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.fadeOverlay} /> 
      <Waveform
        isrecording={isrec}
        metering={metering} 
        press={isrec ? () => stop(rec, setAudioUri, setRec, setIsRec, setMetering) : () => start(setRec, setIsRec, setMetering)}
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
    fontSize: 60,
    color: '#000',
    alignSelf: 'flex-start',
    marginTop: 70,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  
  fadeOverlay: {
    position: 'absolute',
    bottom: 130, 
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,1))',
  },
  
  audioListContent: {
    paddingBottom: 20,
  },
  justText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  audioList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  audioCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    marginTop: 10,
  },
  activeCard: {
    backgroundColor: '#E6F3FA',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginRight: 10,
    fontWeight: 'bold',
  },
  cardButton: {
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'relative',
    marginTop: 10,
    alignSelf: 'center',
  },
  progressBar: {
    alignSelf: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6,
    backgroundColor: '#4682B4',
    
  },
});

export default App;