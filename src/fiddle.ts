import { html } from 'lit-html';

export const div = ({ classNames = '' }, ...children) =>
  html` <div class="${classNames}">
    ${children}
  </div>`;

export const ul = ({ classNames = '' }, ...children) =>
  html` <ul class="${classNames}">
    ${children}
    <ul></ul>
  </ul>`;

export const li = ({ classNames = '' }, ...children) =>
  html` <li class="${classNames}">
    ${children}
  </li>`;

export const t = (...children) => html`${children}`;

export const p = ({ classNames = '' }, ...children) => {
  return html` <p class="${classNames}">
    ${children.join('')}
  </p>`;
};
