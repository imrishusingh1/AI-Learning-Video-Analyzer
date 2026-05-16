import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadToCloudinary = (fileBuffer, folderName = 'synapseai') => {
  // Configure at call time so env vars are guaranteed to be loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folderName,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  // Configure at call time so env vars are guaranteed to be loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const tryDelete = (type) => new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, { resource_type: type }, (error, result) => {
      resolve({ error, result });
    });
  });

  // Try video first, then raw, then image (auto defaults)
  let { error, result } = await tryDelete('video');
  if (result?.result !== 'ok') {
    ({ error, result } = await tryDelete('raw'));
  }
  if (result?.result !== 'ok') {
    ({ error, result } = await tryDelete('image'));
  }

  if (result?.result === 'ok') {
    console.log(`Deleted ${publicId} from Cloudinary`);
    return result;
  } else {
    console.error(`Failed to delete ${publicId}:`, error || result);
    throw new Error('Failed to delete from Cloudinary');
  }
};

export const generateUploadSignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'synapseai';
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folder,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return { timestamp, signature, folder, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY };
};
