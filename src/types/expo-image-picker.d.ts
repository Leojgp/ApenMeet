declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    cancelled: boolean;
    assets: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
    }>;
  }

  export interface ImagePickerOptions {
    mediaTypes?: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export enum MediaTypeOptions {
    All = 'All',
    Images = 'Images',
    Videos = 'Videos',
  }

  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string }>;
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
} 