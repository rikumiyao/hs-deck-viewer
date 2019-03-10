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
      <button type="button" className="btn btn-primary m-2" onClick={this.handleCheck}>{this.state.diffChecked ? "Hide Differences" : "Show Differences"}</button>
    );
  }
}

export default DeckOptions;