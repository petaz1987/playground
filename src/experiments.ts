export type ExperimentInput = {
  id: string
  type: 'text' | 'textarea'
  label: string
  placeholder: string
}

export type Experiment = {
  slug: string
  number: string
  title: string
  description: string
  pageDescription: string
  helperNote?: string
  inputHeading: string
  inputs: ExperimentInput[]
}

export const experiments: Experiment[] = [
  {
    slug: 'youtube-signals',
    number: '01',
    title: 'YouTube Signal Finder',
    description: 'Find real pains and business opportunities hidden in YouTube comments.',
    pageDescription: 'Find comments containing real pains or business opportunities.',
    helperNote: 'For speed, this demo analyzes up to 40 comments per video.',
    inputHeading: 'Add a video to explore',
    inputs: [
      {
        id: 'video',
        type: 'text',
        label: 'YouTube video URL or ID',
        placeholder: 'https://youtube.com/watch?v=…',
      },
    ],
  },
]
