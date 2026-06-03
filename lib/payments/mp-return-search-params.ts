/** Query params MP appends to back_urls after Checkout Pro (browser redirect only). */
export type MercadoPagoReturnSearchParams = {
  payment_id?: string
  collection_id?: string
  status?: string
  collection_status?: string
  external_reference?: string
}

type NextSearchParams = Record<string, string | string[] | undefined>

function pickSearchParam(
  searchParams: NextSearchParams,
  key: string,
): string | undefined {
  const value = searchParams[key]
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

/** Normalizes Next.js page searchParams for Mercado Pago return URLs. */
export function parseMercadoPagoReturnSearchParams(
  searchParams: NextSearchParams,
): MercadoPagoReturnSearchParams {
  return {
    payment_id: pickSearchParam(searchParams, 'payment_id'),
    collection_id: pickSearchParam(searchParams, 'collection_id'),
    status: pickSearchParam(searchParams, 'status'),
    collection_status: pickSearchParam(searchParams, 'collection_status'),
    external_reference: pickSearchParam(searchParams, 'external_reference'),
  }
}
