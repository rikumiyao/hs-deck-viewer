import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown } from 'react-bootstrap';

class Header extends Component {
  render() {
    const pageURI = window.location.pathname;
    const component = pageURI.split('/')[1];
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">YAYtears</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="Hearthstone" id="hearthstone-nav-dropdown">
              <NavDropdown.Item href="/conquest" className={(component==="conquest"?" active":"")}>Conquest</NavDropdown.Item>
              <NavDropdown.Item href="/specialist" className={(component==="specialist"?" active":"")}>Specialist</NavDropdown.Item>
              <NavDropdown.Item href="/deck" className={(component==="deck"?" active":"")}>Deck</NavDropdown.Item>
            </NavDropdown>
            <Link to="/battlefy" className={"nav-item nav-link"+(component==="battlefy"?" active":"")}><NavItem>Battlefy</NavItem></Link>
            <Link to="/grandmasters" className={"nav-item nav-link"+(component==="grandmasters"?" active":"")}><NavItem>Grandmasters</NavItem></Link>
          </Nav>
          <button className="btn btn-outline-secondary mr-sm-2" onClick={this.props.onToggle}><i className="icon-cogs"></i>
            {this.props.isDarkMode ? ' Disable Dark Mode' : ' Enable Dark Mode'}
          </button>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;