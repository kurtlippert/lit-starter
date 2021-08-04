import * as R from 'fp-ts-routing'
import { html, render, TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat'
import { Immutable } from './helpers'
import { eitherGet } from './server'

// #region typings
interface Photo {
  id: string
  title: string
  thumbnailUrl: string
}

interface State {
  counter: number
  arePhotosLoading: boolean
  photos: Photo[]
  photoId: number
  isStuffLoading: boolean
  testStuff: string,
  location: Location
}

interface Home {
  readonly type: 'Home'
}

interface About {
  readonly type: 'About'
}

interface Topics {
  readonly type: 'Topics'
}

interface TopicsId {
  readonly type: 'TopicsId'
  readonly id: string 
}

interface NotFound {
  readonly type: 'NotFound'
}

type Location = Home | About | Topics | TopicsId | NotFound

type View = () => TemplateResult

type Store<A> = [(newValue: A) => void, () => A]
// #endregion

// #region main state store
const initialState = Immutable<State>({
  counter: 0,
  arePhotosLoading: false,
  photos: [],
  photoId: 1,
  isStuffLoading: false,
  testStuff: '',
  location: { type: 'Home' }
})

const store = <A>(initialValue: A): Store<A> => {
  let state = initialValue
  return [
    // setState
    (newValue: A) => (state = newValue),

    // getState
    () => state,
  ]
}

const [setState, state] = store(initialState)
// #endregion

// #region route formats
// '/'
const home = R.end

// '/about'
const about = R.lit('about').then(R.end)

// '/topics'
const topics = R.lit('topics').then(R.end)

// '/topics/10'
// '/topics/11'
// '/topics/12'
const topicsId = R.lit('topics')
  .then(R.str('id'))
  .then(R.end)
// #endregion

// #region router
const router: R.Parser<Location> = topicsId.parser
  .map<Location>(obj => {
    return {
      type: 'TopicsId',
      id: obj.id
    }
  })
  .alt(
    home.parser.map(() => {
      return {
        type: 'Home'
      }
    })
  )
  .alt(
    about.parser.map(() => {
      return {
        type: 'About'
      }
    })
  )
  .alt(
    topics.parser.map(() => {
      return {
        type: 'Topics'
      }
    })
  )
// #endregion

// #region route parser
const parse = (s: string): Location =>
  R.parse<Location>(router, R.Route.parse(s), { type: 'NotFound' })
// #endregion

// #region route formatter
export const format = (l: Location): string => {
  switch(l.type) {
    case 'Home':
      return R.format(home.formatter, l)
    case 'About':
      return R.format(about.formatter, l)
    case 'Topics':
      return R.format(topics.formatter, l)
    case 'TopicsId':
      return R.format(topicsId.formatter, l)
    case 'NotFound':
      return '/'
  }
}
// #endregion

const updateLocation = (newLocation: Location) => {
  setState({ ...state(), location: newLocation })
  window.history.pushState(null, '', format(newLocation))
}

window.addEventListener('popstate', () => {
  console.log('state popped!')
  setState({ ...state(), location: parse(window.location.pathname) })
  reRender(view)
});

// #region router test cases
const parseExamples = [
  parse('/topics/anything'),
  parse('/bad/anything'),
  parse('/topics/anything/whoops'),
  parse('/topics/What%20will%20happen%20if'),
  parse(''),
  parse('/'),
  parse('about'),
  parse('/about'),
  parse('about/'),
  parse('/about/'),
]
parseExamples.forEach(ex => console.log(ex))
// #endregion

// #region init
const selector = document.getElementById('app')

const reRender = (view: View) => render(view(), selector)
// #endregion

// #region async / resource services
const getStuff = (view: View) =>
  eitherGet('https://httpstat.us/200', JSON.stringify, JSON.stringify).then(
    (resp) => {
      setState({
        ...state(),
        testStuff: resp,
        isStuffLoading: false,
      })
      reRender(view)
    },
  )

const getPhotos = (view: View) =>
  eitherGet(
    `https://jsonplaceholder.typicode.com/photos/${state().photoId}`,

    // decoders?
    // maybe add an 'errorMessage' property
    (error) => ({
      id: '',
      title: 'We had an issue loading this resource: ' + state().photoId,
      thumbnailUrl: '',
      error,
    }),
    (photo) => ({
      id: photo.id,
      title: photo.title,
      thumbnailUrl: photo.thumbnailUrl,
      error: null
    }),
  ).then((resp) => {
    if (resp.error) {
      console.error(resp.error)
    }
    setState({
      ...state(),
      photos: [...state().photos, resp],
      arePhotosLoading: false,
      photoId: state().photoId + 1,
    })
    reRender(view)
  })
// #endregion

// #region view helpers
const photoInfo = (photo: Photo) => html`
  <img src="${photo.thumbnailUrl}" />
  <div>${photo.title}</div>
  <br /><br />
`

const nav = () => html`
  <ul>
    <li>
      <a @click=${() => {
        updateLocation({ type: 'Home' })
        reRender(view)
      }}>Home</a>
    </li>
    <li>
      <a @click=${() => {
        updateLocation({ type: 'About' })
        reRender(view)
      }}>About</a>
    </li>
    <li>
      <a @click=${() => {
        updateLocation({ type: 'Topics' })
        reRender(view)
      }}>Topics</a>
    </li>
  </ul>
`

const homeView = () => html`
  ${state().testStuff}
  <br/><br/>
  <button
    @click=${() => {
      setState({ ...state(), isStuffLoading: true })
      reRender(view)
      getStuff(view)
    }}
  >
    Get The Stuff
  </button>
  <span>${state().isStuffLoading ? html`Loading...` : ''}</span>
  <br /><br />
  <button
    @click=${() => {
      setState(initialState)
      reRender(view)
    }}
  >
    Clear State
  </button>
  <br /><br />
  <button
    @click=${() => {
      setState({
        ...initialState,
        arePhotosLoading: true,
        isStuffLoading: true,
      })
      reRender(view)
      getPhotos(view)
      getStuff(view)
    }}
  >
    Clear State (and refetch)
  </button>
  <br /><br />
  <button
    @click=${() => {
      setState({ ...state(), counter: state().counter + 1 })
      reRender(view)
    }}
  >
    inc
  </button>
  <p>${state().counter}</p>
  <button
    @click=${() => {
      setState({ ...state(), counter: state().counter - 1 })
      reRender(view)
    }}
  >
    dec
  </button>
  <br /><br />
  <button
    @click=${() => {
      setState({ ...state(), arePhotosLoading: true })
      reRender(view)
      getPhotos(view)
    }}
  >
    Add Next User
  </button>
  <span>${state().arePhotosLoading ? html`Loading...` : ''}</span>
  <br /><br />
  <div>
    ${repeat(state().photos, (photo) => photo.id, photoInfo)}
  </div>
`

const aboutView = () => html`
  <div>About view</div>
`

const topicsView = (topicId: string = null) => html`
  <ul>
    <li><a @click=${() => {
      updateLocation({ type: 'TopicsId', id: 'first topic' })
      reRender(view)
    }}>first topic</a></li>
    <li><a @click=${() => {
      updateLocation({ type: 'TopicsId', id: 'second topic' })
      reRender(view)
    }}>second topic</a></li>
  </ul>
  ${topicId && html`
    <h1>Topic</h1>
    <div>The topic is: ${topicId}</div>
  `}
`

const notFoundView = () => html`
  <div>404 Not Found</div>
`

const content = (location: Location) => {
  switch(location.type) {
    case 'Home':
      return homeView()
    case 'About':
      return aboutView()
    case 'Topics':
      return topicsView()
    case 'TopicsId':
      return topicsView(location.id)
    case 'NotFound':
      return notFoundView()
  }
}
// #endregion

// #region main view
const view = () => html`
  <h1>Routes</h1>
  ${nav()}
  <h1>Content</h1>
  ${content(parse(window.location.pathname))}
`
// #endregion

// #region main
setState({
  ...state(),
  arePhotosLoading: true,
  isStuffLoading: true,
})



getPhotos(view)

getStuff(view)

setState({ ...state(), counter: 10 })

// 'render' (entrypoint)
render(view(), selector)
// #endregion
