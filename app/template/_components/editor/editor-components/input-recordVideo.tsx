'use client'
import { updateTask } from '@/app/actions/task';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useStatus from '@/hooks/use-status';
import useTimer from '@/hooks/use-timer';
import { EditorBtns } from '@/lib/constants';
import { EditorElement, useEditor } from '@/providers/editor/editor-provider';
import { useUploadThing } from '@/utils/uploadthing';
import clsx from 'clsx';
import { Send, Trash } from 'lucide-react';
import { set } from 'mongoose';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import { useReactMediaRecorder } from "react-media-recorder";
import ReactPlayer from 'react-player';
import { toast } from 'sonner';

type Props = {
  element: EditorElement
}

const InputRecordVideoComponent = (props: Props) => {
  const { dispatch, state, subaccountId, funnelId, pageDetails } = useEditor()
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({ video: true });
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(false)
  const session = useSession()
  const router = useRouter()
  const { time, running, setRunning } = useTimer()
  const { status: STATUS, submitted } = useStatus()

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream
    }
  }, [previewStream])

  const styles = props.element.styles

  const initialSrc = React.useMemo(() => {
    if (Array.isArray(props.element.content) || (STATUS === 'reassigned' && submitted == false)) {
      return ''
    }
    return props.element.content?.src || ''
  }, [props.element.content])

  const [src, setSrc] = React.useState(initialSrc)

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData('componentType', type)
  }

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
      },
    })
  }

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementDetails: props.element },
    })
  }

  useEffect(() => {
    console.log(props.element.content)
    async function onClientUploadComplete() {
      const content = JSON.stringify(state.editor.elements)
      try {
        await updateTask({
          ...pageDetails,
          content,
        }, funnelId, subaccountId, time)

        toast.success("Successfully submitted")
        router.back()
      } catch (error) {
        console.log(error)
        toast.error("Submission failed")
      }
      setLoading(false)
    }

    if (loading && props.element.content.src !== "") {
      onClientUploadComplete()
    }

  }, [src])


  const { startUpload, routeConfig } = useUploadThing("videoUploader", {
    onClientUploadComplete: (data) => {
      setLoading(true)
      toast('Recording uploaded successfully')
      if (!Array.isArray(props.element.content)) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            elementDetails: {
              ...props.element,
              content: {
                ...props.element.content,
                src: data[0].url,
              },
            },
          },
        })
      }

      setSrc(data[0].url)
    },
    onUploadError: () => {
      alert("error occurred while uploading");
      setLoading(false)
    },
    onUploadBegin: () => {
      console.log("upload has begun");
      setRunning(false)
    },
  });

  async function submitRecording() {
    if (mediaBlobUrl) {
      setLoading(true)
      // console.log('Submitting recording:', mediaBlobUrl)
      const videoBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
      startUpload([videoFile])
    }
  }


  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, 'inputRecordVideo')}
      onClick={handleOnClick}
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


      {!Array.isArray(props.element.content) && src == '' && (
        <div className=" container mx-auto py-10">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                {(status === 'recording' || status === 'stopping') && (<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />)}
                {status === 'stopped' && mediaBlobUrl && (
                  <ReactPlayer
                    url={mediaBlobUrl}
                    controls
                    width="100%"
                    height="100%"
                  />
                )}
              </div>
              <div className="flex justify-between items-center">
                <Button disabled={session.data?.user.role == 'project manager'}
                  onClick={status === 'recording' ? stopRecording : startRecording}
                  variant={status === 'recording' ? "destructive" : "default"}
                >
                  {status === 'recording' ? "Stop Recording" : "Start Recording"}
                </Button>
                {!state.editor.liveMode && (
                  <div className="flex mb-0 mt-2 justify-center">
                    Annotator Input
                  </div>
                )}
                {status === 'stopped' && mediaBlobUrl && (
                  <Button onClick={submitRecording} disabled={loading} className="">
                    <Send className="mr-2 h-4 w-4" /> {loading ? 'Submiting...' : 'Submit'}
                  </Button>)}
              </div>
            </CardContent>

          </Card>
        </div>
      )}

      {(src !== '') && (
        <div className="">
          <ReactPlayer
            url={src}
            controls
            width={styles?.width || '560px'}
            height={styles?.height || '315px'}
          />
        </div>
      )}



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

export default InputRecordVideoComponent
