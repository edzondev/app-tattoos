import type { InferSelectModel } from 'drizzle-orm'
import {
  colorModeEnum,
  requestStatusEnum,
  type tattooRequest,
  tattooSizeEnum,
  tattooStyleEnum,
} from './schema'

type TattooRequestRow = InferSelectModel<typeof tattooRequest>

export type TattooStyle = TattooRequestRow['style']
export type TattooSize = TattooRequestRow['size']
export type ColorMode = TattooRequestRow['colorMode']
export type RequestStatus = NonNullable<TattooRequestRow['status']>

function toEnumObject<const T extends readonly string[]>(values: T) {
  return Object.fromEntries(values.map((value) => [value, value])) as {
    [K in T[number]]: K
  }
}

/** Runtime enum map (e.g. `TattooStyle.COVER_UP`) — derived from Drizzle `pgEnum`. */
export const TattooStyle = toEnumObject(tattooStyleEnum.enumValues)
export const TattooSize = toEnumObject(tattooSizeEnum.enumValues)
export const ColorMode = toEnumObject(colorModeEnum.enumValues)
export const RequestStatus = toEnumObject(requestStatusEnum.enumValues)

export const TATTOO_STYLE_VALUES = tattooStyleEnum.enumValues
export const TATTOO_SIZE_VALUES = tattooSizeEnum.enumValues
export const COLOR_MODE_VALUES = colorModeEnum.enumValues
export const REQUEST_STATUS_VALUES = requestStatusEnum.enumValues
