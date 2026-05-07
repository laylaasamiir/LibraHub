import { useState, useEffect, useRef } from 'react';
import { 
  TextInput, FlatList, StyleSheet, KeyboardAvoidingView, 
  Platform, View, ActivityIndicator, Text, Pressable 
} from 'react-native';
import { useRouter } from "expo-router"; 
import ChatMessage from './ChatMessage';
import { sendMessageToGPT } from './sendMessageToGPT';

export default function ChatWindow() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); 
  const flatListRef = useRef();

  useEffect(() => {
    const welcome = { sender: 'ai', text: 'أهلاً بك في LibraHub! كيف يمكنني مساعدتك اليوم؟ 📚' };
    setMessages([welcome]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiReply = await sendMessageToGPT(input);
      const aiMessage = { sender: 'ai', text: aiReply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
     
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{fontSize: 24}}>⬅️</Text>
        </Pressable>
        <Text style={styles.headerTitle}>مساعد LibraHub الذكي 🤖</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2f68aa" />
          <Text style={styles.loadingText}>يفكر الآن...</Text>
        </View>
      )}

     
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اسأل عن كتاب أو معلومة..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          editable={!loading}
        />
        <Pressable onPress={sendMessage} disabled={loading}>
          <Text style={[styles.sendIcon, { opacity: loading ? 0.5 : 1 }]}>🚀</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row-reverse',  
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2f68aa',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    padding: 5,
  },
  messageList: {
    padding: 15,
    paddingBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#777',
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row-reverse', 
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'right',
    marginLeft: 10,
  },
  sendIcon: {
    fontSize: 24,
    padding: 5,
  },
});