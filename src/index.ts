// Import lit-html functions
import { html, render, TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { Immutable } from './helpers';
import { eitherGet } from './server';

// typings
interface Photo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface State {
  counter: number;
  arePhotosLoading: boolean;
  photos: Photo[];
  photoId: number;
  isStuffLoading: boolean;
  testStuff: string;
}

type View = () => TemplateResult;

const initialState = Immutable<State>({
  counter: 0,
  arePhotosLoading: false,
  photos: [],
  photoId: 1,
  isStuffLoading: false,
  testStuff: '',
});

type Store<A> = [(newValue: A) => void, () => A];

// init
const store = <A>(initialValue: A): Store<A> => {
  let state = initialValue;
  return [
    // setState
    (newValue: A) => (state = newValue),

    // getState
    () => state,
  ];
};

const [setState, state] = store(initialState);

const selector = document.getElementById('app');

const reRender = (view: View) => render(view(), selector);

const getStuff = (view: View) =>
  eitherGet('https://httpstat.us/200', JSON.stringify, JSON.stringify).then(
    (resp) => {
      setState({
        ...state(),
        testStuff: resp,
        isStuffLoading: false,
      });
      reRender(view);
    },
  );

const getPhotos = (view: View) =>
  eitherGet(
    `https://jsonplaceholder.typicode.com/photos/${state().photoId}`,

    // decoders?
    // maybe add an 'errorMessage' property
    (error) => ({
      id: '',
      title: `${JSON.stringify(error)}`,
      thumbnailUrl: '',
    }),
    (photo) => ({
      id: photo.id,
      title: photo.title,
      thumbnailUrl: photo.thumbnailUrl,
    }),
  ).then((resp) => {
    setState({
      ...state(),
      photos: [...state().photos, resp],
      arePhotosLoading: false,
      photoId: state().photoId + 1,
    });
    reRender(view);
  });

// view helpers
const photoInfo = (photo: Photo) => html`
  <img src="${photo.thumbnailUrl}" />
  <div>${photo.title}</div>
  <br /><br />
`;

// main view
const view = () => html`
  ${state().testStuff}
  <br /><br />
  <button
    @click=${() => {
      setState({ ...state(), isStuffLoading: true });
      reRender(view);
      getStuff(view);
    }}
  >
    Get The Stuff
  </button>
  <span>${state().isStuffLoading ? html`Loading...` : ''}</span>
  <br /><br />
  <button
    @click=${() => {
      setState(initialState);
      reRender(view);
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
      });
      reRender(view);
      getPhotos(view);
      getStuff(view);
    }}
  >
    Clear State (and refetch)
  </button>
  <br /><br />
  <button
    @click=${() => {
      setState({ ...state(), counter: state().counter + 1 });
      reRender(view);
    }}
  >
    inc
  </button>
  <p>${state().counter}</p>
  <button
    @click=${() => {
      setState({ ...state(), counter: state().counter - 1 });
      reRender(view);
    }}
  >
    dec
  </button>
  <br /><br />
  <button
    @click=${() => {
      setState({ ...state(), arePhotosLoading: true });
      reRender(view);
      getPhotos(view);
    }}
  >
    Add Next User
  </button>
  <span>${state().arePhotosLoading ? html`Loading...` : ''}</span>
  <br /><br />
  <div>
    ${repeat(state().photos, (photo) => photo.id, photoInfo)}
  </div>
`;

// init cont...
setState({
  ...state(),
  arePhotosLoading: true,
  isStuffLoading: true,
});

getPhotos(view);

getStuff(view);

setState({ ...state(), counter: 10 });

// 'render' (entrypoint)
render(view(), selector);
