// Import lit-html functions
import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import axios from 'axios';

// typings
interface User {
  id: number;
  avatar_url: string;
  login: string;
  name: string;
}

interface Model {
  name: string;
  counter: number;
  score: number;
  users: User[];
  userId: number;
  selector: HTMLElement;
}

const initialModel: Model = {
  name: 'World',
  counter: 0,
  score: 0,
  users: [],
  userId: 1,
  selector: document.body,
};

const userInfo = (user: User) => html`
  <img src="${user.avatar_url}" width="200" height="200" />
  <div>${user.login}</div>
  <div>${user.name}</div>
  <br /><br />
`;

// const view = ({ model, up }) => html`
const view = (model: Model) => html`
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
        .get(`https://api.github.com/user/${model.userId}`)
        .then((response: any) => {
          const newModel = {
            ...model,
            users: [...model.users, response.data],
            userId: model.userId + 1,
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
    ${repeat(model.users, (user) => user.id, userInfo)}
  </div>
`;

render(view(initialModel), initialModel.selector);
