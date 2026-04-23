import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { palette, typography, spacing, borderRadius } from './tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  testID?: string;
}

export function Collapsible({ 
  title, 
  children, 
  initiallyExpanded = false, 
  icon,
  subtitle,
  testID 
}: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggle} 
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.titleRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.chevron}>
          {isExpanded ? <ChevronUp size={20} color={palette.navy[400]} /> : <ChevronDown size={20} color={palette.navy[400]} />}
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.navy[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: palette.navy[400],
    marginTop: 2,
    fontWeight: typography.fontWeight.medium,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.navy[50],
    paddingTop: spacing.md,
  },
});
