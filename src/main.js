import { Switch, Route } from 'react-router-dom'
import React, {Component} from 'react';
import DeckPanel from './components/deckpanel';
import DeckViewer from './components/deckviewer';
import Battlefy from './components/battlefy';
import BattlefyEvent from './components/battlefyevent';
import BattlefyPlayer from './components/battlefyplayer';
import BattlefyDecks from './components/battlefydecks';
import Grandmaster from './components/grandmaster';
import GrandmasterDecks from './components/grandmasterdecks';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/' component={DeckPanel}/>
          <Route path='/(specialist|conquest)/(.+)' component={DeckViewer}/>
          <Route path='/(specialist|conquest)' component={DeckPanel}/>
          <Route path='/battlefy/([0-9a-f]+)/([0-9a-f]+)' component={BattlefyDecks}/>
          <Route path='/battlefy/([0-9a-f]+)/(.+)' component={BattlefyPlayer}/>
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