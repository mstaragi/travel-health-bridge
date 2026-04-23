import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Definitive Root Entry Point - Partitioned Origin
  return <Redirect href="/(triage)/step1-urgency" />;
}
