/**
 * OpenStatusBadge — shows provider availability status.
 * Variants: 'open' | 'opening_soon' | 'closed' | 'unconfirmed'
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import { Tag } from './Tag';
import { type OpenStatus } from '../utils/openStatus';

interface OpenStatusBadgeProps {
  status: OpenStatus;
  opensAt?: string;  // shown for opening_soon variant e.g. '11:00'
  size?: 'sm' | 'md';
  style?: ViewStyle;
  testID?: string;
}

export function OpenStatusBadge({
  status,
  opensAt,
  size = 'md',
  style,
  testID,
}: OpenStatusBadgeProps) {
  const { theme } = useTheme();

  switch (status) {
    case 'open':
      return (
        <Tag
          label="Open now"
          icon="●"
          backgroundColor={theme.openBg}
          textColor={theme.openText}
          borderColor={theme.openBorder}
          size={size}
          style={style}
          testID={testID}
        />
      );
    case 'opening_soon':
      return (
        <Tag
          label={opensAt ? `Opens at ${opensAt}` : 'Opens soon'}
          icon="◑"
          backgroundColor={theme.openingSoonBg}
          textColor={theme.openingSoonText}
          borderColor={theme.openingSoonBorder}
          size={size}
          style={style}
          testID={testID}
        />
      );
    case 'closed':
      return (
        <Tag
          label="Closed"
          icon="○"
          backgroundColor={theme.closedBg}
          textColor={theme.closedText}
          borderColor={theme.closedBorder}
          size={size}
          style={style}
          testID={testID}
        />
      );
    case 'unconfirmed':
    default:
      return (
        <Tag
          label="Availability unconfirmed"
          backgroundColor={theme.unconfirmedBg}
          textColor={theme.unconfirmedText}
          borderColor={theme.unconfirmedBorder}
          size={size}
          style={style}
          testID={testID}
        />
      );
  }
}
