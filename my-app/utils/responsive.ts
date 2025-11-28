import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions - iPhone 11 Pro as reference
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scales a value based on the device's screen width
 * @param size - The size to scale
 * @returns The scaled size
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scales a value based on the device's screen height
 * @param size - The size to scale
 * @returns The scaled size
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scales font sizes based on screen width and pixel density
 * Ensures text remains readable on all devices
 * @param size - The font size to scale
 * @returns The scaled font size
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

/**
 * Moderately scales a value - less aggressive than scaleWidth
 * Good for spacing and padding
 * @param size - The size to scale
 * @param factor - Scaling factor (0-1, default 0.5)
 * @returns The moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Returns responsive width as percentage of screen width
 * @param percent - Percentage of screen width (0-100)
 * @returns The calculated width
 */
export const widthPercentage = (percent: number): number => {
  return (SCREEN_WIDTH * percent) / 100;
};

/**
 * Returns responsive height as percentage of screen height
 * @param percent - Percentage of screen height (0-100)
 * @returns The calculated height
 */
export const heightPercentage = (percent: number): number => {
  return (SCREEN_HEIGHT * percent) / 100;
};

/**
 * Checks if device is a small screen (width < 375)
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Checks if device is a tablet (width >= 768)
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Returns screen dimensions
 */
export const getScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
};

/**
 * Platform-specific spacing
 * Android often needs slightly different spacing than iOS
 */
export const platformSpacing = (ios: number, android: number): number => {
  return Platform.OS === 'ios' ? ios : android;
};
