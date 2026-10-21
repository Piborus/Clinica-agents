export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024

export function detectAttachmentMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-') {
    return 'application/pdf'
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)
  ) {
    return 'image/png'
  }
  return null
}

export function validAttachmentExtension(name: string, mime: string): boolean {
  if (mime === 'application/pdf') return /\.pdf$/i.test(name)
  if (mime === 'image/jpeg') return /\.jpe?g$/i.test(name)
  if (mime === 'image/png') return /\.png$/i.test(name)
  return false
}
