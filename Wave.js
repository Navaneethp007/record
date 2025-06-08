import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

const Waveform = ({ isrecording, metering, press, title }) => {
  const waveformData = useRef(new Array(60).fill(0)).current;
  const animatedValues = useRef(
    Array.from({ length: 60 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    let animationFrame;

    const animate = () => {
      if (isrecording && metering.length > 0) {
        // Get latest audio and shift data
        const latestLevel = metering[metering.length - 1] || 0;
        waveformData.shift();
        waveformData.push(latestLevel);

        // Direct value updates for smoothness - no animation delays
        waveformData.forEach((level, index) => {
          const prevLevel = waveformData[index - 1] || 0;
          const nextLevel = waveformData[index + 1] || 0;
          const smoothLevel = (level + prevLevel * 0.2 + nextLevel * 0.2) / 1.4;

          const waveOffset = Math.sin((index * 0.2) + (Date.now() * 0.008)) * 2;
          const finalHeight = Math.max(smoothLevel * 20 + waveOffset + 3, 2);

          animatedValues[index].setValue(finalHeight);
        });
      } else if (!isrecording) {
        // Smooth idle flow
        animatedValues.forEach((animValue, index) => {
          const idleFlow = Math.sin((index * 0.3) + (Date.now() * 0.004)) * 1.5 + 4;
          animValue.setValue(idleFlow);
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isrecording, metering]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isrecording ? '#FFE5E5' : 'white',
          borderColor: isrecording ? '#FF6B6B' : '#d3d3d3',
        },
      ]}
      onPress={press}
      activeOpacity={0.8}
    >
      <Icon
        name={isrecording ? 'stop' : 'mic'}
        size={20}
        color={isrecording ? '#FF6B6B' : '#666'}
        style={styles.icon}
      />

      {/* Flowing waveform */}
      <View style={styles.waveContainer}>
        {animatedValues.map((animValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                height: animValue,
                backgroundColor: isrecording ? '#FF6B6B' : '#87CEEB',
                opacity: isrecording ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[
        styles.btitle,
        { color: isrecording ? '#FF6B6B' : '#333' }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 3,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginBottom: 5,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 260,
    marginBottom: 5,
  },
  waveBar: {
    width: 4,
    marginHorizontal: 0.5,
    borderRadius: 2,
    backgroundColor: '#87CEEB',
  },
  btitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

Waveform.propTypes = {
  isrecording: PropTypes.bool.isRequired,
  metering: PropTypes.arrayOf(PropTypes.number).isRequired,
  press: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default Waveform;