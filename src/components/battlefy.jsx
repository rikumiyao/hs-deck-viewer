import React, {Component} from 'react';
import { Link } from 'react-router-dom';
const dateFormat = require('dateformat');

class Battlefy extends Component {

  constructor() {
    super();
    this.handleDate = this.handleDate.bind(this);
  }

  state = {
    startDate : new Date(),
    tournaments : {},
    isLoaded : false,
    error : null
  }

  handleDate(direction, event) {
    const offset = direction==='left' ? -7 : 7
    const startDate = new Date(this.state.startDate);
    startDate.setDate(this.state.startDate.getDate()+offset);
    this.setState({
      startDate: startDate
    })
    this.fetchTourney(startDate);
    return;
  }

  fetchTourney(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate()+7);
    const fetchTourneyURL = `https://majestic.battlefy.com/hearthstone-masters/tournaments?start=${startDate.toJSON()}&end=${endDate.toJSON()}`

    fetch(fetchTourneyURL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            tournaments: result
          });
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

  componentDidMount() {
    const date = new Date();
    date.setHours(8-date.getTimezoneOffset()/60)
    date.setDate(date.getDate()-((date.getDay()+5)%7))
    date.setMinutes(0);
    this.setState({
      'startDate': date,
    });
    this.fetchTourney(date);
  }

  render() {
    let component;
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if (this.state.isLoaded && !this.state.error) {
      component = (
        <div className='container'>
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
                <th scope='col'>Name</th>
                <th scope='col'>Start Time</th>
                <th scope='col'>Region</th>
                <th scope='col'>Deck Links</th>
              </tr>
            </thead>
            <tbody>
              {this.state.tournaments.map(data=> {
                const date = new Date(Date.parse(data['startTime']));
                return (
                  <tr id={data['_id']}>
                    <th scope='row'>
                      <a href={`https://battlefy.com/hsesports/${data['slug']}/${data['_id']}/info`}>
                        {data['name']}
                      </a>
                    </th>
                    <td>{dateFormat(date, 'dddd, mmmm dS, yyyy, h:MM TT Z')}</td>
                    <td>{data['region']}</td>
                    <td>
                      <Link to={`/battlefy/${data['_id']}`}>Decks</Link>
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        </div>
      );
    } else if (this.state.error) {
      component = <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
  	return <div>{component}</div>;
  }
}

export default Battlefy;