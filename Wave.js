import React, {useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Canvas from 'react-native-canvas';


const Waveform = ({ isrecording, metering, press, title }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current && Array.isArray(metering)) {
      const canvas = canvasRef.current;
      canvas.width = 300;
      canvas.height = 35;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#87CEEB';
      ctx.lineWidth = 4; 
      ctx.beginPath();
      const sliceWidth = canvas.width / (metering.length);
      metering.forEach((amp, i) => {
        const x = i * sliceWidth;
        const y = (1 - amp) * canvas.height * 0.7;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * sliceWidth;
          const prevY = (1 - metering[i - 1]) * canvas.height * 0.7;
          const cx = (prevX + x) / 2;
          const cy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, cy);
        }
      });
      ctx.stroke();
    }
  }, [isrecording, metering]);
  return (
    <TouchableOpacity style={styles.button} onPress={press}> 
      <Canvas ref={canvasRef} style={styles.waveform} />
      <Text style={styles.btitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    button: {
        borderWidth: 8,
        borderColor: '#d3d3d3',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 100,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginBottom: 30,
    },
    waveform: {
        width: 280,
        height: 35,
    },
    btitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
});
export default Waveform;