import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import SearchInput from './search/SearchInput';
import AccountDropDown from './account/AccountDropDown';
import Utils from "../helpers/Utils";

class HeaderMini extends Component {
  render() {
    const { match: { params: { graphId = '', token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed();
    return (
      <header id="headerMini">
        <SearchInput />
        <ul className="links">
          <li>
            <Link to={isInEmbed ? `/graphs/embed/filter/${graphId}/${token}` : `/graphs/filter/${graphId}`}>
              Filter
            </Link>
          </li>
        </ul>

        {!isInEmbed ? (
          <AccountDropDown mini />
        ) : null}

      </header>
    );
  }
}

export default withRouter(HeaderMini);
