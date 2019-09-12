import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title'

const dateFormat = require('dateformat');

class Grandmaster extends Component {

  constructor() {
    super();
    this.handleDate = this.handleDate.bind(this);
    this.handleBracket = this.handleBracket.bind(this);
  }

  state = {
    startDate : new Date(),
    isLoaded: false,
    matches : [],
    error: false
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

  handleBracket(bracket, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate()+7);
    const matches = bracket.filter(match => match.startDate > this.state.startDate.getTime() && match.startDate < endDate.getTime());
    this.setState({matches: matches, isLoaded: true});
  }

  fetchGrandmaster(startDate) {
    const fetchTourneyURL = 'https://api.yaytears.com/grandmasters'
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

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    if (arr[2]==='week' && arr.length >= 4 && !isNaN(new Date(arr[3]))) {
      const date = new Date(arr[3]);
      this.setState({
        'startDate': date,
      });
      console.log(date);
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

  renderTable() {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return (
      <table className="table">
        <thead>
          <tr>
            <th colSpan="3" >
              <button className="btn" id="left" onClick={()=>this.handleDate("left")}><i className="icon-chevron-left"></i></button>
              {"Week of "+month[this.state.startDate.getMonth()]+" "+this.state.startDate.getDate()}
              <button className="btn" id="right" onClick={()=>this.handleDate("right")}><i className="icon-chevron-right"></i></button>
              </th>
          </tr>
          <tr>
            <th scope='col'>Player 1</th>
            <th scope='col'>Score</th>
            <th scope='col'>Player 2</th>
            <th scope='col'>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {this.state.matches.map(data=> {
            const date = new Date(data.startDate);
            return (
              <tr id={data['id']}>
                <td>{data.competitor_1_decks.length!==0 ? <Link to={`/grandmasters/${data['id']}?player=${data.competitor_1}`}>{data.competitor_1}</Link> : data.competitor_1}</td>
                <td>{`${data.score[0]}-${data.score[1]}`}</td>
                <td>{data.competitor_2_decks.length!==0 ? <Link to={`/grandmasters/${data['id']}?player=${data.competitor_2}`}>{data.competitor_2}</Link> : data.competitor_2}</td>
                <td>{dateFormat(date, 'dddd, mmmm dS, yyyy, h:MM TT Z')}</td>
              </tr>
            )})}
        </tbody>
      </table>
    );
  }

  render() {
    let component;
    if (this.state.isLoaded && !this.state.error) {
      component = (
        <div className='container  mt-2'>
          <h2>Browse Hearthstone Grandmaster Matches</h2>
          {this.renderTable()}
        </div>
      );
    } else if (this.state.error) {
      component = <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
  	return (
      <DocumentTitle title='Browse Grandmaster Matches'>
        <div>{component}</div>
      </DocumentTitle>
    );
  }
}

export default Grandmaster;