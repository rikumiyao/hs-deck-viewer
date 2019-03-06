import React, {Component} from 'react';
import { Link } from 'react-router-dom';

class BattlefyEvent extends Component {

  constructor() {
    super();
    this.processBracket = this.processBracket.bind(this);
  }

  state = {
    name: '',
    players: {},
    isLoaded : false,
    error : null,
    input: '',
    id: '',
    bracketStarted: false
  }

  processBracket(data) {
    const players = {};
    data.forEach(row => {
      ['top', 'bottom'].forEach(pos=> {
        const team = row[pos];
        if (team['team']) {
          players[team['team']['name']] = row['_id']
        }
      })
    });
    this.setState({
      players: players,
      isLoaded: true
    })
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const id = pathname.split('/')[2];
    this.setState({id: id})
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`
    fetch(fetchTourneyURL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({name: result['name']})
          const stageId = result['stageIDs'][0];
          if (stageId) {
            this.setState({bracketStarted:true});
          } else {
            this.setState({
              bracketStarted:false,
              isLoaded: true
            });
            return;
          }
          const fetchBracketUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/matches?roundNumber=1`
          fetch(fetchBracketUrl)
            .then(res => res.json())
            .then(this.processBracket,
              (error) => {
                this.setState({
                  isLoaded: true,
                  error
                });
              }
            );
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  handleChange(event) {
    this.setState({input: event.target.value});
  }

  render() {
    if (this.state.isLoaded && !this.state.error && this.state.bracketStarted) {
      return (
        <div className='m-3'>
          <h2>{this.state.name}</h2>
          <input type="text" className="form-control" onChange={(e) => this.handleChange(e)} placeholder={'Enter Player Name'}/>
          <ul className='list-group'>
            {Object.keys(this.state.players).filter(name=>name.toLowerCase().startsWith(this.state.input.toLowerCase()))
              .sort().map(name =>
              <li className='list-group-item' key={name}>
                <Link to={`/battlefy/${this.state.id}/${this.state.players[name]}?player=${encodeURIComponent(name)}`}>{name}</Link>
              </li>
            )}
          </ul>
        </div>
      );
    } else if (!this.state.error && this.state.isLoaded && !this.state.bracketStarted) {
      return <h2 style={{'color':'red'}}>The bracket has not yet started</h2>;
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    return null;
  }
}

export default BattlefyEvent;