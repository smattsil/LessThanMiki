import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { GlassSurface, useLiquidGlass } from './components/GlassSurface';

type Message = { id: string; text: string; sentAt: number };
const STORAGE_KEY = 'miki.messages.v1';
const palettes = {
  light: { bg: '#FFFFFF', text: '#111B21', muted: '#77838B', line: '#EDF0F2', green: '#008C69', tab: '#D9F7E8', canvas: '#F4F0E8', bubble: '#D9FDD3', input: '#FFFFFF', soft: '#F3F5F6', avatar: '#E9EDEF' },
  dark: { bg: '#101B20', text: '#E9EDEF', muted: '#91A1AA', line: '#243239', green: '#25D3A0', tab: '#164B3C', canvas: '#0B1418', bubble: '#075E4B', input: '#202D34', soft: '#1B2930', avatar: '#2C3A41' },
};
function AppContent() {
  const glass = useLiquidGlass();
  const dark = useColorScheme() === 'dark';
  const c = palettes[dark ? 'dark' : 'light'];
  const [inChat, setInChat] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const list = useRef<FlatList<Message>>(null);
  const saving = useRef(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      const data: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data) || !data.every(m => m && typeof m.id === 'string' && typeof m.text === 'string' && typeof m.sentAt === 'number')) throw new Error('Invalid message data');
      if (active) { setMessages(data); setLoaded(true); }
    }).catch(() => { if (active) setStorageError(true); });
    return () => { active = false; };
  }, []);
  const icon = (name: React.ComponentProps<typeof Ionicons>['name'], size = 24, color = c.text) => <Ionicons name={name} size={size} color={color} />;
  const avatar = (size = 56) => <View accessibilityLabel="Blank profile picture" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.avatar }} />;
  const send = async () => {
    const text = draft.trim();
    if (!text || !loaded || saving.current) return;
    saving.current = true;
    const next = [...messages, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, sentAt: Date.now() }];
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setMessages(next); setDraft(''); setStorageError(false); }
    catch { setStorageError(true); Alert.alert('Message not saved', 'Your message is still in the composer. Please try again.'); }
    finally { saving.current = false; }
  };
  const last = messages[messages.length - 1];
  const time = (n: number) => new Date(n).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return <SafeAreaView style={[s.root, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>
    <StatusBar style={dark ? 'light' : 'dark'} />
    {inChat ? <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <GlassSurface enabled={glass} style={[s.chatHeader, { borderBottomColor: c.line }, glass && s.glassHeader]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to chats" onPress={() => setInChat(false)} style={s.back}>{icon('chevron-back', 28, c.green)}</Pressable>
        {avatar(40)}<View style={s.chatIdentity}><Text style={[s.contactName, { color: c.text }]}>Miki</Text><Text style={[s.caption, { color: c.muted }]}>Local conversation</Text></View>
      </GlassSurface>
      {storageError && <Text accessibilityRole="alert" style={[s.notice, { color: c.text, backgroundColor: c.soft }]}>Device storage is unavailable. {loaded ? 'Try sending again.' : 'Restart the app to retry loading your messages.'}</Text>}
      <FlatList ref={list} data={messages} keyExtractor={m => m.id} style={{ backgroundColor: c.canvas }} contentContainerStyle={s.messageList} onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<View style={s.chatIntro}><Text style={[s.dateBadge, { color: c.muted, backgroundColor: c.input }]}>YOUR CONVERSATION</Text><Text style={[s.localNote, { color: c.muted }]}>A little space for your words. Messages are saved on this device only.</Text></View>}
        ListEmptyComponent={<Text style={[s.emptyChat, { color: c.muted }]}>{loaded ? 'Say hello to Miki 👋' : 'Loading your conversation…'}</Text>}
        renderItem={({ item, index }) => <View>
          {(index === 0 || new Date(messages[index - 1].sentAt).toDateString() !== new Date(item.sentAt).toDateString()) && <Text style={[s.dayLabel, { color: c.muted }]}>{new Date(item.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>}
          <View style={[s.bubble, { backgroundColor: c.bubble }]}><Text style={[s.messageText, { color: c.text }]}>{item.text}</Text><View style={s.messageMeta}><Text style={[s.caption, { color: c.muted }]}>{time(item.sentAt)}</Text>{icon('checkmark', 15, c.muted)}</View></View>
        </View>} />
      <View style={[s.composer, { backgroundColor: c.canvas }]}><GlassSurface enabled={glass} style={[s.inputSurface, { backgroundColor: glass ? 'transparent' : c.input }]}><TextInput accessibilityLabel="Message Miki" placeholder="Message" placeholderTextColor={c.muted} value={draft} onChangeText={setDraft} multiline maxLength={5000} style={[s.messageInput, { color: c.text, backgroundColor: 'transparent' }]} /></GlassSurface><Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!loaded || !draft.trim()} onPress={send} style={[s.send, { backgroundColor: c.green, opacity: loaded && draft.trim() ? 1 : 0.45 }]}>{icon('send', 21, dark ? '#082A20' : '#FFFFFF')}</Pressable></View>
    </KeyboardAvoidingView> : <>
      <View style={s.pageHeader}><Text style={[s.eyebrow, { color: c.green }]}>LESS THAN MIKI</Text><Text accessibilityRole="header" style={[s.title, { color: c.text }]}>Chats</Text></View>
      <View style={s.root}>
        <GlassSurface enabled={glass} style={[s.search, { backgroundColor: glass ? 'transparent' : c.soft }]}>{icon('search-outline', 21, c.muted)}<TextInput accessibilityLabel="Search chats" placeholder="Search" placeholderTextColor={c.muted} value={query} onChangeText={setQuery} style={[s.searchInput, { color: c.text }]} /></GlassSurface>
        <View style={[s.filter, { backgroundColor: c.tab }]}><Text style={{ color: c.green, fontWeight: '600' }}>All</Text></View>
        {'miki'.includes(query.trim().toLowerCase()) ? <Pressable accessibilityRole="button" accessibilityLabel="Open chat with Miki" onPress={() => setInChat(true)} style={s.contact}>{avatar()}<View style={[s.contactDetails, { borderBottomColor: c.line }]}><View style={s.contactHeading}><Text style={[s.contactName, { color: c.text }]}>Miki</Text>{last && <Text style={[s.caption, { color: c.muted }]}>{time(last.sentAt)}</Text>}</View><Text numberOfLines={1} style={[s.preview, { color: c.muted }]}>{last ? `You: ${last.text}` : 'Tap to start a conversation'}</Text></View></Pressable> : <Text style={[s.noResults, { color: c.muted }]}>No chats found</Text>}
        <View style={s.listFooter}>{icon('lock-closed-outline', 13, c.muted)}<Text style={[s.caption, { color: c.muted }]}>Your messages stay on this device.</Text></View>
      </View>
      <GlassSurface enabled={glass} style={[s.tabs, { borderTopColor: c.line }, glass && s.glassTabs]}>
        <View accessibilityRole="tab" accessibilityState={{ selected: true }} accessibilityLabel="Chats" style={s.tab}>
          <View style={[s.tabIcon, { backgroundColor: c.tab }]}>{icon('chatbubbles', 23, c.green)}</View>
          <Text style={[s.tabLabel, { color: c.text }]}>Chats</Text>
        </View>
      </GlassSurface>
    </>}
  </SafeAreaView>;
}
export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }
const s = StyleSheet.create({
  glassTabs: { marginHorizontal: 20, marginBottom: 8, borderRadius: 34, borderTopWidth: 0, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  glassHeader: { marginHorizontal: 10, marginVertical: 6, borderRadius: 28, borderBottomWidth: 0 },
  inputSurface: { flex: 1, borderRadius: 24 },
  root: { flex: 1 }, pageHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.3, marginBottom: 12 }, title: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  search: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 13, paddingHorizontal: 13, minHeight: 46 }, searchInput: { flex: 1, fontSize: 16, padding: 12 }, filter: { margin: 20, marginBottom: 8, paddingHorizontal: 17, paddingVertical: 8, alignSelf: 'flex-start', borderRadius: 20 },
  contact: { flexDirection: 'row', paddingLeft: 20, alignItems: 'center', gap: 14 }, contactDetails: { flex: 1, paddingVertical: 23, paddingRight: 22, borderBottomWidth: StyleSheet.hairlineWidth }, contactHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, contactName: { fontSize: 17, fontWeight: '600' }, preview: { fontSize: 14, marginTop: 6 }, caption: { fontSize: 11, lineHeight: 16 }, listFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 24 }, noResults: { textAlign: 'center', padding: 30 },
  tabs: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, paddingBottom: 9 }, tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 54 }, tabIcon: { width: 66, height: 31, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, tabLabel: { fontSize: 12, fontWeight: '600' },

  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 20, borderBottomWidth: StyleSheet.hairlineWidth }, back: { padding: 10 }, chatIdentity: { marginLeft: 12, gap: 2 }, messageList: { padding: 16, flexGrow: 1 }, chatIntro: { alignItems: 'center', paddingVertical: 14, gap: 16 }, dateBadge: { fontSize: 10, letterSpacing: 1, borderRadius: 7, paddingHorizontal: 13, paddingVertical: 7 }, localNote: { fontSize: 12, textAlign: 'center', lineHeight: 19, maxWidth: 270 }, emptyChat: { textAlign: 'center', marginTop: 54, fontSize: 15 }, dayLabel: { textAlign: 'center', fontSize: 11, marginVertical: 14 }, bubble: { alignSelf: 'flex-end', maxWidth: '85%', minWidth: 90, borderRadius: 14, borderTopRightRadius: 4, paddingHorizontal: 12, paddingTop: 9, paddingBottom: 5, marginVertical: 4 }, messageText: { fontSize: 16, lineHeight: 23 }, messageMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3 }, composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 9 }, messageInput: { minHeight: 47, maxHeight: 130, borderRadius: 24, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontSize: 16 }, send: { width: 47, height: 47, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, notice: { padding: 12, fontSize: 12 },
});
