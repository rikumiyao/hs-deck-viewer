import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Header extends Component {
  render() {
    const pageURI = window.location.pathname;
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <NavLink to="#" className="navbar-brand">YAYtears</NavLink>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <NavLink to="/conquest" className="nav-item nav-link">
              {(pageURI==='/conquest') ? (<span className="sr-only">(current)</span>) : ''}Conquest
            </NavLink>
            <NavLink to="/specialist" className="nav-item nav-link">
              {(pageURI==='/specialist') ? (<span className="sr-only">(current)</span>) : ''}Specialist
            </NavLink>
            <NavLink to="/battlefy" className="nav-item nav-link">
              {(pageURI==='/battlefy') ? (<span className="sr-only">(current)</span>) : ''}Battlefy
            </NavLink>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;