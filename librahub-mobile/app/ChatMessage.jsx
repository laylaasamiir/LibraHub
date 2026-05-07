import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.avatarText}>📚</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6, 
    maxWidth: '85%', 
  },
  userRow: {
    alignSelf: 'flex-end', 
    flexDirection: 'row-reverse', 
  },
  aiRow: {
    alignSelf: 'flex-start', 
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e1f5fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4, 
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF', 
    borderTopRightRadius: 4, 
  },
  aiBubble: {
    backgroundColor: '#f1f1f1', 
    borderTopLeftRadius: 4, 
  },
  text: {
    fontSize: 14,
    lineHeight: 20, 
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
});