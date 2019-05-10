import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import Cookies from 'js-cookie';

import Header from './components/header';
import Main from './main';

const darkMode = process.env.PUBLIC_URL+'./css/darkly/bootstrap.min.css';
const lightMode = process.env.PUBLIC_URL+'./css/flatly/bootstrap.min.css';

class App extends Component {

  state = {
    isDarkMode : false
  }

  componentDidMount() {
    const isDarkMode = Cookies.get('isDarkMode') === 'true';
    this.setState({'isDarkMode':isDarkMode});
    this.onToggleDarkMode = this.onToggleDarkMode.bind(this);
  }

  onToggleDarkMode() {
    if (this.state.isDarkMode) {
      this.setState({isDarkMode: false});
      Cookies.set('isDarkMode', 'false', { expires: 365 });
    } else {
      this.setState({isDarkMode: true});
      Cookies.set('isDarkMode', 'true', { expires: 365 });
    }
  }

  render() {
    return (
      <DocumentTitle title='YAYtears'>
        <div>
          <link rel='stylesheet' type='text/css' 
            href={this.state.isDarkMode ?  darkMode : lightMode} /> 
          <Header isDarkMode={this.state.isDarkMode} onToggle={this.onToggleDarkMode}/>
          <Main/>
        </div>
      </DocumentTitle>
    );
  }
}

export default App;
