import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import PropTypes from 'prop-types';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import Checkbox from '../form/Checkbox';
import { DASH_TYPES } from '../../data/link';
import Validate from '../../helpers/Validate';
import SvgLine from '../SvgLine';
import ContextMenu from '../contextMenu/ContextMenu';
import Utils from '../../helpers/Utils';

class AddLinkModal extends Component {
  static propTypes = {
    currentUserId: PropTypes.number.isRequired,
  }

  getTypes = memoizeOne((links) => {
    const types = links.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      linkData: {},
      show: false,
      index: null,
      errors: {},
    };
  }

  componentDidMount() {
    Chart.event.on('link.new', this.handleAddNewLine);
    ContextMenu.event.on('link.edit', this.handleLineEdit);
  }

  handleAddNewLine = (ev, d) => {
    const { source, target } = d;
    // const { linkData: { type } } = this.state;
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    const linkData = {
      source,
      target,
      value: 2,
      direction: false,
      type: types[0]?.value || null,
      linkType: 'a',
      description: '',
    };
    this.setState({
      linkData, show: true, index: null, errors: {},
    });
  }

  handleLineEdit = (ev, d) => {
    const linkData = Chart.getLinks().find((l) => l.index === d.index);
    this.setState({
      linkData, show: true, index: linkData.index, errors: {},
    });
  }

  closeModal = () => {
    this.setState({ show: false });
  }

  addLink = async (ev) => {
    ev.preventDefault();
    const { currentUserId } = this.props;
    const { linkData, index } = this.state;
    const isUpdate = !_.isNull(index);
    let links = Chart.getLinks();
    const errors = {};
    [errors.type, linkData.type] = Validate.linkType(linkData.type, linkData);
    [, linkData.value] = Validate.linkValue(linkData.value);

    if (!Validate.hasError(errors)) {
      linkData.updatedAt = moment().unix();
      linkData.updatedUser = currentUserId;
      if (isUpdate) {
        links = links.map((d) => {
          if (d.index === linkData.index) {
            d = linkData;
          }
          return d;
        });
      } else {
        linkData.createdAt = moment().unix();
        linkData.createdUser = currentUserId;
        links.push(linkData);
      }

      this.setState({ show: false });

      let checkLinkCurve;

      if (isUpdate) {
        checkLinkCurve = 'updateCurve';
      } else if (linkData.linkType === 'f') {
        checkLinkCurve = 'createCurve';
      } else checkLinkCurve = '';

      Chart.render({ links }, checkLinkCurve);
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { linkData, errors } = this.state;
    _.set(linkData, path, value);
    _.remove(errors, path);
    this.setState({ linkData, errors });
  }

  render() {
    const {
      linkData, index, errors, show,
    } = this.state;
    if (!show) {
      return null;
    }
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    const isUpdate = !_.isNull(index);

    Utils.orderGroup(types, linkData.type);

    let dashTypes;

    let messageNotCurve = false;

    const res = links.filter((p) => {
      if ((p.source === linkData.source || p.source === linkData.target)
          && (p.target === linkData.source || p.target === linkData.target)) {
        return p;
      }
    });

    if (isUpdate) {
      if (res.length !== 1) {
        dashTypes = Object.keys(DASH_TYPES);
        dashTypes.splice(1, 1);
      } else {
        dashTypes = Object.keys(DASH_TYPES);
      }
    } else if (res.length) {
      if (res[0].linkType === 'f') {
        messageNotCurve = true;
      }
      dashTypes = Object.keys(DASH_TYPES);
      dashTypes.splice(1, 1);
    } else dashTypes = Object.keys(DASH_TYPES);

    return (
      !messageNotCurve
        ? (
          <Modal
            className="ghModal"
            overlayClassName="ghModalOverlay"
            isOpen
            onRequestClose={this.closeModal}
          >
            <form onSubmit={this.addLink}>
              <h2>
                {isUpdate ? 'Edit Link' : 'Add new Link'}
              </h2>
              <Select
                label="Link Type"
                value={[linkData.linkType]}
                error={errors.linkType}
                onChange={(v) => this.handleChange('linkType', v)}
                options={dashTypes}
                containerClassName="lineTypeSelect"
                getOptionValue={(v) => v}
                getOptionLabel={(v) => <SvgLine type={v} />}
              />

              <Select
                label="Relation Type"
                isSearchable
                portal
                placeholder=""
                value={[
                  types.find((t) => t.value === linkData.type) || {
                    value: linkData.type,
                    label: linkData.type,
                  },
                ]}
                error={errors.type}
                onChange={(v) => this.handleChange('type', v?.value)}
                options={types}
                isCreatable
              />

              <Input
                label="Value"
                value={linkData.value}
                error={errors.value}
                type="number"
                min="1"
                max="15"
                onBlur={() => {
                  if (linkData.value < 1) {
                    linkData.value = 1;
                  } else if (linkData.value > 15) {
                    linkData.value = 15;
                  }
                  this.handleChange('value', linkData.value);
                }}
                onChangeText={(v) => this.handleChange('value', v)}
              />

              <Checkbox
                label="Show Direction"
                checked={linkData.direction}
                onChange={() => this.handleChange('direction', !linkData.direction)}
              />
              <div className="buttons">
                <Button onClick={this.closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isUpdate ? 'Save' : 'Add'}
                </Button>
              </div>
            </form>
          </Modal>
        )
        : (
          <Modal
            isOpen
            className="ghModal ghModalSearch"
            overlayClassName="ghModalOverlay"
          >
            <div className="graphMode">
              <h2>Information</h2>
              <h3>These nodes cannot have other links, if they are related by this link type</h3>
              <div className="buttons">
                <Button onClick={this.closeModal} className="cancel transparent alt">
                  Ok
                </Button>
              </div>
            </div>
          </Modal>
        )
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
});
const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLinkModal);

export default Container;
