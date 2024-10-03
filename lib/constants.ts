
export type EditorBtns =
  | 'dynamicVideo'
  | 'dynamicText'
  | 'text'
  | 'container'
  | 'section'
  | 'contactForm'
  | 'paymentForm'
  | 'link'
  | '2Col'
  | 'video'
  | '__body'
  | 'image'
  | null
  | '3Col'
  | 'inputText'
  | 'dynamicImage'
  | 'audio'
  | 'dynamicAudio'

export const defaultStyles: React.CSSProperties = {
  backgroundPosition: 'center',
  objectFit: 'cover',
  backgroundRepeat: 'no-repeat',
  textAlign: 'left',
  opacity: '100%',
}

export const defaultContent = JSON.stringify([
  {
    content: [],
    id: '__body',
    name: 'Body',
    styles: { backgroundColor: 'white' },
    type: '__body',
  },
]);

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'outline'
    case 'accepted':
      return 'default'
    case 'rejected':
      return 'destructive'
    case 'reassigned':
      return 'secondary'
    default:
      return 'default'
  }
}