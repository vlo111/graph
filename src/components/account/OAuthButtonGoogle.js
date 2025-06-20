import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { oAuthRequest } from '../../store/actions/account';
import googleImg from '../../assets/images/icons/google.svg';
import { toast } from "react-toastify";

const { REACT_APP_GOOGLE_CLIENT_ID } = process.env;

class OAuthButtonGoogle extends Component {
  static propTypes = {
    oAuthRequest: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    window.handleGoogleInit = this.handleGoogleInit;
  }

  handleGoogleInit = () => {
    const { gapi } = window;
    gapi.load('auth2', () => {
      const auth = gapi.auth2.init({
        client_id: REACT_APP_GOOGLE_CLIENT_ID,
        cookiepolicy: 'single_host_origin',
      });
      auth.attachClickHandler(this.button, {}, (googleUser) => {
        const { wc: { access_token: accessToken } } = googleUser;
        if (!accessToken) {
          toast.error('Something went wrong');
          return;
        }
        this.props.oAuthRequest('google', { accessToken });
      }, (error) => {
        toast.error(`Something went wrong: ${error.error}`);
        console.warn(error);
      });
    });
  }

  render() {
    return (
      <>
        <Helmet>
          <script async defer src="https://apis.google.com/js/api:client.js?onload=handleGoogleInit" />
        </Helmet>
        <button type="button" className="button" ref={(ref) => this.button = ref}>
          <img src={googleImg} alt="Google" className="whiteBg" />
          <span>Google</span>
        </button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  oAuthRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OAuthButtonGoogle);

export default Container;
