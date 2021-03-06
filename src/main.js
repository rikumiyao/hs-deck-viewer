import { Switch, Route } from 'react-router-dom';
import React, {Component} from 'react';
import DeckPanel from './components/deckpanel';
import DeckViewer from './components/deckviewer';
import HearthstoneDeck from './components/hearthstonedeck';
import Battlefy from './components/battlefy';
import BattlefyEvent from './components/battlefyevent';
import BattlefyPlayer from './components/battlefyplayer';
import BattlefyDecks from './components/battlefydecks';
import Grandmaster from './components/grandmaster';
import GrandmasterDecks from './components/grandmasterdecks';
import RuneterraLeaderboard from './components/runeterraleaderboard';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/' component={HearthstoneDeck}/>
          <Route path='/(specialist|conquest)/(.+)' component={DeckViewer}/>
          <Route path='/(specialist|conquest)' component={DeckPanel}/>
          <Route path='/deck/(.+)' component={DeckViewer}/>
          <Route path='/deck' component={HearthstoneDeck}/>
          <Route path='/battlefy/([0-9a-f]+)/([0-9a-f]+)' component={BattlefyDecks}/>
          <Route path='/battlefy/([0-9a-f]+)/(.+)' component={BattlefyPlayer}/>
          <Route path='/battlefy/week/' component={Battlefy}/>
          <Route path='/battlefy/([0-9a-f]+)' component={BattlefyEvent}/>
          <Route path='/battlefy' component={Battlefy}/>
          <Route path='/grandmasters/([0-9]+)' component={GrandmasterDecks}/>
          <Route path='/grandmasters' component={Grandmaster}/>
          <Route path='/runeterra/leaderboard' component={RuneterraLeaderboard}/>
        </Switch>
      </main>
    );
  }
}

export default Main;