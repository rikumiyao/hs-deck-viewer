import React, { Component } from 'react';

class DeckOptions extends Component {

  state = {
    diffChecked : false
  }

  constructor() {
    super();
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck() {
    const diffChecked = !this.state.diffChecked;
    this.setState({diffChecked: diffChecked});
    this.props.onToggleDiff(diffChecked);
  }

  render() {
    return (
      <div className="dropdown m-3">
        <input type="checkbox" onChange={this.handleCheck} defaultChecked={this.state.diffChecked}/> See Diff
      </div>
    );
  }
}

export default DeckOptions;