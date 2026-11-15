import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '@/services/api';
import MapPanelLayout from '@/components/MapPanelLayout';
import { useSession } from '@/services/session';

import { finishShift, finishTrip, getCurrentShift,
  reportIncident, setVehicleStatus, startShift, startTrip,
  type Shift, type TripStatus, type VehicleStatus,
} from '@/services/driverService';

const STATUS_LABEL: Record<VehicleStatus, string> = {
  OPERATIONAL: 'Operativo',
  OPERATIONAL_WITH_OBSERVATIONS: 'Con observaciones',
  OUT_OF_SERVICE: 'Fuera de servicio',
  MAINTENANCE: 'En mantenimiento',
};
const TRIP_LABEL: Record<TripStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};
const AT_START: VehicleStatus[] = ['OPERATIONAL', 'OPERATIONAL_WITH_OBSERVATIONS', 'OUT_OF_SERVICE'];
const DURING: VehicleStatus[] = ['OPERATIONAL_WITH_OBSERVATIONS', 'OUT_OF_SERVICE'];
const SEVERITY_LABEL = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' } as const;
const TYPE_LABEL = { VEHICLE: 'Vehículo', ROUTE: 'Recorrido' } as const;

const hhmm = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--:--';

const errorText = (e: unknown) =>
  e instanceof ApiError ? e.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';

export default function DriverView() {
  const router = useRouter();
  const { user, signOut } = useSession();

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [draftStatus, setDraftStatus] = useState<VehicleStatus>('OPERATIONAL');
  const [statusNote, setStatusNote] = useState('');
  const [endNote, setEndNote] = useState('');
  const [incidentText, setIncidentText] = useState('');
  const [incidentType, setIncidentType] = useState<'VEHICLE' | 'ROUTE'>('VEHICLE');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  const load = useCallback(async () => {
    try {
      setShift(await getCurrentShift());
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Ejecuta una acción del backend y vuelve a leer el turno.
  const run = async (action: () => Promise<unknown>, ok?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      await load();
      if (ok) setMessage(ok);
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const handleBack = async () => {
    await signOut();
    router.replace('/');
  };

  const trips = shift?.trips ?? [];
  const tripInProgress = trips.find((t) => t.status === 'IN_PROGRESS');
  const nextTrip = trips.find((t) => t.status === 'SCHEDULED');
  const options = shift?.status === 'SCHEDULED' ? AT_START : DURING;
  const selected = options.includes(draftStatus) ? draftStatus : options[0];
  const needsNote = selected !== 'OPERATIONAL';
  const noteOk = !needsNote || statusNote.trim().length >= 10;

  const handleStartShift = () => {
    if (!shift) return;
    if (!noteOk) return setMessage('Describe el problema (mínimo 10 caracteres).');
    void run(
      () => startShift(shift.id, selected, needsNote ? statusNote.trim() : undefined),
      'Turno iniciado.',
    );
  };

  const handleSaveStatus = () => {
    if (!shift) return;
    if (!noteOk) return setMessage('Describe el problema (mínimo 10 caracteres).');
    void run(() => setVehicleStatus(shift.id, selected, statusNote.trim()), 'Estado registrado.');
  };

  const handleIncident = () => {
    if (!incidentText.trim()) return setMessage('Escribe la descripción de la incidencia.');
    void run(async () => {
      await reportIncident({ type: incidentType, severity, description: incidentText.trim() });
      setIncidentText('');
    }, 'Incidencia enviada al administrador.');
  };

  const statusPicker = (
    <>
      {options.map((s) => (
        <Pressable
          key={s}
          style={[styles.option, selected === s && styles.optionActive]}
          onPress={() => setDraftStatus(s)}
        >
          <Text style={[styles.optionText, selected === s && styles.optionTextActive]}>
            {STATUS_LABEL[s]}
          </Text>
        </Pressable>
      ))}
      {needsNote && (
        <TextInput
          style={styles.input}
          placeholder="Describe el problema (mín. 10 caracteres)"
          placeholderTextColor="#929DA2"
          value={statusNote}
          onChangeText={setStatusNote}
          multiline
        />
      )}
    </>
  );

  return (
    <MapPanelLayout
      title={`Bienvenido, ${user?.name ?? ''}`}
      onProfile={() => router.push('/profile')}
      summary={
        shift ? (
          <>
            <Text style={styles.cardTitle}>
              {shift.status === 'SCHEDULED' ? 'Próximo turno' : 'Turno en curso'}
            </Text>
            <Text style={styles.row}>Vehículo: {shift.vehicle?.identifier ?? '—'}</Text>
            <Text style={styles.row}>
              Horario: {hhmm(shift.scheduledStart)} – {hhmm(shift.scheduledEnd)}
            </Text>
            {tripInProgress && <Text style={styles.row}>Viaje {tripInProgress.sequence} en curso</Text>}
          </>
        ) : (
          <Text style={styles.muted}>{loading ? 'Cargando turno…' : 'Sin turnos asignados.'}</Text>
        )
      }
    >
        <View style={styles.container}>

          {message && <Text style={styles.message}>{message}</Text>}

          {loading && <Text style={styles.muted}>Cargando turno…</Text>}

          {!loading && !shift && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sin turnos</Text>
              <Text style={styles.muted}>No tienes turnos asignados por el administrador.</Text>
            </View>
          )}

          {shift && (
            <>
              {/* VEH-01 y VEH-03: turno y viajes */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {shift.status === 'SCHEDULED' ? 'Próximo turno' : 'Turno en curso'}
                </Text>
                <Text style={styles.row}>
                  Vehículo: {shift.vehicle?.identifier ?? '—'}
                  {shift.vehicle ? ` · ${STATUS_LABEL[shift.vehicle.status]}` : ''}
                </Text>
                <Text style={styles.row}>
                  Horario: {hhmm(shift.scheduledStart)} – {hhmm(shift.scheduledEnd)}
                </Text>
                {shift.actualStart && (
                  <Text style={styles.row}>Iniciado a las {hhmm(shift.actualStart)}</Text>
                )}

                <Text style={styles.sectionLabel}>Viajes</Text>
                {trips.length === 0 && <Text style={styles.muted}>Sin viajes asignados.</Text>}
                {trips.map((t) => (
                  <Text key={t.id} style={styles.row}>
                    Viaje {t.sequence} · Recorrido n.º {t.routeId} · {hhmm(t.scheduledStart)} ·{' '}
                    {TRIP_LABEL[t.status]}
                  </Text>
                ))}

                {shift.status === 'SCHEDULED' && (
                  <>
                    <Text style={styles.sectionLabel}>Estado en que recibes el vehículo</Text>
                    {statusPicker}
                    <Pressable
                      style={[styles.primaryButton, busy && styles.disabled]}
                      onPress={handleStartShift}
                      disabled={busy}
                    >
                      <Text style={styles.primaryText}>Iniciar turno</Text>
                    </Pressable>
                  </>
                )}

                {shift.status === 'IN_PROGRESS' && (
                  <>
                    <Text style={styles.gps}>
                      {tripInProgress
                        ? 'Viaje en curso. El envío de ubicación GPS se conecta en un paso posterior.'
                        : 'Sin viaje en curso.'}
                    </Text>

                    <Pressable
                      style={[styles.primaryButton, (busy || !!tripInProgress || !nextTrip) && styles.disabled]}
                      onPress={() => nextTrip && void run(() => startTrip(nextTrip.id), 'Viaje iniciado.')}
                      disabled={busy || !!tripInProgress || !nextTrip}
                    >
                      <Text style={styles.primaryText}>Iniciar viaje</Text>
                    </Pressable>

                    {tripInProgress && (
                      <TextInput
                        style={styles.input}
                        placeholder="Motivo (obligatorio si terminas antes del último paradero)"
                        placeholderTextColor="#929DA2"
                        value={endNote}
                        onChangeText={setEndNote}
                        multiline
                      />
                    )}
                    <Pressable
                      style={[styles.secondaryButton, (busy || !tripInProgress) && styles.disabled]}
                      onPress={() =>
                        tripInProgress &&
                        void run(
                          () => finishTrip(tripInProgress.id, endNote.trim() || undefined),
                          'Viaje finalizado.',
                        )
                      }
                      disabled={busy || !tripInProgress}
                    >
                      <Text style={styles.secondaryText}>Finalizar viaje</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.secondaryButton, (busy || !!tripInProgress) && styles.disabled]}
                      onPress={() => void run(() => finishShift(shift.id), 'Turno finalizado.')}
                      disabled={busy || !!tripInProgress}
                    >
                      <Text style={styles.secondaryText}>Finalizar turno</Text>
                    </Pressable>
                  </>
                )}
              </View>

              {/* VEH-02: alertas de parada */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Alertas de parada</Text>
                <Text style={styles.muted}>
                  Las solicitudes llegan en tiempo real (Socket.IO). Se conectan en un paso posterior.
                </Text>
              </View>

              {shift.status === 'IN_PROGRESS' && (
                <>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Estado del vehículo</Text>
                    {statusPicker}
                    <Pressable
                      style={[styles.primaryButton, busy && styles.disabled]}
                      onPress={handleSaveStatus}
                      disabled={busy}
                    >
                      <Text style={styles.primaryText}>Guardar estado</Text>
                    </Pressable>
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Reportar incidencia</Text>
                    <View style={styles.chips}>
                      {(Object.keys(TYPE_LABEL) as ('VEHICLE' | 'ROUTE')[]).map((t) => (
                        <Pressable
                          key={t}
                          style={[styles.chip, incidentType === t && styles.optionActive]}
                          onPress={() => setIncidentType(t)}
                        >
                          <Text style={styles.optionText}>{TYPE_LABEL[t]}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={styles.chips}>
                      {(Object.keys(SEVERITY_LABEL) as ('LOW' | 'MEDIUM' | 'HIGH')[]).map((s) => (
                        <Pressable
                          key={s}
                          style={[styles.chip, severity === s && styles.optionActive]}
                          onPress={() => setSeverity(s)}
                        >
                          <Text style={styles.optionText}>Gravedad {SEVERITY_LABEL[s]}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Describe la incidencia"
                      placeholderTextColor="#929DA2"
                      value={incidentText}
                      onChangeText={setIncidentText}
                      multiline
                    />
                    <Pressable
                      style={[styles.secondaryButton, busy && styles.disabled]}
                      onPress={handleIncident}
                      disabled={busy}
                    >
                      <Text style={styles.secondaryText}>Enviar al administrador</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </>
          )}
          <Pressable style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryText}>Cerrar sesión</Text>
          </Pressable>
        </View>
    </MapPanelLayout>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7F8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#26343B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backText: { fontSize: 20, color: '#26343B', fontWeight: 'bold' },
  topTitle: { fontSize: 18, fontWeight: 'bold', color: '#F5F7F8' },
  content: { flexGrow: 1, padding: 20 },
  container: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 16 },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#26343B' },
  message: {
    backgroundColor: '#DCE9EC',
    color: '#26343B',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#26343B', marginBottom: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#526C76', marginTop: 8 },
  row: { fontSize: 14, color: '#26343B' },
  muted: { fontSize: 14, color: '#718087' },
  gps: { fontSize: 13, color: '#526C76', marginTop: 8 },
  option: {
    borderWidth: 1,
    borderColor: '#C6D8DE',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F5F7F8',
  },
  optionActive: { backgroundColor: '#DCE9EC', borderColor: '#526C76' },
  optionText: { fontSize: 14, color: '#526C76' },
  optionTextActive: { color: '#26343B', fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderColor: '#C6D8DE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F7F8',
  },
  input: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: '#DCE9EC',
    borderRadius: 10,
    padding: 12,
    color: '#26343B',
    backgroundColor: '#F5F7F8',
    textAlignVertical: 'top',
  },
  primaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#26343B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#F5F7F8', fontWeight: 'bold', fontSize: 15 },
  secondaryButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6D8DE',
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: '#26343B', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
});