export interface UploadedPhoto {
  id: string
  url: string
  cloudinaryId: string
  width: number
  height: number
  order: number
  [key: string]: unknown
}

interface CloudinaryUploadResult {
  cloudinaryId: string
  url: string
  width: number
  height: number
}

async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    const msg = errBody?.error ?? `HTTP ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

/** Upload a file to Cloudinary and save its metadata to the DB. */
export async function uploadImage(
  file: File,
  saveEndpoint: string,
  saveExtra: Record<string, string> = {},
): Promise<UploadedPhoto> {
  const { cloudinaryId, width, height } = await uploadToCloudinary(file)

  const saveRes = await fetch(saveEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cloudinaryId, width, height, ...saveExtra }),
  })
  if (!saveRes.ok) throw new Error('Error al guardar la foto en la base de datos')

  return saveRes.json()
}

/** Upload a file to Cloudinary only — returns the public URL (for cover images). */
export async function uploadImageDirect(file: File): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file)
}
