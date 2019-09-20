import React, { Component } from 'react';

class DeckForm extends Component {

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    codes : []
  }

  handleChange(i, event) {
    const codes = [...this.state.codes];
    codes[i] = event.target.value;
    this.setState({codes});
  }

  render() {
    return (
      <div>
        {
          [...Array(this.props.numDecks).keys()].map((unused, i) => {
            return (
              <div className='form-group' key={'input'+(i+1)}>
                <label>Deck code {i+1} {i===3?' (Optional)' : ''}</label>
                <input type="text" className="form-control" id={'deck'+(i+1)} onChange={(e) =>
                 this.handleChange(i, e)} placeholder={'Enter Deck Code ' + (i+1)}/>
                {this.props.validDeck[i] ? <div style={{color:'red'}}>{this.props.validDeck[i]}</div> : null}
              </div>
            )
          })
        }
        <button 
          className="btn btn-primary" 
          onClick={() => this.props.onSubmit(this.pad(this.state.codes, this.props.numDecks))}>
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