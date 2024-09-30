'use client'
import { updateTask } from '@/app/actions/task'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { EditorBtns } from '@/lib/constants'
import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'

import React from 'react'

type Props = {
  element: EditorElement
}

const InputText = (props: Props) => {
  const { dispatch, state, subaccountId, funnelId, pageDetails } = useEditor()
  const router = useRouter()
  const [text,setText]=React.useState(pageDetails.content?.innerText || '')

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData('componentType', type)
  }

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
      },
    })
  }

  const styles = props.element.styles

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementDetails: props.element },
    })
  }

  const onFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    if (!state.editor.liveMode) return
    const content = JSON.stringify(state.editor.elements)
    // console.log(content)

    try {
      await updateTask({
        ...pageDetails,
        content,
      }, funnelId,subaccountId)
      toast({
        title: 'Success',
        description: 'Successfully submitted',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'submission failed',
      })
    }
  }
  console.log(props.element)
  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, 'inputText')}
      onClick={handleOnClickBody}
      className={clsx(
        'p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center',
        {
          '!border-blue-500':
            state.editor.selectedElement.id === props.element.id,

          '!border-solid': state.editor.selectedElement.id === props.element.id,
          'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}

        <form onSubmit={onFormSubmit}  className="flex w-full items-center space-x-2" >
          <Input type="text" placeholder="write here" required value={text} onChange={(e) => setText(e.target.value)} onBlur={(e) => {
            const spanElement = e.target as HTMLSpanElement
            const inputValue = e.target.value;
            dispatch({
              type: 'UPDATE_ELEMENT',
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    innerText: inputValue,
                  },
                },
              },
            })}} />
          <Button type="submit" disabled={pageDetails.submitted}>{pageDetails.submitted? "Submitted" : "Submit"}</Button>
        </form>

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  )
}

export default InputText
