import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useTheme } from '@travelhealthbridge/shared/ui/useTheme';
import { Button } from '@travelhealthbridge/shared/ui/Button';
import { supabase } from '@travelhealthbridge/shared/api/supabase';

const PRIOR_SOURCES = [
  'Hotel or guesthouse reception',
  'Google Maps or internet search',
  'A friend or local person',
  'My insurance helpline',
  'No — Travel Health Bridge was my first step'
];

export default function FeedbackScreen() {
  const { id } = useLocalSearchParams(); // sessionId
  const { theme } = useTheme();
  
  const [step, setStep] = useState(0);
  
  // State accumulators
  const [priorSource, setPriorSource] = useState<string | null>(null);
  const [gotHelp, setGotHelp] = useState<boolean | null>(null);
  const [visitedRecommended, setVisitedRecommended] = useState<boolean | null>(null);
  const [costAccurate, setCostAccurate] = useState<string | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [langComfort, setLangComfort] = useState<string | null>(null);
  const [reuseIntent, setReuseIntent] = useState<string | null>(null);
  // Comments omitted for brevity.

  // Mocked state - In reality, fetch from Supabase by sessionId
  const providerName = 'Apollo Clinic Connaught Place'; 

  const submitFinal = async () => {
    try {
      await supabase.from('feedback').insert({
        session_id: id,
        prior_recommendation_source: priorSource,
        visited_recommended_provider: visitedRecommended,
        language_comfort: langComfort,
        reuse_intent: reuseIntent,
        cost_accurate: costAccurate === 'Yes',
        star_rating: stars
      });
      Alert.alert('Thank you', 'Your feedback helps other travelers.', [
        { text: 'Done', onPress: () => router.push('/') }
      ]);
    } catch(e) { console.error(e) }
  };

  const nextStep = () => setStep(s => s + 1);

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: `Feedback (${step+1}/7)` }} />
      <ScrollView contentContainerStyle={styles.container}>
        
        {step === 0 && (
          <View style={styles.card}>
            <Text style={[styles.header, { color: theme.textPrimary }]}>Quick check before we start</Text>
            <Text style={[styles.question, { color: theme.textSecondary }]}>Before opening Travel Health Bridge, had anyone or anything already suggested a doctor to you?</Text>
            {PRIOR_SOURCES.map(source => (
              <TouchableOpacity key={source} style={[styles.optionBtn, { borderColor: theme.border, backgroundColor: priorSource === source ? theme.primaryLight : theme.surface }]} onPress={() => setPriorSource(source)}>
                <Text style={{ color: priorSource === source ? theme.primaryDark : theme.textPrimary }}>{source}</Text>
              </TouchableOpacity>
            ))}
            <View style={{height: 24}}/>
            <Button variant="primary" label="Continue" disabled={!priorSource} onPress={nextStep} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <Text style={[styles.question, { color: theme.textPrimary }]}>Did you get medical help?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button variant={gotHelp === true ? 'primary' : 'secondary'} label="Yes" onPress={() => setGotHelp(true)} />
              <Button variant={gotHelp === false ? 'primary' : 'secondary'} label="No" onPress={() => { setGotHelp(false); submitFinal(); }} />
            </View>
            <View style={{height: 24}}/>
            <Button variant="primary" label="Continue" disabled={gotHelp === null} onPress={nextStep} />
          </View>
        )}

        {step === 2 && gotHelp && (
          <View style={styles.card}>
            <Text style={[styles.question, { color: theme.textPrimary }]}>Did you go to {providerName}?</Text>
            <View style={{ gap: 12 }}>
              <Button variant={visitedRecommended === true ? 'primary' : 'secondary'} label={`Yes, I went to ${providerName}`} onPress={() => setVisitedRecommended(true)} />
              <Button variant={visitedRecommended === false ? 'primary' : 'secondary'} label="No, I went somewhere else" onPress={() => setVisitedRecommended(false)} />
            </View>
            <View style={{height: 24}}/>
            <Button variant="primary" label="Continue" disabled={visitedRecommended === null} onPress={() => visitedRecommended ? nextStep() : setStep(5)} /> 
            {/* If no, skip Cost/Stars/Language and go to Reuse Intent (step 5) */}
          </View>
        )}

        {step === 3 && visitedRecommended && (
          <View style={styles.card}>
            <Text style={[styles.question, { color: theme.textPrimary }]}>Was the cost within the quoted range?</Text>
            <View style={{ gap: 12 }}>
              {['Yes', 'No', 'Not sure'].map(o => (
                <Button key={o} variant={costAccurate === o ? 'primary' : 'secondary'} label={o} onPress={() => setCostAccurate(o)} />
              ))}
            </View>
            {costAccurate === 'No' && (
              <TouchableOpacity style={{marginTop: 16}}><Text style={{color: theme.danger}}>Report this overcharge ?</Text></TouchableOpacity>
            )}
            <View style={{height: 24}}/>
            <Button variant="primary" label="Continue" disabled={!costAccurate} onPress={nextStep} />
          </View>
        )}

        {step === 4 && visitedRecommended && (
          <View style={styles.card}>
             <Text style={[styles.question, { color: theme.textPrimary }]}>Rate your experience (1-5)</Text>
             {/* Simple mockup for stars */}
             <View style={{ flexDirection: 'row', gap: 8 }}>
               {[1,2,3,4,5].map(s => (
                 <TouchableOpacity key={s} onPress={() => setStars(s)} style={{ padding: 12, backgroundColor: stars === s ? theme.warning : theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8 }}>
                   <Text style={{fontWeight: 'bold', color: stars === s ? '#fff' : theme.textPrimary}}>{s} ?</Text>
                 </TouchableOpacity>
               ))}
             </View>
             <View style={{height: 24}}/>
            <Button variant="primary" label="Continue" disabled={!stars} onPress={nextStep} />
          </View>
        )}

        {step === 5 && (
           <View style={styles.card}>
              {visitedRecommended && (
              <View style={{marginBottom: 24}}>
                  <Text style={[styles.question, { color: theme.textPrimary }]}>Was communication in your language comfortable?</Text>
                  <View style={{ gap: 12 }}>
                    {['Yes', 'Partial', 'No'].map(o => (
                      <Button key={o} variant={langComfort === o ? 'primary' : 'secondary'} label={o} onPress={() => setLangComfort(o)} />
                    ))}
                  </View>
              </View>
              )}
              
              <Text style={[styles.question, { color: theme.textPrimary }]}>Would you use Travel Health Bridge again in another city?</Text>
              <View style={{ gap: 12 }}>
                {['Yes', 'No', 'Maybe'].map(o => (
                  <Button key={o} variant={reuseIntent === o ? 'primary' : 'secondary'} label={o} onPress={() => setReuseIntent(o)} />
                ))}
              </View>

              <View style={{height: 24}}/>
              <Button variant="primary" label="Submit Feedback" disabled={!reuseIntent || (visitedRecommended && !langComfort)} onPress={submitFinal} />
           </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  question: { fontSize: 16, marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  optionBtn: { padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 8 }
});


