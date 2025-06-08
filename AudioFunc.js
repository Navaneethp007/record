import { Audio } from "expo-av";

export const start = async (setRec, setIsRec, setMetering) => {
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
            const raw = Math.max(status.metering + 160, 0)/160;
            const newValue = Math.pow(raw, 2);
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

  export const stop = async (rec, setAudioUri, setRec, setIsRec, setMetering) => {
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

  export const play = async (uri, sound, setSound, setPlayUri, setIsPlay, setProgress, isPlay, playuri) => {
    try {
      if (sound && playuri === uri) {
        if(isPlay) {
          await sound.pauseAsync();
          setIsPlay(false);
        }
        else {
          await sound.playAsync();
          setIsPlay(true);
        }
      } else {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setPlayUri(uri);
        setIsPlay(true);
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
              setIsPlay(false);
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

  export const seek = async (uri, value, sound, playuri, progress) => {
    try {
      if (sound && playuri === uri) {
        const duration = progress[uri]?.duration || 1;
        await sound.setPositionAsync(value * duration * 1000);
      }
    } catch (error) {
      console.error(error);
    }
  };