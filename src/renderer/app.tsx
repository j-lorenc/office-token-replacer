import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Application from './pages/main';

const render = (Component: React.FC) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(Application);
