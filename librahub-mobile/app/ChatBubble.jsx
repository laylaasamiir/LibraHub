import React from 'react';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
 
import { Ionicons } from '@expo/vector-icons'; 

export default function FloatingChatButton() {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={() => {  }}>
   
      <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
     
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 90,  
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
   
    backgroundColor: '#3D7FFF',  
    justifyContent: 'center',
    alignItems: 'center',
   
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, 
  },
 
  botImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
});