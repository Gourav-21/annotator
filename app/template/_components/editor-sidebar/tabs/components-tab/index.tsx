import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '@/components/ui/accordion'
import { EditorBtns } from '@/lib/constants'
import React from 'react'
import ContainerPlaceholder from './container-placeholder'
import DynamicTextPlaceholder from './dynamic-text-placeholder'
import InputTextPlaceholder from './input-text-placeholder'
import LinkPlaceholder from './link-placeholder'
import TextPlaceholder from './text-placeholder'
import TwoColumnsPlaceholder from './two-columns-placeholder'
import VideoPlaceholder from './video-placeholder'
import DynamicVideoPlaceholder from './dynamic-video-placeholder  copy'
import DynamicImagePlaceholder from './dynamic-image-placeholder '


const ComponentsTab = () => {
  const elements: {
    Component: React.ReactNode
    label: string
    id: EditorBtns
    group: 'layout' | 'elements' | 'Dynamic Elements' | 'Inputs'
  }[] = [
    {
      Component: <TextPlaceholder />,
      label: 'Text',
      id: 'text',
      group: 'elements',
    },
    {
      Component: <DynamicTextPlaceholder />,
      label: 'Text',
      id: 'dynamicText',
      group: 'Dynamic Elements',
    },
    {
      Component: <InputTextPlaceholder />,
      label: 'Text',
      id: 'inputText',
      group: 'Inputs',
    },
    {
      Component: <DynamicVideoPlaceholder />,
      label: 'Video',
      id: 'dynamicVideo',
      group: 'Dynamic Elements',
    },
    {
      Component: <DynamicImagePlaceholder />,
      label: 'Image',
      id: 'dynamicImage',
      group: 'Dynamic Elements',
    },
    {
      Component: <ContainerPlaceholder />,
      label: 'Container',
      id: 'container',
      group: 'layout',
    },
    {
      Component: <TwoColumnsPlaceholder />,
      label: '2 Columns',
      id: '2Col',
      group: 'layout',
    },
    {
      Component: <VideoPlaceholder />,
      label: 'Video',
      id: 'video',
      group: 'elements',
    },
    {
      Component: <LinkPlaceholder />,
      label: 'Link',
      id: 'link',
      group: 'elements',
    },
  ]

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={['Layout', 'Elements','Dynamic Elements','Inputs']}
    >
      <AccordionItem
        value="Layout"
        className="px-6 py-0 border-y-[1px]"
      >
        <AccordionTrigger className="!no-underline">Layout</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'layout')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Elements"
        className="px-6 py-0 "
      >
        <AccordionTrigger className="!no-underline">Elements</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'elements')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Dynamic Elements"
        className="px-6 py-0 "
      >
        <AccordionTrigger className="!no-underline">Dynamic Elements</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'Dynamic Elements')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Inputs"
        className="px-6 py-0 "
      >
        <AccordionTrigger className="!no-underline">Inputs</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'Inputs')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ComponentsTab
