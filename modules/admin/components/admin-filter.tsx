'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  Field,
  FieldContent,
  FieldError,
} from '@/modules/core/components/ui/field'
import { Input } from '@/modules/core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/core/components/ui/select'
import { useDebouncedCallback } from '@/modules/hooks/use-debounce'
import {
  type AdminFiltersValues,
  adminFiltersSchema,
  parseStatusFilter,
  STATUS_OPTIONS,
} from '@/modules/schemas/admin-filters.schema'

export default function AdminFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const form = useForm<AdminFiltersValues>({
    resolver: zodResolver(adminFiltersSchema),
    defaultValues: {
      search: searchParams.get('search') ?? '',
      status: parseStatusFilter(searchParams.get('status')),
    },
  })
  useEffect(() => {
    form.reset({
      search: searchParams.get('search') ?? '',
      status: parseStatusFilter(searchParams.get('status')),
    })
  }, [searchParams.get, form.reset]) // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  const handleSearch = useDebouncedCallback((value: string) =>
    navigate('search', value),
  )

  return (
    <form>
      <div className="w-full flex gap-x-6">
        <Controller
          control={form.control}
          name="search"
          render={({ field, fieldState }) => (
            <Field className="w-full lg:max-w-md">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  {...field}
                  placeholder="Nombre del cliente..."
                  className={cn(
                    'pl-9 bg-card/50 border-border/50 font-grotesk',
                    isPending ? 'opacity-60' : '',
                  )}
                  onChange={(e) => {
                    field.onChange(e)
                    handleSearch(e.target.value)
                  }}
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="gap-0" data-invalid={fieldState.invalid}>
              <FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  navigate('status', value)
                }}
              >
                <SelectTrigger
                  id="form-rhf-select-language"
                  aria-invalid={fieldState.invalid}
                  className="w-full lg:max-w-56"
                >
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>
    </form>
  )
}
