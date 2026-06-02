'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import imageCompression from 'browser-image-compression'
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ColorMode, TattooStyle } from '@/lib/db/enums'
import { COLOR_MODE_LABELS, STYLE_LABELS } from '@/lib/labels'
import { Button } from '@/modules/core/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/core/components/ui/field'
import { Input } from '@/modules/core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/core/components/ui/select'
import { Textarea } from '@/modules/core/components/ui/textarea'
import { useFileUpload } from '@/modules/hooks/use-file-upload'
import {
  type PortfolioItemInput,
  PortfolioItemSchema,
} from '@/modules/schemas/portfolio'
import type { PortfolioItemWithImages } from './portfolio-grid'

type Props = {
  editItem?: PortfolioItemWithImages | null
  onSaved: () => void
  onCancel: () => void
}

export default function PortfolioForm({ editItem, onSaved, onCancel }: Props) {
  const uploadInputId = useId()
  const isEdit = !!editItem
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingImages, setExistingImages] = useState(editItem?.images ?? [])
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

  const form = useForm<PortfolioItemInput>({
    resolver: zodResolver(PortfolioItemSchema),
    mode: 'onTouched',
    defaultValues: {
      title: editItem?.title ?? '',
      style: editItem?.style ?? TattooStyle.COVER_UP,
      bodyZone: editItem?.bodyZone ?? '',
      colorMode: editItem?.colorMode ?? ColorMode.BLACK_AND_GREY,
      description: editItem?.description ?? '',
      isPublished: editItem?.isPublished ?? true,
      sortOrder: editItem?.sortOrder ?? 0,
    },
  })

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    accept: 'image/*',
    multiple: true,
  })

  const compressFile = async (file: File): Promise<File> => {
    return imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    })
  }

  const uploadImage = async (file: File, itemId: string) => {
    const compressed = await compressFile(file)
    const formData = new FormData()
    formData.append('file', compressed)
    formData.append('itemId', itemId)

    const res = await fetch('/api/portfolio/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? 'Error al subir imagen')
    }

    return res.json()
  }

  const deleteExistingImage = async (imageId: string) => {
    setDeletingImageId(imageId)
    try {
      const res = await fetch(`/api/admin/portfolio/images/${imageId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar imagen')
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch {
      setError('No se pudo eliminar la imagen')
    } finally {
      setDeletingImageId(null)
    }
  }

  const onSubmit = async (data: PortfolioItemInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = isEdit
        ? `/api/admin/portfolio/${editItem.id}`
        : '/api/admin/portfolio'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Error al guardar')
      }

      const saved = await res.json()
      const itemId = saved.id

      const newFiles = fileState.files
        .map((f) => f.file)
        .filter((f): f is File => f instanceof File)

      if (newFiles.length > 0) {
        setIsUploadingImages(true)
        await Promise.all(newFiles.map((file) => uploadImage(file, itemId)))
        setIsUploadingImages(false)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setIsUploadingImages(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isUploadingImages

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-grotesk transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al listado
      </button>

      <h2 className="font-bebas text-2xl tracking-wide mb-6">
        {isEdit ? 'Editar trabajo' : 'Nuevo trabajo'}
      </h2>

      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Título *</FieldLabel>
                <Input
                  {...field}
                  placeholder="Ej: Dragón en antebrazo"
                  disabled={isBusy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="style"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Estilo</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isBusy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estilo" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Object.entries(STYLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="bodyZone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Zona del cuerpo</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Ej: Antebrazo, Espalda"
                  disabled={isBusy}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="colorMode"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Color</FieldLabel>
                <div className="flex gap-3">
                  {Object.entries(COLOR_MODE_LABELS).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-center text-sm font-grotesk transition-colors ${
                        field.value === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="sr-only"
                        disabled={isBusy}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </Field>
            )}
          />
        </FieldGroup>

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Descripción</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ''}
                placeholder="Descripción opcional del trabajo..."
                rows={3}
                disabled={isBusy}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-center gap-6">
          <Controller
            name="isPublished"
            control={form.control}
            render={({ field }) => (
              <span className="inline-flex items-center gap-2 cursor-pointer font-grotesk text-sm">
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  disabled={isBusy}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    field.value ? 'bg-primary' : 'bg-input'
                  }`}
                >
                  <span
                    className={`pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      field.value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                Publicado
              </span>
            )}
          />
        </div>

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <div>
            <FieldLabel>Imágenes actuales</FieldLabel>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  {img.publicUrl ? (
                    <Image
                      src={img.publicUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="120px"
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-lg bg-ink-medium flex items-center justify-center">
                      <span className="text-muted-foreground/30 text-xs">
                        Sin URL
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(img.id)}
                    disabled={deletingImageId === img.id}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    {deletingImageId === img.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drop zone for new images */}
        <div>
          <FieldLabel>
            {isEdit ? 'Agregar más imágenes' : 'Imágenes'}
          </FieldLabel>
          <label
            htmlFor={uploadInputId}
            className={`mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              fileState.isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
            onDragEnter={fileActions.handleDragEnter}
            onDragLeave={fileActions.handleDragLeave}
            onDragOver={fileActions.handleDragOver}
            onDrop={fileActions.handleDrop}
          >
            <Upload className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground font-grotesk">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground/60 font-grotesk mt-1">
              Máx 10 MB por imagen. Se convertirán a WebP automáticamente.
            </p>
            <input
              {...fileActions.getInputProps({ id: uploadInputId })}
              className="hidden"
            />
          </label>

          {fileState.errors.length > 0 && (
            <div className="mt-2 text-sm text-destructive font-grotesk">
              {fileState.errors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}

          {fileState.files.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {fileState.files.map((f) => (
                <div key={f.id} className="relative group aspect-square">
                  {f.preview && (
                    <Image
                      src={f.preview}
                      alt=""
                      fill
                      unoptimized
                      sizes="120px"
                      className="rounded-lg object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileActions.removeFile(f.id)
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="font-grotesk text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isUploadingImages ? 'Subiendo imágenes…' : 'Guardando…'}
              </>
            ) : isEdit ? (
              'Guardar cambios'
            ) : (
              'Crear trabajo'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
