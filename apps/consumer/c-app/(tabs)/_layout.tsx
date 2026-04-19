import React from 'react';
import { Tabs } from 'expo-router';
import ProtectedLayout from '../../components/ProtectedLayout';
import { palette } from '@travelhealthbridge/shared/ui/tokens';
import { Shield, Search, BriefcaseMedical } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <ProtectedLayout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: palette.navy[900],
            borderTopColor: palette.slate[800],
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: palette.teal[400],
          tabBarInactiveTintColor: palette.slate[500],
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
        }}
      >
        <Tabs.Screen
          name="emergency"
          options={{
            title: 'Emergency',
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: 'Vault',
            tabBarIcon: ({ color }) => <BriefcaseMedical size={24} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedLayout>
  );
}
