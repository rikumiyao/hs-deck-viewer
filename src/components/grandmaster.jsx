import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import GrandMasterMatches from './grandmastermatches';
import GrandMasterPlayers from './grandmasterplayers';
import Loader from 'react-loader-spinner';
import { Tabs, Tab } from 'react-bootstrap';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function dateToString(date) {
  return date.toJSON();
}

class Grandmaster extends Component {

  constructor() {
    super();
    this.handleDate = this.handleDate.bind(this);
    this.handleBracket = this.handleBracket.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  state = {
    startDate : new Date(),
    isLoaded: false,
    matches : [],
    error: false
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    if (arr[2]==='week' && arr.length >= 4 && !isNaN(new Date(arr[3]))) {
      const date = new Date(arr[3]);
      this.setState({
        'startDate': date,
      });
      this.fetchGrandmaster(date);
    }
    else {
      const date = new Date();
      date.setHours(8-date.getTimezoneOffset()/60)
      date.setDate(date.getDate()-((date.getDay()+4)%7))
      date.setMinutes(0);
      this.setState({
        'startDate': date,
      });
      this.fetchGrandmaster(date);
    }
  }

  handleTabChange(index, lastIndex, event) {
    if (index!==lastIndex) {
      if (index==='decks') {
        this.props.history.replace(`/grandmasters/week/${dateToString(this.state.startDate)}/decks`);
      } else if (index==='matches') {
        this.props.history.replace(`/grandmasters/week/${dateToString(this.state.startDate)}/matches`);
      }
    }
  }

  handleBracket(bracket, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate()+7);
    const matches = bracket.filter(match => match.startDate > this.state.startDate.getTime() && match.startDate < endDate.getTime());
    this.setState({matches: matches, isLoaded: true});
  }

  fetchGrandmaster(startDate) {
    const fetchTourneyURL = '/api/grandmasters'
    fetch(fetchTourneyURL)
      .then(res => res.json())
      .then(
        res => this.handleBracket(res, startDate),
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }


  handleDate(direction, event) {
    const offset = direction==='left' ? -7 : 7;
    const startDate = new Date(this.state.startDate);
    startDate.setDate(this.state.startDate.getDate()+offset);
    this.setState({
      startDate: startDate
    });
    this.props.history.replace(`/grandmasters/week/${JSON.parse(JSON.stringify(startDate))}`);
    this.fetchGrandmaster(startDate);
    return;
  }

  render() {
    const defaultActiveKey = this.props.location.pathname.split('/')[4]==='matches' ? 'matches' : 'decks';
    let component
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if (this.state.isLoaded && !this.state.error) {
      component = (
        <div className='container  mt-2'>
          <h2>Browse Hearthstone Grandmaster Matches</h2>
          <div>
            <button className="btn" id="left" onClick={()=>this.handleDate("left")}><i className="icon-chevron-left"></i></button>
              {"Week of "+month[this.state.startDate.getMonth()]+" "+this.state.startDate.getDate()}
            <button className="btn" id="right" onClick={()=>this.handleDate("right")}><i className="icon-chevron-right"></i></button>
          </div>
          <Tabs defaultActiveKey={defaultActiveKey} onSelect={this.handleTabChange}>
            <Tab eventKey="decks" title="Decks">
              <GrandMasterPlayers matches={this.state.matches}/>
            </Tab>
            <Tab eventKey="matches" title="Matches">
              <GrandMasterMatches matches={this.state.matches}/>
            </Tab>
          </Tabs>
        </div>
      );
    } else if (this.state.error) {
      component = <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    } else {
      component = (
        <div className='container mt-2'>
          <Loader type="Oval" />
        </div>
      );
    }
    return (
      <DocumentTitle title='Browse Grandmaster Matches'>
        <div>{component}</div>
      </DocumentTitle>
    );
  }
}

export default Grandmaster;