import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { GlassSurfaceProps } from './GlassSurface';

export function useLiquidGlass() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const available = isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', reduced => {
      revision += 1;
      setEnabled(available && !reduced);
    });
    const initialRevision = revision;
    AccessibilityInfo.isReduceTransparencyEnabled().then(reduced => {
      if (active && revision === initialRevision) setEnabled(available && !reduced);
    }).catch(() => { /* Keep opaque controls if accessibility status is unknown. */ });
    return () => { active = false; subscription.remove(); };
  }, []);
  return enabled;
}

export function GlassSurface({ enabled, interactive = false, ...props }: GlassSurfaceProps) {
  if (!enabled) return <View {...props} />;
  return <GlassView {...props} glassEffectStyle="regular" colorScheme="auto" isInteractive={interactive} />;
}
