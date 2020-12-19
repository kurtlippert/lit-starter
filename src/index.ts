// Import lit-html functions
import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { Model } from './helpers';
import axios from 'axios';

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
const init = async (view: any, model: ViewModel) => {
  // stuff to do b4 the first render

  // --> get the first user
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

// main view
const view = (model: ViewModel) => html`
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
