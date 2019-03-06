import { Switch, Route } from 'react-router-dom'
import React, {Component} from 'react';
import Specialist from './components/specialist';
import Conquest from './components/conquest';
import Battlefy from './components/battlefy';
import BattlefyEvent from './components/battlefyevent';
import BattlefyDecks from './components/battlefydecks';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/' component={Specialist}/>
          <Route path='/specialist' component={Specialist}/>
          <Route path='/conquest' component={Conquest}/>
          <Route path='/battlefy/([0-9a-f]+)/([0-9a-f]+)' component={BattlefyDecks}/>
          <Route path='/battlefy/([0-9a-f]+)' component={BattlefyEvent}/>
          <Route path='/battlefy' component={Battlefy}/>
        </Switch>
      </main>
    );
  }
}

export default Main;