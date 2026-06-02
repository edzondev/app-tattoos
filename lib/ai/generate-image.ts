import { google } from '@ai-sdk/google'
import { generateImage } from 'ai'

const MODEL_ID = 'gemini-2.5-flash-image'

export async function generateImages(prompt: string) {
  const { image } = await generateImage({
    model: google.image(MODEL_ID),
    prompt,
    aspectRatio: '1:1',
    maxImagesPerCall: 2,
  })

  return image.uint8Array
}
