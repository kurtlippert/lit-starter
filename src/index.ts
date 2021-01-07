// Import lit-html functions
import { html, render, TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { until } from 'lit-html/directives/until';
import { Model } from './helpers';
import axios from 'axios';
import { eitherGet } from './server';
import { pipe } from 'fp-ts/function';
import { either, right, left } from 'fp-ts/Either';
import { toString } from 'ramda';

eitherGet('https://httpstat.us/200').then((resp) => console.log(resp));

// typings
interface Photo {
  id: number;
  title: string;
  thumbnailUrl: string;
}

interface ViewModel {
  counter: number;
  photos: Photo[];
  photoId: number;
  selector: HTMLElement;
}

type View = (model: ViewModel) => TemplateResult;

// model
// 'Model' helper function returns an immutable
// js object
const initialModel = Model<ViewModel>({
  counter: 0,
  photos: [],
  photoId: 1,
  selector: document.body,
});

// init
const init = async (view: View, model: ViewModel) => {
  // stuff to do b4 the first render

  // --> get the first photo
  const photoResponse = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${model.photoId}`,
  );

  const withFirstPhoto = {
    photos: [photoResponse.data],
    userId: model.photoId + 1,
  };

  // --> start the counter at '10'
  const withCounterAt10 = {
    counter: 10,
  };

  // first render
  render(
    view({
      ...model,
      ...withFirstPhoto,
      ...withCounterAt10,
    }),
    model.selector,
  );
};

// view helpers
const photoInfo = (photo: Photo) => html`
  <img src="${photo.thumbnailUrl}" />
  <div>${photo.title}</div>
  <br /><br />
`;

// const handleGet = ifElse(

// )

// main view
const view: View = (model: ViewModel) => html`
  <div>
    ${until(
      eitherGet('https://httpstat.us/200').then((resp) => resp.right.code),
      // .then((resp) => Json.parse(resp.right)),
      html`loading...`,
    )}
  </div>
  <button
    @click=${() => {
      render(view(initialModel), initialModel.selector);
    }}
  >
    Clear State
  </button>
  <br /><br />
  <button
    @click=${() => {
      const newModel = { ...model, counter: model.counter + 1 };
      render(view(newModel), model.selector);
    }}
  >
    inc
  </button>
  <p>${model.counter}</p>
  <button
    @click=${() => {
      const newModel = { ...model, counter: model.counter - 1 };
      render(view(newModel), model.selector);
    }}
  >
    dec
  </button>
  <br /><br />
  <button
    @click=${() => {
      axios
        .get(`https://jsonplaceholder.typicode.com/photos/${model.photoId}`)
        .then((response) => {
          const newModel = {
            ...model,
            photos: [...model.photos, response.data],
            photoId: model.photoId + 1,
          };
          render(view(newModel), model.selector);
        })
        .catch((error) => console.log(error));
    }}
  >
    Add Next User
  </button>
  <br /><br />
  <div>
    ${repeat(model.photos, (photo) => photo.id, photoInfo)}
  </div>
`;

// render(view(initialModel), initialModel.selector);
init(view, initialModel);
