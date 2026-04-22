import React, { createContext, useContext } from 'react';

export type UploadedImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type LibraryImage = {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
  uploadedAt?: string;
};

export type ImageCallbacks = {
  uploadImage?: (file: File) => Promise<UploadedImage>;
  loadImages?: () => Promise<LibraryImage[]>;
  deleteImage?: (url: string) => Promise<void>;
};

const ImageCallbacksContext = createContext<ImageCallbacks>({});

export function ImageCallbacksProvider({
  callbacks,
  children,
}: {
  callbacks: ImageCallbacks;
  children: React.ReactNode;
}) {
  return <ImageCallbacksContext.Provider value={callbacks}>{children}</ImageCallbacksContext.Provider>;
}

export function useImageCallbacks(): ImageCallbacks {
  return useContext(ImageCallbacksContext);
}
