// Import lit-html functions
import { html, render, TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { Immutable } from './helpers';
import axios from 'axios';
import { eitherGet } from './server';

// typings
interface Photo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface State {
  counter: number;
  photos: Photo[];
  photoId: number;
  testStuff: string;
}

type View = () => TemplateResult;

const initialState = Immutable<State>({
  counter: 0,
  photos: [],
  photoId: 1,
  testStuff: 'Loading...',
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
      setState(initialState);
      reRender(view);
    }}
  >
    Clear State
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
      axios
        .get(`https://jsonplaceholder.typicode.com/photos/${state().photoId}`)
        .then((response) => {
          setState({
            ...state(),
            photos: [...state().photos, response.data],
            photoId: state().photoId + 1,
          });
          reRender(view);
        })
        .catch((error) => console.log(error));
    }}
  >
    Add Next User
  </button>
  <br /><br />
  <div>
    ${repeat(state().photos, (photo) => photo.id, photoInfo)}
  </div>
`;

// init cont...
eitherGet('https://httpstat.us/200', JSON.stringify, JSON.stringify).then(
  (resp) => {
    setState({ ...state(), testStuff: resp });
    reRender(view);
  },
);

eitherGet<Photo, Photo>(
  `https://jsonplaceholder.typicode.com/photos/${state().photoId}`,

  // decoders?
  (error) => ({ id: '', title: `${error.message}`, thumbnailUrl: '' }),
  (photo: Photo) => ({
    id: photo.id,
    title: photo.title,
    thumbnailUrl: photo.thumbnailUrl,
  }),
).then((resp) => {
  setState({
    ...state(),
    photos: [...state().photos, resp],
    photoId: state().photoId + 1,
  });
  reRender(view);
});

setState({ ...state(), counter: 10 });

// 'render' (entrypoint)
render(view(), selector);
