// Import lit-html functions
import { html, render } from 'lit-html';
import * as R from 'ramda';

window['state'] = window['state'] || {};

const arr = [
  { a: 1, b: 2, c: 3 },
  { a: 4, b: 5, c: 6 },
  { a: 7, b: 8, c: 9, d: null },
];

const state = (name) => window['state'][name];

const setState = (name, value) => (window['state'][name] = value);

const initState = (stateObject) =>
  R.forEachObjIndexed((value, key) => setState(key, value), stateObject);

// init state
const defaultState = () =>
  initState({
    counter: 0,
    sections: [],
  });

const div = ({ classNames = '' }, ...children) =>
  html` <div class="${classNames}">
    ${children}
  </div>`;

const ul = ({ classNames = '' }, ...children) =>
  html` <ul class="${classNames}">
    ${children}
    <ul></ul>
  </ul>`;

const li = ({ classNames = '' }, ...children) =>
  html` <li class="${classNames}">
    ${children}
  </li>`;

const t = (...children) => html`${children}`;

const p = ({ classNames = '' }, ...children) => {
  return html` <p class="${classNames}">
    ${children.join('')}
  </p>`;
};

const htmlSection = () =>
  html`
    <div>
      <p>Some placeholder content</p>
      <ul>
        <li>item 1</li>
        <li>item 2</li>
        <li>item 3</li>
      </ul>
    </div>
  `;

// Define a template function
const myTemplate = () =>
  t(
    // p({}, 'hey chief'),
    // ul(
    //   {},
    //   R.map((item) => li({}, `${item.a} ${item.b} ${item.c}`)),
    // ),
    p({}, 'hey chief'),
    ul(
      {},
      R.map((item) => li({}, `${item.a} ${item.b} ${item.c}`), arr),
    ),
    html`<button
      @click=${(e) => {
        setState('counter', state('counter') + 1);
        render(myTemplate(), document.body);
      }}
    >
      inc
    </button>`,
    html`<p>${state('counter')}</p>`,
    html`<button
      @click=${(e) => {
        setState('counter', state('counter') - 1);
        render(myTemplate(), document.body);
      }}
    >
      dec
    </button>`,
    html`<br /><br />
      <button
        @click=${(e) => {
          console.log(state('sections'));
          setState('sections', [...state('sections'), htmlSection()]);
          render(myTemplate(), document.body);
        }}
      >
        Add Block Thing
      </button>`,
    html`<br /><br />
      <button
        @click=${(e) => {
          defaultState();
          render(myTemplate(), document.body);
        }}
      >
        Clear State
      </button>`,
    html`<div>${R.map((section) => section, state('sections'))}</div>
      <div>${htmlSection()}</div>`,

    // html` <p class="" >hey cheif</p>`
  );

// const myTemplate = (name) => html`
//   <p>hey chief</p>
//   <ul>
//     ${R.map((item) => html`<li>${item.a} ${item.b} ${item.c}</li>`, arr)}
//   </ul>
// `;

defaultState();

// Render the template with some data
render(myTemplate(), document.body);
