import { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages([{ sender: 'ai', text: 'Hello 👋 I am LibraHub assistant' }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const reply = await sendMessageToGPT(input);

    setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text>{item.sender}: {item.text}</Text>
        )}
      />

      <TextInput
        value={input}
        onChangeText={setInput}
        onSubmitEditing={sendMessage}
        placeholder="Ask anything..."
      />
    </View>
  );
}