import { api } from '@/lib/api'
import type { ContactInput, MasterSchemaType } from '@/modules/schemas/tattoo'

export type CreateRequestResponse = {
  id: string
  trackingToken: string
  isExisting: boolean
}

export const generatorApi = {
  async createRequest(
    contact: ContactInput,
    values: MasterSchemaType,
  ): Promise<CreateRequestResponse> {
    return api<CreateRequestResponse>('/api/request', {
      method: 'POST',
      body: JSON.stringify({
        style: values.style,
        bodyZone: values.bodyZone,
        size: values.size,
        colorMode: values.colorMode,
        detailLevel: values.detailLevel,
        fullName: contact.fullName,
        whatsapp: contact.whatsapp,
      }),
    })
  },

  async updateStep2(
    requestId: string,
    specialInstructions?: string,
  ): Promise<void> {
    await api(`/api/request/${requestId}/step-2`, {
      method: 'PUT',
      body: JSON.stringify({
        specialInstructions: specialInstructions?.trim() || undefined,
      }),
    })
  },
}
