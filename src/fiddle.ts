import { html, TemplateResult } from 'lit-html';

type Children = TemplateResult[] | string[];

export const div = ({ classNames = '' }, ...children: Children) =>
  html` <div class="${classNames}">
    ${children}
  </div>`;

export const ul = ({ classNames = '' }, ...children: Children) =>
  html` <ul class="${classNames}">
    ${children}
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
