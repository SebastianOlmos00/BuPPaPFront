import { StyleSheet, Text, View } from 'react-native';

export default function MapView() {
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>BuPaPP</Text>
        <Text style={styles.title}>Mapa de transporte</Text>
      </View>

      <View style={styles.mapArea}>
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
        <View style={styles.roadDiagonal} />

        <View style={styles.location}>
          <Text style={styles.pin}>📍</Text>
          <Text style={styles.locationText}>Tu ubicación</Text>
        </View>

        <View style={styles.mapMessage}>
          <Text style={styles.messageTitle}>
            Mapa móvil
          </Text>
          <Text style={styles.messageDescription}>
            La visualización del mapa para dispositivos
            móviles se encuentra pendiente de integración.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Transporte público</Text>
        <Text style={styles.footerDescription}>
          Aquí podrás consultar buses y paraderos
          cuando se integre el mapa móvil.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F2',
  },
  header: {
    backgroundColor: '#3F464D',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  brand: {
    color: '#B7CBD3',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#F5F5F2',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 5,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#B7CBD3',
    margin: 14,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadHorizontal: {
    position: 'absolute',
    width: '120%',
    height: 24,
    backgroundColor: '#F5F5F2',
    transform: [{ rotate: '-12deg' }],
  },
  roadVertical: {
    position: 'absolute',
    width: 22,
    height: '120%',
    backgroundColor: '#F5F5F2',
    transform: [{ rotate: '25deg' }],
  },
  roadDiagonal: {
    position: 'absolute',
    width: '120%',
    height: 12,
    backgroundColor: '#F5F5F2',
    transform: [{ rotate: '35deg' }],
  },
  location: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pin: {
    fontSize: 34,
  },
  locationText: {
    color: '#3F464D',
    fontWeight: 'bold',
    backgroundColor: '#F5F5F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapMessage: {
    backgroundColor: '#F5F5F2',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    width: '85%',
  },
  messageTitle: {
    color: '#3F464D',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  messageDescription: {
    color: '#59636A',
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    backgroundColor: '#F5F5F2',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#B7CBD3',
  },
  footerTitle: {
    color: '#3F464D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerDescription: {
    color: '#59636A',
    marginTop: 5,
    fontSize: 13,
  },
});