import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'

import Header from './components/header';
import Main from './main';

class App extends Component {

  render() {
    return (
      <DocumentTitle title='YAYtears'>
        <div><Header/><Main/></div>
      </DocumentTitle>
    );
  }
}

export default App;
