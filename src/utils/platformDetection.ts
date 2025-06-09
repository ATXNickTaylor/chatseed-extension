// src/utils/platformDetection.ts

import { PLATFORMS } from '../config/platform';
import { PlatformType } from '../config/platform';

export function detectCurrentPlatform(): PlatformType | null {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const fullUrl = hostname + pathname;

  for (const [key, config] of Object.entries(PLATFORMS)) {
    if (fullUrl.includes(config.urlPattern)) {
      return key as PlatformType;
    }
  }

  return null;
}

export function getCurrentPlatformConfig() {
  const platform = detectCurrentPlatform();
  return platform ? PLATFORMS[platform] : null;
}

export function getPlatformDisplayName(platform: string): string {
  return PLATFORMS[platform]?.name || platform;
}

export function isSupportedPlatform(): boolean {
  return detectCurrentPlatform() !== null;
}