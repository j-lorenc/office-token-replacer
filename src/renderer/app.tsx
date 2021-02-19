import * as React from 'react';
import * as ReactDOM from 'react-dom';

const Component: React.FC = () => <div>TESTING TEMPLATE</div>;

const render = (Component: React.FC) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(Component);
