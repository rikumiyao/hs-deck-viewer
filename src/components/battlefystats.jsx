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

class BattlefyStats extends Component {

  render() {
    const classes = this.props.classes;
    const players = this.props.players;

    const classesTotal = Object.values(classes).reduce((acc, cur) => {
      if (acc[cur]) {
        acc[cur]++;
      } else {
        acc[cur] = 1;
      }
      return acc;
    },{});
    const total = Object.values(classesTotal).reduce((a,b)=>a+b, 0);
    const classesTopSwiss = Object.entries(players).reduce((acc, entry) => {
      const name = entry[0];
      const value = entry[1];
      if (value['wins']>=6) {
        const className = classes[name];
        if (acc[className]) {
          acc[className]++;
        } else {
          acc[className] = 1;
        }
      }
      return acc;
    }, {});
    const classNames = ['Warrior', 'Warlock', 'Shaman', 'Rogue', 'Priest', 'Paladin', 'Mage', 'Hunter', 'Druid'];
    const optionsTotal = {
      title: {
        text: "Class Distribution (Total)"
      },
      colorSet: 'classes',
      data: [{        
        type: "bar",
        dataPoints: classNames.map(name => {
          const value = classesTotal[name.toLowerCase()] ? classesTotal[name.toLowerCase()] : 0;
          return {
            label: name, 
            y: value,
            indexLabel: value+'('+Math.round(value/total*100)+'%)'
          }
        })
      }]
    }

    const totalTopSwiss = Object.values(classesTopSwiss).reduce((a,b)=>a+b, 0);
    const optionsTopSwiss = {
      title: {
        text: "Class Distribution (At least 6 wins Swiss)"
      },
      data: [{
        type: "bar",
        dataPoints: classNames.filter(name => classesTopSwiss[name.toLowerCase()]).map(name => { 
          const value = classesTopSwiss[name.toLowerCase()];
          return {
            label: name,
            y: classesTopSwiss[name.toLowerCase()], 
            color: classColors[name.toLowerCase()],
            indexLabel: value+'('+Math.round(value/totalTopSwiss*100)+'%)'
          }
        })
      }]
    }

    const classesTop8 = Object.entries(players).reduce((acc, entry) => {
      const name = entry[0];
      const value = entry[1];
      if (value['place']) {
        const className = classes[name];
        if (acc[className]) {
          acc[className]++;
        } else {
          acc[className] = 1;
        }
      }
      return acc;
    }, {});

    const totalTop8 = Object.values(classesTop8).reduce((a,b)=>a+b, 0);
    const optionsTop8 = {
      title: {
        text: "Class Distribution (Top 8)"
      },
      data: [{
        type: "bar",
        dataPoints: classNames.filter(name => classesTop8[name.toLowerCase()]).map(name => { 
          const value = classesTop8[name.toLowerCase()];
          return {
            label: name, 
            y: classesTop8[name.toLowerCase()], 
            color: classColors[name.toLowerCase()],
            indexLabel: value+'('+Math.round(value/totalTop8*100)+'%)'
          }
        })
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

export default BattlefyStats;