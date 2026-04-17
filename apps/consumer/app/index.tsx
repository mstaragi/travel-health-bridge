import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect users to the beginning of the Triage Flow
  return <Redirect href="/(triage)/step1-urgency" />;
}
