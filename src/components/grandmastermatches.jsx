import React, {Component} from 'react';
import { Link } from 'react-router-dom';

const dateFormat = require('dateformat');

class GrandmasterMatches extends Component {

  state = {
    "region": "ALL"
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({region: e.target.value});
  }

  renderTable(props) {
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope='col'>Player 1 Classes</th>
            <th scope='col'>Player 1</th>
            <th scope='col'>Score</th>
            <th scope='col'>Player 2</th>
            <th scope='col'>Player 2 Classes</th>
            <th scope='col'>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {this.props.matches
            .filter(data => data.region===this.state.region || this.state.region === "ALL")
            .map(data=> {
            const date = new Date(data.startDate);
            return (
              <tr id={data['id']}>
                <td>{this.renderClasses(data.competitor_1_classes)}</td>
                <td>{data.competitor_1_decks && data.competitor_1_decks.length!==0 ? <Link to={`/grandmasters/${data['id']}?player=${data.competitor_1}`}>{data.competitor_1}</Link> : data.competitor_1}</td>
                <td>{`${data.score[0]}-${data.score[1]}`}</td>
                <td>{data.competitor_2_decks && data.competitor_2_decks.length!==0 ? <Link to={`/grandmasters/${data['id']}?player=${data.competitor_2}`}>{data.competitor_2}</Link> : data.competitor_2}</td>
                <td>{this.renderClasses(data.competitor_2_classes)}</td>
                <td>{dateFormat(date, 'dddd, mmmm dS, yyyy, h:MM TT Z')}</td>
              </tr>
            )})}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <>
        <div className="row my-2">
          <label className="col-sm-1 col-form-label">Region</label>
          <select className="form-control col-sm-2" id="region"
            defaultValue={this.state.region} onChange={this.handleChange}>
            <option value="ALL">All Regions</option>
            <option value="NA">Americas</option>
            <option value="EU">Europe</option>
            <option value="APAC">Asia-Pacific</option>
          </select>
        </div>
        {this.renderTable(this.props)}
      </>
    );
  }

  renderClasses(classes) {
    const classArr = classes.filter(a => !a['banned'] && a['class'])
      .sort((a,b)=>a['class'].localeCompare(b['class']))
      .map(a => (
        <img width="34px" height="34px"
          src={require(`../resources/icons/icon_${a['class']}.png`)} alt={a['class']} className='mx-1'/>));
    const bannedClasses = classes.filter(a => a['banned'] && a['class']);
    if (bannedClasses.length === 1) {
      const bannedClass = bannedClasses[0]['class'];
      classArr.push(<img width="34px" height="34px" className='banned mx-1'
        src={require(`../resources/icons/icon_${bannedClass}.png`)} alt={bannedClass}/>)
    }
    return classArr;
  }
}

export default GrandmasterMatches;