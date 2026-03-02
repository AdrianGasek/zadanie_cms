type FooterLink = { label?: string | null; url?: string | null }
type LinkColumn = { links?: FooterLink[] | null }
type FooterData = {
  contactEmail?: string | null
  contactPhone?: string | null
  linkColumns?: LinkColumn[] | null
}

type Props = {
  footer: FooterData | null
}

export function Footer({ footer }: Props) {
  if (!footer) return null

  const { contactEmail, contactPhone, linkColumns } = footer

  return (
    <footer>
      Test Footer
    </footer>
  )
}
