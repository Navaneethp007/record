import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';
import Waveform from './Wave';
import { start, stop, play, seek } from './AudioFunc';

const { width: screenWidth } = Dimensions.get('window');

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
        alert('Error requesting permissions');
      }
    })();
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteRecording = (indexToDelete) => {
    setAudioUri(prev => prev.filter((_, index) => index !== indexToDelete));
    if (playuri === audiouri[indexToDelete]) {
      sound?.unloadAsync();
      setPlayUri(null);
      setIsPlay(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recordify</Text>
        <Text style={styles.subtitle}>
          {audiouri.length} recording{audiouri.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        {audiouri.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="mic-none" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No recordings yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the record button below to create your first recording
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.audioList}
            contentContainerStyle={styles.audioListContent}
            showsVerticalScrollIndicator={false}
          >
            {audiouri.map((uri, index) => (
              <View key={index} style={[
                styles.audioCard,
                playuri === uri && styles.activeCard
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Icon
                      name="audiotrack"
                      size={20}
                      color={playuri === uri ? '#FF6B6B' : '#666'}
                    />
                    <Text style={[
                      styles.cardText,
                      playuri === uri && styles.activeCardText
                    ]}>
                      Recording {index + 1}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[
                        styles.cardButton,
                        { backgroundColor: playuri === uri ? '#FF6B6B' : '#F3F4F6' }
                      ]}
                      onPress={() => play(uri, sound, setSound, setPlayUri, setIsPlay, setProgress, isPlay, playuri)}
                    >
                      <Icon
                        name={uri === playuri && isPlay ? 'pause' : 'play-arrow'}
                        size={20}
                        color={playuri === uri ? 'white' : '#666'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteRecording(index)}
                    >
                      <Icon name="delete" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {playuri === uri && (
                  <View style={styles.progressSection}>
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(progress[uri]?.position)}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatTime(progress[uri]?.duration)}
                      </Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <Progress.Bar
                        progress={(progress[uri]?.position || 0) / (progress[uri]?.duration || 1)}
                        width={screenWidth - 80}
                        height={6}
                        color="#FF6B6B"
                        unfilledColor="#E5E7EB"
                        borderWidth={0}
                        style={styles.progressBar}
                        onTouchEnd={(e) => {
                          const value = e.nativeEvent.locationX / (screenWidth - 80);
                          seek(uri, value, sound, playuri, progress);
                        }}
                      />
                      <View
                        style={[
                          styles.thumb,
                          {
                            left: ((progress[uri]?.position || 0) / (progress[uri]?.duration || 1)) * (screenWidth - 80) - 8,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <LinearGradient
        colors={['rgba(248,249,250,0)', 'rgba(248,249,250,0.8)', 'rgba(248,249,250,1)']}
        style={styles.fadeOverlay}
        pointerEvents="none"
      />

      <View style={styles.recordingSection}>
        <Waveform
          isrecording={isrec}
          metering={metering}
          press={isrec ?
            () => stop(rec, setAudioUri, setRec, setIsRec, setMetering) :
            () => start(setRec, setIsRec, setMetering)
          }
          title={isrec ? 'Stop Recording' : 'Start Recording'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 48,
    color: '#1F2937',
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  audioList: {
    flex: 1,
  },
  audioListContent: {
    paddingBottom: 20,
  },
  audioCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  activeCardText: {
    color: '#DC2626',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardButton: {
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  deleteButton: {
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    minWidth: 36,
    minHeight: 36,
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  progressBar: {
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    top: -5,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 60,
  },
  recordingSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#F8F9FA',
  },
});

export default App;