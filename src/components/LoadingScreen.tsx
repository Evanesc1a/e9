import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/tokens';

export function LoadingScreen() {
  const opacity = useRef(new Animated.Value(1)).current;

  // Un latido suave mientras carga
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Animated.Image
        source={require('../../assets/images/emblema-bienvenida.png')}
        style={[styles.emblem, { opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  // Mismo ancho que la pantalla de carga nativa (200), para que no se note el cambio
  emblem: { width: 200, height: 200 },
});