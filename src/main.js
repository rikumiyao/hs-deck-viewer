import { Switch, Route } from 'react-router-dom'
import React, {Component} from 'react';
import Specialist from './components/specialist';
import Conquest from './components/conquest';
import Battlefy from './components/battlefy';
import BattlefyEvent from './components/battlefyevent';
import BattlefyDecks from './components/battlefydecks';
import DeckViewer from './components/deckviewer';
import Grandmaster from './components/grandmaster';
import GrandmasterDecks from './components/grandmasterdecks';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/' component={Conquest}/>
          <Route path='/specialist/(.+)' component={DeckViewer}/>
          <Route path='/specialist' component={Specialist}/>
          <Route path='/conquest' component={Conquest}/>
          <Route path='/battlefy/([0-9a-f]+)/([0-9a-f]+)' component={BattlefyDecks}/>
          <Route path='/battlefy/week/' component={Battlefy}/>
          <Route path='/battlefy/([0-9a-f]+)' component={BattlefyEvent}/>
          <Route path='/battlefy' component={Battlefy}/>
          <Route path='/grandmasters/([0-9]+)' component={GrandmasterDecks}/>
          <Route path='/grandmasters' component={Grandmaster}/>
        </Switch>
      </main>
    );
  }
}

export default Main;