import { EditorElement } from '@/providers/editor/editor-provider'
import Container from './container'
import DynamicImageComponent from './dynamic-image'
import DynamicTextComponent from './dynamic-text'
import DynamicVideoComponent from './dynamic-video'
import InputText from './InputText'
import LinkComponent from './link-component'
import TextComponent from './text'
import VideoComponent from './video'

type Props = {
  element: EditorElement
}

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case 'text':
      return <TextComponent element={element} />
    case 'container':
      return <Container element={element} />
    case 'video':
      return <VideoComponent element={element} />
    case '2Col':
      return <Container element={element} />
    case '__body':
      return <Container element={element} />
    case 'dynamicText':
      return <DynamicTextComponent element={element} />
    case 'dynamicVideo':
      return <DynamicVideoComponent element={element} />
    case 'dynamicImage':
      return <DynamicImageComponent element={element} />
    case 'inputText':
      return <InputText element={element} />
    case 'link':
      return <LinkComponent element={element} />
    default:
      return null
  }
}

export default Recursive
