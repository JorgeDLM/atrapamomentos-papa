export interface UploadedPhoto {
  id: string
  url: string
  cloudinaryId: string
  width: number
  height: number
  order: number
  [key: string]: unknown
}

/** Upload a file to Cloudinary and save its metadata to the DB. */
export async function uploadImage(
  file: File,
  saveEndpoint: string,
  saveExtra: Record<string, string> = {},
): Promise<UploadedPhoto> {
  const sigRes = await fetch('/api/upload-signature')
  if (!sigRes.ok) throw new Error('No se pudo obtener la firma de subida')

  const { timestamp, signature, apiKey } = await sigRes.json()
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'jorge-portfolio')
  fd.append('timestamp', String(timestamp))
  fd.append('signature', signature)
  fd.append('api_key', apiKey)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd },
  )
  if (!uploadRes.ok) throw new Error('Error al subir la imagen a Cloudinary')

  const uploaded = await uploadRes.json()

  const saveRes = await fetch(saveEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cloudinaryId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      ...saveExtra,
    }),
  })
  if (!saveRes.ok) throw new Error('Error al guardar la foto en la base de datos')

  return saveRes.json()
}

/** Upload a file to Cloudinary only — returns the public URL (for cover images). */
export async function uploadImageDirect(
  file: File,
): Promise<{ url: string; cloudinaryId: string; width: number; height: number }> {
  const sigRes = await fetch('/api/upload-signature')
  if (!sigRes.ok) throw new Error('No se pudo obtener la firma de subida')

  const { timestamp, signature, apiKey } = await sigRes.json()
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'jorge-portfolio')
  fd.append('timestamp', String(timestamp))
  fd.append('signature', signature)
  fd.append('api_key', apiKey)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd },
  )
  if (!uploadRes.ok) throw new Error('Error al subir la imagen')

  const uploaded = await uploadRes.json()
  return {
    cloudinaryId: uploaded.public_id,
    url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${uploaded.public_id}`,
    width: uploaded.width,
    height: uploaded.height,
  }
}
