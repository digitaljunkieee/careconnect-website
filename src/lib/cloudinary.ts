import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_FOLDERS = {
  avatars: "careconnect/avatars",
  workers: "careconnect/workers",
  facilities: "careconnect/facilities",
  verification: "careconnect/verification"
} as const;

const IMAGE_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const DEFAULT_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

let isConfigured = false;

export type CloudinaryUploadResourceType = "image" | "video" | "raw" | "auto";

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  original_filename?: string;
};

export type CloudinaryUploadOptions = {
  folder: string;
  resourceType?: CloudinaryUploadResourceType;
  useFilename?: boolean;
  uniqueFilename?: boolean;
  overwrite?: boolean;
};

export type CloudinarySignatureOptions = {
  folder: string;
  publicId?: string;
  resourceType?: CloudinaryUploadResourceType;
  overwrite?: boolean;
};

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary environment variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  isConfigured = true;
}

export function getCloudinaryFolder(
  category: keyof typeof CLOUDINARY_FOLDERS,
  ...segments: string[]
) {
  return [CLOUDINARY_FOLDERS[category], ...segments.filter(Boolean)].join("/");
}

export function validateCloudinaryUploadFile(
  file: File,
  options?: {
    allowedMimeTypes?: Set<string>;
    maxSizeBytes?: number;
    label?: string;
  }
) {
  const allowedMimeTypes = options?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const label = options?.label ?? "File";

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error(
      `${label} type is not supported. Upload a PDF or an image (JPEG, PNG, WEBP, or GIF).`
    );
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMb = Math.round(maxSizeBytes / 1024 / 1024);
    throw new Error(`${label} size must be ${maxSizeMb}MB or smaller.`);
  }
}

export function validateWorkerDocumentFile(file: File) {
  validateCloudinaryUploadFile(file, {
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
    label: "Worker document"
  });
}

export function validateAvatarUploadFile(file: File) {
  validateCloudinaryUploadFile(file, {
    allowedMimeTypes: IMAGE_ALLOWED_MIME_TYPES,
    maxSizeBytes: 5 * 1024 * 1024,
    label: "Profile photo"
  });
}

async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions
) {
  configureCloudinary();

  return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? "auto",
        use_filename: options.useFilename ?? true,
        unique_filename: options.uniqueFilename ?? true,
        overwrite: options.overwrite ?? false
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          bytes: result.bytes,
          original_filename: result.original_filename
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadCloudinaryFile(
  file: File,
  options: CloudinaryUploadOptions
) {
  validateCloudinaryUploadFile(file, { label: options.folder });
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToCloudinary(buffer, options);
}

export async function uploadWorkerDocument(
  file: File,
  folder = getCloudinaryFolder("workers", "verification")
) {
  validateWorkerDocumentFile(file);
  return uploadCloudinaryFile(file, {
    folder,
    resourceType: "auto",
    useFilename: true,
    uniqueFilename: true,
    overwrite: false
  });
}

export async function uploadFacilityDocument(
  file: File,
  folder = getCloudinaryFolder("facilities", "documents")
) {
  return uploadCloudinaryFile(file, {
    folder,
    resourceType: "auto",
    useFilename: true,
    uniqueFilename: true,
    overwrite: false
  });
}

export async function uploadVerificationDocument(
  file: File,
  folder = getCloudinaryFolder("verification", "documents")
) {
  return uploadCloudinaryFile(file, {
    folder,
    resourceType: "auto",
    useFilename: true,
    uniqueFilename: true,
    overwrite: false
  });
}

export async function uploadUserAvatar(
  file: File,
  folder = getCloudinaryFolder("avatars")
) {
  validateAvatarUploadFile(file);

  return uploadCloudinaryFile(file, {
    folder,
    resourceType: "image",
    useFilename: true,
    uniqueFilename: true,
    overwrite: false
  });
}

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: CloudinaryUploadResourceType = "image"
) {
  configureCloudinary();

  if (!publicId) {
    return { deleted: false };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });

  return {
    deleted: result === "ok" || result.result === "ok"
  };
}

export async function replaceCloudinaryAsset(
  previousPublicId: string | undefined,
  file: File,
  options: CloudinaryUploadOptions
) {
  if (previousPublicId) {
    await deleteCloudinaryAsset(previousPublicId, options.resourceType ?? "image");
  }

  return uploadCloudinaryFile(file, options);
}

export function createCloudinaryUploadSignature(
  options: CloudinarySignatureOptions
) {
  configureCloudinary();

  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number | boolean | undefined> = {
    folder: options.folder,
    timestamp,
    overwrite: options.overwrite ?? false
  };

  if (options.publicId) {
    params.public_id = options.publicId;
  }

  if (options.resourceType && options.resourceType !== "auto") {
    params.resource_type = options.resourceType;
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET ?? ""
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    timestamp,
    folder: options.folder,
    publicId: options.publicId ?? "",
    resourceType: options.resourceType ?? "auto",
    overwrite: options.overwrite ?? false,
    signature
  };
}

export { cloudinary };
