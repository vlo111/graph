import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Input from '../../form/Input';
import FileInput from '../../form/FileInput';
import Button from '../../form/Button';
import { addNewTreeNode, openedAddNewTreeNodeModal } from '../../../store/actions/graphs';

class GraphModeModal extends Component {
  initNodeData = memoizeOne(() => {
    this.setState({
      nodeData: {
        name: '',
        icon: '',
        type: 'root',
      },
      errors: {},
    });
  }, _.isEqual)

  static propTypes = {
    addNewTreeNode: PropTypes.func.isRequired,
    openedAddNewTreeNodeModal: PropTypes.func.isRequired,
    isAddTreeModalOpen: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodeData: {
        keywords: [],
      },
    };
  }

  componentDidMount() {
    this.props.openedAddNewTreeNodeModal(false);
  }

  disableModal = () => {
    this.props.openedAddNewTreeNodeModal(false);
  }

  handleChange = (path, value) => {
    const { nodeData, errors } = this.state;
    _.set(nodeData, path, value);
    _.remove(errors, path);
    this.setState({ nodeData, errors });
  }

  saveNode = async (ev) => {
    ev.preventDefault();
    const { nodeData } = this.state;

    this.props.addNewTreeNode(nodeData);

    this.props.openedAddNewTreeNodeModal(false);
  }

  render() {
    const { nodeData } = this.state;
    this.initNodeData();

    if (!this.props.isAddTreeModalOpen) {
      return null;
    }

    return (
      <Modal
        isOpen
        className="ghModal ghModalSearch"
        overlayClassName="ghModalOverlay"
      >
        <form className="graphMode" onSubmit={this.saveNode}>
          {' '}
          <form />
          <h2>Add node</h2>
          <Input
            value={nodeData.type}
            error=""
            label="Type"
            disabled="true"
            onChange={(v) => this.handleChange('type', v?.value || '')}
          />
          <Input
            label="Name"
            value={nodeData.name}
            error=""
            limit={250}
            autoFocus
            onChangeText={(v) => this.handleChange('name', v)}
          />
          <FileInput
            label="Icon"
            accept=".png,.jpg,.gif"
            value={nodeData.icon}
            onChangeFile={(v) => this.handleChange('icon', v)}
          />
          <div className="buttons">
            <Button onClick={this.disableModal} className="cancel transparent alt">
              Back
            </Button>
            <Button className="accent alt" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  isAddTreeModalOpen: state.graphs.isAddTreeModalOpen,
});

const mapDispatchToProps = {
  openedAddNewTreeNodeModal,
  addNewTreeNode,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphModeModal);

export default Container;
