import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import tw from 'twrnc';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterMed, setFilterMed] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const logsQ = query(collection(db, 'doseLogs'), where('user_id', '==', user.uid));
      const medsQ = query(collection(db, 'medications'), where('user_id', '==', user.uid));
      
      const [logsSnap, medsSnap] = await Promise.all([getDocs(logsQ), getDocs(medsQ)]);
      
      setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMedications(medsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPadding = startOfMonth(currentMonth).getDay();

  function getDayStatus(date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.dose_date === dateStr);
    if (dayLogs.length === 0) return null;
    const allTaken = dayLogs.every(l => l.status === 'taken');
    return allTaken ? 'perfect' : 'missed';
  }

  const filteredLogs = logs.filter(l => {
    const dateMatch = !selectedDate || l.dose_date === format(selectedDate, 'yyyy-MM-dd');
    const medMatch = filterMed === 'all' || l.medication_id === filterMed;
    return dateMatch && medMatch;
  });

  const totalTaken = logs.filter(l => l.status === 'taken').length;
  const overallAdherence = logs.length > 0 ? Math.round((totalTaken / logs.length) * 100) : 0;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView 
        contentContainerStyle={tw`p-5 pb-20`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-6`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>History</Text>
          <TouchableOpacity 
            style={tw`flex-row items-center bg-blue-50 px-3 py-2 rounded-lg`}
            onPress={() => Alert.alert("Doctor Report", "PDF Generation requires a native print library plugin.")}
          >
            <FileText color="#3B82F6" size={16} />
            <Text style={tw`text-blue-600 font-medium ml-2 text-xs`}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={tw`flex-row justify-between mb-6`}>
          <View style={tw`flex-1 bg-white border border-gray-200 rounded-2xl p-3 mr-2 items-center`}>
            <Text style={tw`text-xl font-bold text-gray-900`}>{logs.length}</Text>
            <Text style={tw`text-xs text-gray-500 mt-1`}>Total Logs</Text>
          </View>
          <View style={tw`flex-1 bg-white border border-gray-200 rounded-2xl p-3 mr-2 items-center`}>
            <Text style={tw`text-xl font-bold text-green-500`}>{totalTaken}</Text>
            <Text style={tw`text-xs text-gray-500 mt-1`}>Taken</Text>
          </View>
          <View style={tw`flex-1 bg-white border border-gray-200 rounded-2xl p-3 items-center`}>
            <Text style={tw`text-xl font-bold ${overallAdherence > 80 ? 'text-green-500' : 'text-amber-500'}`}>{overallAdherence}%</Text>
            <Text style={tw`text-xs text-gray-500 mt-1`}>Adherence</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={tw`bg-white border border-gray-200 rounded-3xl p-4 mb-6`}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft color="#6B7280" /></TouchableOpacity>
            <Text style={tw`text-base font-bold text-gray-900`}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight color="#6B7280" /></TouchableOpacity>
          </View>

          <View style={tw`flex-row mb-2`}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={tw`flex-1 text-center text-xs font-semibold text-gray-400`}>{d}</Text>
            ))}
          </View>

          <View style={tw`flex-row flex-wrap`}>
            {Array.from({ length: startPadding }).map((_, i) => <View key={`pad-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />)}
            {days.map(day => {
              const status = getDayStatus(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  onPress={() => setSelectedDate(isSelected ? null : day)}
                  style={[tw`items-center justify-center rounded-full`, { width: '14.28%', aspectRatio: 1 }, isSelected ? tw`bg-blue-600` : isToday ? tw`border border-blue-600` : null]}
                >
                  <Text style={tw`text-sm ${isSelected ? 'text-white font-bold' : isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </Text>
                  {status && !isSelected && (
                    <View style={tw`absolute bottom-1 w-1 h-1 rounded-full ${status === 'perfect' ? 'bg-green-500' : 'bg-red-400'}`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Timeline */}
        {loading ? <ActivityIndicator color="#3B82F6" /> : (
          <View style={tw`space-y-3`}>
            {filteredLogs.map(log => (
              <View key={log.id} style={tw`flex-row items-center bg-white border border-gray-200 rounded-2xl p-4`}>
                {log.status === 'taken' ? <CheckCircle2 color="#10B981" size={24} /> : <XCircle color="#EF4444" size={24} />}
                <View style={tw`flex-1 ml-3`}>
                  <Text style={tw`font-bold text-gray-900`}>{log.medication_name}</Text>
                  <Text style={tw`text-xs text-gray-500`}>{log.dose_date} at {log.taken_time ? format(new Date(log.taken_time), 'HH:mm') : log.scheduled_time}</Text>
                </View>
                <View style={tw`px-3 py-1 rounded-full ${log.status === 'taken' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text style={tw`text-xs font-bold ${log.status === 'taken' ? 'text-green-700' : 'text-red-700'}`}>{log.status.toUpperCase()}</Text>
                </View>
              </View>
            ))}
            {filteredLogs.length === 0 && <Text style={tw`text-center text-gray-500 mt-4`}>No logs found for this date.</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
