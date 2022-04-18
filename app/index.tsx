import React from 'react';
import { unstable_createRoot } from 'react-dom';
import { loader } from '@monaco-editor/react';
import path from 'path';

// TODO move monaco stuff elsewhere
function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== '/' ? `/${str}` : str;
}

function uriFromPath(_path: string) {
  const pathName = path.resolve(_path).replace(/\\\\/g, '/');
  return encodeURI(`file://${ensureFirstBackSlash(pathName)}`);
}

loader.config({
  paths: {
    vs: uriFromPath(
      path.join(__dirname, '../node_modules/monaco-editor/min/vs')
    ),
  },
});

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const App = require('./components/App').default;
  unstable_createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
  );
});
