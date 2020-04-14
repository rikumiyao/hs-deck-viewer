import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';

import BattlefyTop8 from './battlefytop8';

const dateFormat = require('dateformat');

class Battlefy extends Component {

  constructor() {
    super();
    this.handleDate = this.handleDate.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    startDate : new Date(),
    tournaments : {},
    isLoaded : false,
    error : null,
    invalidUrl: false,
    value: '',
    qualified : {}
  }

  handleDate(direction, event) {
    const offset = direction==='left' ? -7 : 7;
    const startDate = new Date(this.state.startDate);
    startDate.setDate(this.state.startDate.getDate()+offset);
    this.setState({
      startDate: startDate
    });
    this.props.history.replace(`/battlefy/week/${JSON.parse(JSON.stringify(startDate))}`);
    this.fetchTourney(startDate);
    return;
  }

  handleTabChange(index, lastIndex, event) {
    if (index!==lastIndex) {
      if (index==='events') {
        this.props.history.replace(`/battlefy/week/${JSON.parse(JSON.stringify(this.state.startDate))}`);
      } else if (index==='top8') {
        this.props.history.replace(`/battlefy/top8`);
      }
    }
  }

  handleChange(e) {
    this.setState({value: e.target.value})
  }

  handleSubmit(e) {
    console.log(this.state.value);
    const regex = /^(?:https:\/\/)?\/?battlefy.com\/([^:/\s]+)\/([^:\/\s]+)\/([\w\d]+)\/.*$/;
    const matches = this.state.value.match(regex);
    if (matches) {
      const code = matches[3];
      this.setState({invalidUrl: false});
      this.props.history.push(this.tournamentCodeToUrl(code), {created: true});
    } else {
      this.setState({invalidUrl: true});
    }
    e.preventDefault();
  }

  tournamentCodeToUrl(code) {
    return `/battlefy/${encodeURIComponent(code)}`
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
      .then(()=> {
        const fetchQualifiedURL = `/api/qualified`;
        return fetch(fetchQualifiedURL);
      })
      .then(res => res.json())
      .then((result) => {
        const qualifiedDict = {};
        result.forEach(entry => {
          qualifiedDict[entry['_id']] = entry['qualified'];
        })
        this.setState({
          qualified: qualifiedDict,
          isLoaded: true
        })
      });
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    if (arr[2]==='week' && arr.length >= 4 && !isNaN(new Date(arr[3]))) {
      const date = new Date(arr[3]);
      this.setState({
        'startDate': date,
      });
      this.fetchTourney(date);
    }
    else {
      const date = new Date();
      date.setHours(8-date.getTimezoneOffset()/60)
      date.setDate(date.getDate()-((date.getDay()+5)%7))
      date.setMinutes(0);
      this.setState({
        'startDate': date,
      });
      this.fetchTourney(date);
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
            <th scope='col'>Name</th>
            <th scope='col'>Start Time</th>
            <th scope='col'>Region</th>
            <th scope='col'>Qualified</th>
            <th scope='col'>Deck Links</th>
          </tr>
        </thead>
        <tbody>
          {this.state.tournaments.map(data=> {
            const date = new Date(Date.parse(data['startTime']));
            return (
              <tr id={data['_id']}>
                <th scope='row'>
                  <a href={`https://battlefy.com/hsesports/${data['slug']}/${data['_id']}/info`}  target='_blank' rel='noopener noreferrer'>
                    {data['name']}
                  </a>
                </th>
                <td>{dateFormat(date, 'dddd, mmmm dS, yyyy, h:MM TT Z')}</td>
                <td>{data['region']}</td>
                <td>{ this.state.qualified[data['_id']] ? this.state.qualified[data['_id']].join(' ') : ''}</td>
                <td>
                  { new Date() > date ? <Link to={`/battlefy/${data['_id']}`}>Decks</Link> : ''}
                </td>
              </tr>
            )})}
        </tbody>
      </table>
    );
  }

  renderBattlefyForm() {
    return (
      <div className='m-1'>
        <form onSubmit={this.handleSubmit}>
          <div className='form-group'>
            <label for="battlefyurl">Battlefy Url</label>
            <input type="text" className="form-control" id='battlefyurl' onChange={(e) =>
              this.handleChange(e)} placeholder='Enter Battlefy Url'/>
            <button
              className="btn btn-primary mt-2">
              Submit
            </button>
            {this.state.invalidUrl ? <div style={{color:'red'}}>Invalid Battlefy Url</div> : null}
          </div>
        </form>
      </div>
    );
  }

  render() {
    const defaultActiveKey = this.props.location.pathname.split('/')[2]==='stats'?'stats' : 
      this.props.location.pathname.split('/')[2]==='top8' ? 'top8' : 'events';
    let component;
    if (this.state.isLoaded && !this.state.error) {
      component = (
        <div className='container  mt-2'>
          <h2>Browse Hearthstone Master's Cup Tournaments</h2>
          <Tabs defaultActiveKey={defaultActiveKey} onSelect={this.handleTabChange}>
            <Tab eventKey="events" title="Tournaments">
              {this.renderBattlefyForm()}
              {this.renderTable()}
            </Tab>
            <Tab eventKey="top8" title="Top 8 Count">
              <BattlefyTop8/>
            </Tab>
          </Tabs>
        </div>
      );
    } else if (this.state.error) {
      component = <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    return (
      <DocumentTitle title='Browse Battlefy Tournaments'>
        <div>{component}</div>
      </DocumentTitle>
    );
  }
}

export default Battlefy;