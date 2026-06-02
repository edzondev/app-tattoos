type Props = { requestCode: string | null }

export function RequestFooter({ requestCode }: Props) {
  return (
    <p className="pb-8 text-center font-grotesk text-xs text-muted-foreground">
      Guarda esta URL para consultar el estado de tu solicitud en cualquier
      momento.
      {requestCode ? (
        <>
          {' '}
          Código: <strong className="text-foreground">{requestCode}</strong>
        </>
      ) : null}
    </p>
  )
}
