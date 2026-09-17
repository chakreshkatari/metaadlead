import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';

// replace with your ngrok https URL once the server is running
const SERVER_URL = 'https://magma-unfazed-setting.ngrok-free.dev';

type Lead = {
  id: string;
  createdTime?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
};

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => console.log('connected to server'));
    socket.on('new_lead', (lead: Lead) => {
      setLeads((prev) => [lead, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leads</Text>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Waiting for leads...</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.full_name || 'No name'}</Text>
            <Text>{item.email}</Text>
            <Text>{item.phone_number}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  name: { fontWeight: '600', fontSize: 16 },
});
