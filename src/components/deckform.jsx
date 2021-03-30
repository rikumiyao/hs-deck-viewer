import React, { Component } from 'react';

class DeckForm extends Component {

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleFormat = this.handleFormat.bind(this);
  }

  state = {
    codes : [],
    format: "standard"
  }

  handleChange(i, event) {
    const codes = [...this.state.codes];
    codes[i] = event.target.value;
    this.setState({codes});
  }

  handleFormat(event) {
    this.setState({ "format": event.target.value });
  }

  render() {
    return (
      <div>
        <div className="row">
          <label className="col-sm-1 col-form-label">Format</label>
          <select className="form-control col-sm-2" id="format"
            defaultValue={this.state.format} onChange={this.handleFormat}>
            <option value="standard">Standard</option>
            <option value="wild">Wild</option>
            <option value="classic">Classic</option>
          </select>
        </div>
        {
          [...Array(this.props.numDecks).keys()].map((unused, i) => {
            return (
              <div className='form-group' key={'input'+(i+1)}>
                <label>Deck code {i+1} {i===3?' (Optional)' : ''}</label>
                <input type="text" className="form-control" id={'deck'+(i+1)} onChange={(e) =>
                 this.handleChange(i, e)} placeholder={'Enter Deck Code ' + (i+1)}/>
                {this.props.errors[i] ? <div style={{color:'red'}}>{this.props.errors[i]}</div> : null}
              </div>
            )
          })
        }
        <button 
          className="btn btn-primary" 
          onClick={() => this.props.onSubmit(this.pad(this.state.codes, this.props.numDecks), this.state.format)}>
            {this.props.mode==='specialist' ? "View Specialist Decks" : "View Conquest Decks" }
        </button>
      </div>
    );
  }

  pad(list, length) {
    for (var i=list.length;i<length;i++) {
      list.push('');
    }
    return list;
  }
}

export default DeckForm;