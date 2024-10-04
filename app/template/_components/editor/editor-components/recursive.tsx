import { EditorElement } from '@/providers/editor/editor-provider'
import Container from './container'
import DynamicImageComponent from './dynamic-image'
import DynamicTextComponent from './dynamic-text'
import DynamicVideoComponent from './dynamic-video'
import InputText from './InputText'
import LinkComponent from './link-component'
import TextComponent from './text'
import VideoComponent from './video'
import ImageComponent from './image'
import AudioComponent from './audio'
import DynamicAudioComponent from './dynamic-audio'
import Checkbox from './checkbox'
import DynamicCheckbox from './dynamic-checkbox'
import RecordAudioComponent from './recordAudio'
import RecordVideoComponent from './recordVideo'

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
    case 'image':
      return <ImageComponent element={element} />
    case 'dynamicAudio':
      return <DynamicAudioComponent element={element} />
    case 'audio':
      return <AudioComponent element={element} />
    case 'inputText':
      return <InputText element={element} />
    case 'link':
      return <LinkComponent element={element} />
    case 'checkbox':
      return <Checkbox element={element} />
    case 'dynamicCheckbox':
      return <DynamicCheckbox element={element} />
    case 'recordAudio':
      return <RecordAudioComponent element={element} />
    case 'recordVideo':
      return <RecordVideoComponent element={element} />
    default:
      return null
  }
}

export default Recursive
