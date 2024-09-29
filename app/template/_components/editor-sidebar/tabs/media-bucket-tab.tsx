'use client'
import MediaComponent from '@/components/media'
import { useEffect, useState } from 'react'

type Props = {
  subaccountId: string
}

const MediaBucketTab = (props: Props) => {
  const [data, setdata] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      // const response = await getMedia(props.subaccountId)
      // setdata(response)
    }
    // fetchData()
  }, [props.subaccountId])

  return (
    <div className="h-[900px] overflow-scroll p-4">
      <MediaComponent
        data={data}
        subaccountId={props.subaccountId}
      />
    </div>
  )
}

export default MediaBucketTab
