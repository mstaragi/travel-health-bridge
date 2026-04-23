/**
 * LanguagePill — Tag variant, colour-coded per language.
 * Colour map is defined in tokens.ts > languageColors.
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { Tag } from './Tag';
import { languageColors } from './tokens';

interface LanguagePillProps {
  language: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  testID?: string;
}

export function LanguagePill({ language, size = 'md', style, testID }: LanguagePillProps) {
  const colors = languageColors[language] ?? { bg: '#F5F5F5', text: '#616161' };

  return (
    <Tag
      label={language}
      backgroundColor={colors.bg}
      textColor={colors.text}
      size={size}
      style={style}
      testID={testID}
    />
  );
}
