import { describe, expect, it } from 'vitest'
import {
  detectAttachmentMime,
  MAX_ATTACHMENT_SIZE,
  validAttachmentExtension,
} from '../../supabase/functions/_shared/attachment-validation'

describe('attachment validation shared with the Edge Function', () => {
  it('detects allowed binary signatures instead of trusting browser MIME', () => {
    expect(detectAttachmentMime(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf')
    expect(detectAttachmentMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(detectAttachmentMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]))).toBe(
      'image/png',
    )
    expect(detectAttachmentMime(new TextEncoder().encode('not-a-file'))).toBeNull()
  })

  it('requires an extension compatible with the detected signature', () => {
    expect(validAttachmentExtension('documento.PDF', 'application/pdf')).toBe(true)
    expect(validAttachmentExtension('documento.png', 'application/pdf')).toBe(false)
    expect(validAttachmentExtension('imagem.jpeg', 'image/jpeg')).toBe(true)
  })

  it('keeps the exact ten MiB server limit', () => {
    expect(MAX_ATTACHMENT_SIZE).toBe(10_485_760)
  })
})
