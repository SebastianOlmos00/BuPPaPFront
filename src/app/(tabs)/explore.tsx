import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useSession } from '@/services/session';

const categories = [
  {
    id: 'igneas',
    title: 'Rocas ígneas',
    description: 'Formadas por el enfriamiento y solidificación del magma.',
    icon: '🌋',
  },
  {
    id: 'sedimentarias',
    title: 'Rocas sedimentarias',
    description: 'Originadas por la acumulación y compactación de sedimentos.',
    icon: '🏔️',
  },
  {
    id: 'metamorficas',
    title: 'Rocas metamórficas',
    description: 'Transformadas por presión y temperatura.',
    icon: '💎',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { status } = useSession();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const isGuest = status === 'guest';

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.title.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'todas' ||
        category.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TerraJut</Text>
          <Text style={styles.subtitle}>Exploración geológica</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isGuest ? 'Invitado' : 'Usuario'}
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Presentación */}
      <View style={styles.intro}>
        <Text style={styles.heading}>Catálogo de rocas</Text>

        <Text style={styles.description}>
          Explora el mundo geológico y descubre las
          características de diferentes rocas y minerales.
        </Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar una roca o categoría..."
          placeholderTextColor="#929A91"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtros */}
      <Text style={styles.sectionTitle}>Categorías</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          style={[
            styles.filter,
            selectedCategory === 'todas' && styles.activeFilter,
          ]}
          onPress={() => setSelectedCategory('todas')}
        >
          <Text
            style={[
              styles.filterText,
              selectedCategory === 'todas' && styles.activeFilterText,
            ]}
          >
            Todas
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.filter,
              selectedCategory === category.id && styles.activeFilter,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.id && styles.activeFilterText,
              ]}
            >
              {category.title.replace('Rocas ', '')}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Categorías disponibles */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Explora por tipo
        </Text>

        <Text style={styles.resultCount}>
          {filteredCategories.length} categorías
        </Text>
      </View>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <Pressable
            key={category.id}
            style={styles.categoryCard}
            onPress={() => {
              // Aquí conectaremos los resultados reales del catálogo.
            }}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryEmoji}>
                {category.icon}
              </Text>
            </View>

            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>
                {category.title}
              </Text>

              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔎</Text>

          <Text style={styles.emptyTitle}>
            No encontramos categorías
          </Text>

          <Text style={styles.emptyDescription}>
            Prueba con otro término de búsqueda.
          </Text>
        </View>
      )}

      {/* Reconocimiento */}
      <View style={styles.recognitionCard}>
        <Text style={styles.recognitionIcon}>◇</Text>

        <Text style={styles.recognitionTitle}>
          ¿No sabes qué roca encontraste?
        </Text>

        <Text style={styles.recognitionDescription}>
          Utiliza la herramienta de reconocimiento para
          identificar tus descubrimientos.
        </Text>
      </View>

      <Text style={styles.footer}>
        TerraJut · Aprende explorando
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5F0',
  },
  container: {
    padding: 22,
    paddingTop: 50,
    paddingBottom: 100,
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#263D39',
  },
  subtitle: {
    fontSize: 12,
    color: '#788078',
    marginTop: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  badge: {
    backgroundColor: '#DCE9D9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#496F5B',
    fontWeight: '600',
    fontSize: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCE9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 22,
  },
  intro: {
    marginBottom: 23,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#263D39',
  },
  description: {
    fontSize: 14,
    color: '#68746B',
    lineHeight: 22,
    marginTop: 9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DF',
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 28,
  },
  searchIcon: {
    fontSize: 25,
    color: '#496F5B',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: '#263D39',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263D39',
    marginBottom: 15,
  },
  filters: {
    gap: 9,
    paddingBottom: 25,
  },
  filter: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeFilter: {
    backgroundColor: '#496F5B',
    borderColor: '#496F5B',
  },
  filterText: {
    fontSize: 12,
    color: '#68746B',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 12,
    color: '#788078',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8DF',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: '#EAF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 29,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 13,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#263D39',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#788078',
    lineHeight: 18,
    marginTop: 5,
  },
  arrow: {
    fontSize: 25,
    color: '#496F5B',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#263D39',
    marginTop: 12,
  },
  emptyDescription: {
    color: '#788078',
    fontSize: 12,
    marginTop: 7,
  },
  recognitionCard: {
    backgroundColor: '#263D39',
    padding: 22,
    borderRadius: 18,
    marginTop: 20,
  },
  recognitionIcon: {
    color: '#DCE9D9',
    fontSize: 35,
    marginBottom: 10,
  },
  recognitionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recognitionDescription: {
    color: '#DCE9D9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#929A91',
    fontSize: 11,
    marginTop: 30,
  },
});
