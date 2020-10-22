import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Outside from '../Outside';
import Icon from '../form/Icon';
import { setActiveButton } from '../../store/actions/app';

class AccountDropDown extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    myAccount: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    mini: PropTypes.bool,
  }

  static defaultProps = {
    mini: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      showDropDown: false,
    };
  }

  toggleDropDown = () => {
    const { showDropDown } = this.state;
    this.setState({ showDropDown: !showDropDown });
  }

  handleClick = (button) => {
    this.props.setActiveButton(button);
  }

  render() {
    const { showDropDown } = this.state;
    const { mini, myAccount: { firstName, lastName, avatar }, match: { params: { graphId = '' } } } = this.props;
    const name = [firstName, lastName].map((n) => n).join(' ');
    const visible = ['/', '/account'].includes(window.location.pathname);
    const mode = this.props.graphMode === 'tree' ? 'Disable decision tree mode' : 'Switch to decision tree mode';
    return (
      <div id="accountDropDown" className={mini ? 'mini' : undefined}>
        <div className="accountInfo" onClick={this.toggleDropDown}>
          <img src={avatar} className="avatar" alt={name} />
          {mini ? (
            <Icon value="fa-chevron-down" className="down" />
          ) : (
            <span className="name">{name}</span>
          )}
        </div>
        {showDropDown ? (
          <Outside onClick={this.toggleDropDown} exclude="#accountDropDown">
            <div className="dropdown">
              <ul>
                <li className="item">
                  <Link to="/account">Account</Link>
                </li>
                {!visible
                && (
                <li className="item">
                  <Link to={`/graphs/filter/${graphId}`}>Filters</Link>
                </li>
                )}
                <li className="item">
                  <Link to="#" onClick={() => this.handleClick('graph-mode')}>{mode}</Link>
                </li>
                <li className="item">
                  <Link to="/sign/sign-out">Sign Out</Link>
                </li>
              </ul>
            </div>
          </Outside>
        ) : null}

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  myAccount: state.account.myAccount,
  graphMode: state.app.graphMode,
});

const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountDropDown);

export default withRouter(Container);
