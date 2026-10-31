import React from 'react';
import { View, type ViewProps } from 'react-native';

export type GlassSurfaceProps = ViewProps & { enabled: boolean; interactive?: boolean };

// Android and web use ordinary Views and never import the iOS glass module.
export function useLiquidGlass() { return false; }
export function GlassSurface({ enabled, interactive, ...props }: GlassSurfaceProps) {
  return <View {...props} />;
}
