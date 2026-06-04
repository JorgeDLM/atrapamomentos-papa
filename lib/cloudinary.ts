import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function deleteCloudinaryImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export function getCloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto') {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  )
  return { timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY!, cloudName: process.env.CLOUDINARY_CLOUD_NAME! }
}
