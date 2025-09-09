import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

// Create helpers with error handling
let helpers: ReturnType<typeof generateReactHelpers<OurFileRouter>>;

try {
  helpers = generateReactHelpers<OurFileRouter>();
} catch (error) {
  console.warn("UploadThing helpers could not be generated:", error);
  // Provide fallback functions
  helpers = {
    useUploadThing: (() => ({
      startUpload: () => Promise.reject(new Error("UploadThing not configured")),
      isUploading: false,
    })) as any,
    uploadFiles: () => Promise.reject(new Error("UploadThing not configured")),
  } as any;
}

export const { useUploadThing, uploadFiles } = helpers;