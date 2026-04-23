import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, UserCircle, History, BarChart3 } from 'lucide-react-native';
import { palette } from '@travelhealthbridge/shared/ui';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function TabsLayout() {
  return (
    <ProtectedLayout>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: palette.teal[600],
          tabBarInactiveTintColor: palette.navy[300],
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: palette.navy[50],
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: '800',
            color: palette.navy[900],
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="referrals"
          options={{
            title: 'Referrals',
            tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="feedback"
          options={{
            title: 'Feedback',
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedLayout>
  );
}
