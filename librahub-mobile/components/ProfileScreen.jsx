import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ user, onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         
        <Text style={styles.userName}>{user?.name || "User Name"}</Text>
        <Text style={styles.userEmail}>{user?.email || " No Email"}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{user?.phone || "Not set"}</Text>
        
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user?.role || "Student"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
 // profileImg: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#2f68aa' },
  userEmail: { fontSize: 16, color: 'gray' },
  infoSection: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10 },
  label: { fontSize: 14, color: '#888', marginTop: 10 },
  value: { fontSize: 18, color: '#333', fontWeight: '500' },
  logoutButton: { marginTop: 40, backgroundColor: '#ff4d4d', padding: 15, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold' }
});