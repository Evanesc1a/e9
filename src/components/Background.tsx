import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

// Qué tan visible es la medusa: 0 = invisible, 1 = a toda su fuerza
const OPACIDAD = 0.06;

export function Background() {
  return (
    <Image
      source={require('../../assets/images/fondo-medusa.png')}
      style={styles.bg}
      contentFit="cover"
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: OPACIDAD,
  },
});