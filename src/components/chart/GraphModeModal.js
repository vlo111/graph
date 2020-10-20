import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { setActiveButton, setGraphMode } from '../../store/actions/app';
import Button from '../form/Button';

class GraphModeModal extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      setGraphMode: PropTypes.func.isRequired,
      graphMode: PropTypes.func.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        show: false,
      };
    }

    componentDidMount() {
      this.setState({ show: true });
    }

    checkMode = async () => {
      if (this.props.graphMode !== 'tree') {
        this.props.setGraphMode('tree');
      } else {
        this.props.setGraphMode('create');
      }
      this.setState({ show: false });
      this.props.setActiveButton(this.props.graphMode);
    }

    disableModal = () => {
      this.setState({ show: false });
      this.props.setActiveButton(this.props.graphMode);
    }

    render() {
      const { show } = this.state;
      if (!show) {
        return null;
      }

      return (
        <Modal
          isOpen
          className="ghModal ghModalSearch"
          overlayClassName="ghModalOverlay"
        >
          <div className="graphMode">
            <h2>Are you sure ?</h2>
            <h3>All unsaved data will be lost. Do you want to switch the mode?</h3>
            <div className="buttons">
              <Button onClick={this.disableModal} className="cancel transparent alt">
                Back
              </Button>
              <Button className="accent alt" type="submit" onClick={this.checkMode}>
                Submit
              </Button>
            </div>
          </div>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  graphMode: state.app.graphMode,
});

const mapDispatchToProps = {
  setActiveButton,
  setGraphMode,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphModeModal);

export default Container;
