import React, {Component} from 'react';
import { Link } from 'react-router-dom';
const dateFormat = require('dateformat');

class Battlefy extends Component {

  state = {
    startDate : new Date(),
    endDate : new Date(),
    tournaments : {},
    isLoaded : false,
    error : null
  }

  componentDidMount() {
    const date = new Date();
    date.setHours(8-date.getTimezoneOffset()/60)
    date.setDate(date.getDate()-((date.getDay()+5)%7))
    date.setMinutes(0);
    const date2 = new Date(date);
    date2.setDate(date.getDate()+7);
    this.setState({
      'startDate': date,
      'endDate': date2
    });
    const fetchTourneyURL = `https://majestic.battlefy.com/hearthstone-masters/tournaments?start=${date.toJSON()}&end=${date2.toJSON()}`

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

  render() {
    let component;
    if (this.state.isLoaded && !this.state.error) {
      component = (
        <table className="table">
          <thead>
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
                  <td>{dateFormat(date, 'dddd, mmmm, yyyy, h:MM TT Z')}</td>
                  <td>{data['region']}</td>
                  <td>
                    <Link to={`/battlefy/${data['_id']}`}>Decks</Link>
                  </td>
                </tr>
              )})}
          </tbody>
        </table>
      );
    } else if (this.state.error) {
      component = <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
  	return <div>{component}</div>;
  }
}

export default Battlefy;