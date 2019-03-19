import React, {Component} from 'react';

import CanvasJSReact from '../assets/canvasjs.react';
const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const classColors = {
  warrior: '#D62728',
  warlock: '#9467BD',
  shaman: '#1F77B4',
  rogue: '#1E1E1E',
  priest: '#7F7F7F',
  paladin: '#FFDD71',
  mage: '#17BECF',
  hunter: '#2CA02C',
  druid: '#8C564B'  
}

CanvasJS.addColorSet('classes',Object.values(classColors));

class BattlefyAggregateStats extends Component {

  state = {
    classes : [],
    topSwissClasses: [],
    top8Classes : []
  }

  componentDidMount() {
    const url1 = 'https://api.yaytears.com/stats';
    const url2 = 'https://api.yaytears.com/topSwissStats';
    const url3 = 'https://api.yaytears.com/top8Stats';
    return fetch(url1)
      .then(res => res.json())
      .then(res => {
        this.setState({
          classes: res
        });
      })
      .then(() => {
        return fetch(url2)
      })
      .then(res => res.json())
      .then(res => {
        this.setState({
          topSwissClasses: res
        });
      })
      .then(() => {
        return fetch(url3)
      })
      .then(res => res.json())
      .then(res => {
        this.setState({
          top8Classes: res
        });
      });
  }

  render() {
    const total = this.state.classes.reduce((a,b)=>a+b['total'],0);
    const optionsTotal = {
      title: {
        text: "Class Distribution (Total)"
      },
      data: [{
        type: "bar",
        dataPoints: this.state.classes.map(entry => { 
          return {
            label: entry['_id'][0].toUpperCase()+entry['_id'].substring(1).toLowerCase(), 
            y: entry['total'],
            indexLabel: entry['total']+'('+Math.round(entry['total']/total*100)+'%)',
            color: classColors[entry['_id']]
          }})
      }]
    }

    const totalTopSwiss = this.state.topSwissClasses.reduce((a,b)=>a+b['total'],0);

    const optionsTopSwiss = {
      title: {
        text: "Class Distribution (At least 6 wins Swiss)"
      },
      data: [{        
        type: "bar",
        dataPoints: this.state.topSwissClasses.map(entry => { 
          return {
            label: entry['_id'][0].toUpperCase()+entry['_id'].substring(1).toLowerCase(), 
            y: entry['total'],
            indexLabel: entry['total']+'('+Math.round(entry['total']/totalTopSwiss*100)+'%)',
            color: classColors[entry['_id']]
          }})
      }]
    }

    const totalTop8 = this.state.top8Classes.reduce((a,b)=>a+b['total'],0);

    const optionsTop8 = {
      title: {
        text: "Class Distribution (Top 8)"
      },
      data: [{        
        type: "bar",
        dataPoints: this.state.top8Classes.map(entry => { 
          return {
            label: entry['_id'][0].toUpperCase()+entry['_id'].substring(1).toLowerCase(), 
            y: entry['total'],
            indexLabel: entry['total']+'('+Math.round(entry['total']/totalTop8*100)+'%)',
            color: classColors[entry['_id']]
          }})
      }]
    }

    return (
      <div>
        <CanvasJSChart options = {optionsTotal}/>
        <CanvasJSChart options = {optionsTopSwiss}/>
        <CanvasJSChart options = {optionsTop8}/>
      </div>
    );
  }
}

export default BattlefyAggregateStats;