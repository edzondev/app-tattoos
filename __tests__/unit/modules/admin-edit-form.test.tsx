import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as apiModule from '@/lib/api'
import { RequestStatus } from '@/lib/db/enums'
import AdminEditForm from '@/modules/admin/components/admin-edit-form'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    body: unknown
    constructor(status: number, body: unknown) {
      super(`API error ${status}`)
      this.name = 'ApiError'
      this.status = status
      this.body = body
    }
  },
}))

const mockApi = apiModule.api as ReturnType<typeof vi.fn>

describe('AdminEditForm — soles display, cents storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefresh.mockReset()
  })

  it('renders price and deposit inputs in soles from cents defaults', () => {
    render(
      <AdminEditForm
        defaults={{
          id: 'req-1',
          priceCents: 50000,
          depositCents: 15000,
          status: RequestStatus.SENT,
        }}
      />,
    )

    const priceInput = screen.getByLabelText(
      /Precio total \(S\/\)/,
    ) as HTMLInputElement
    const depositInput = screen.getByLabelText(
      /Adelanto \(S\/\)/,
    ) as HTMLInputElement

    expect(priceInput.value).toBe('500')
    expect(depositInput.value).toBe('150')
  })

  it('sends cents to the quote API when admin enters soles', async () => {
    mockApi.mockResolvedValue({})

    render(
      <AdminEditForm
        defaults={{
          id: 'req-1',
          priceCents: 10000,
          depositCents: 3000,
          status: RequestStatus.SENT,
        }}
      />,
    )

    fireEvent.change(screen.getByLabelText(/Precio total \(S\/\)/), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText(/Adelanto \(S\/\)/), {
      target: { value: '150' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledWith(
        '/api/admin/requests/req-1/quote',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    const [, init] = mockApi.mock.calls[0]
    const body = JSON.parse(init?.body as string)
    expect(body).toMatchObject({
      priceCents: 50000,
      depositCents: 15000,
      currency: 'PEN',
    })
  })
})
