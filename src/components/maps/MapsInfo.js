import React, { Component } from 'react';
import { Map, Marker } from 'google-maps-react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import withGoogleMap from '../../helpers/withGoogleMap';
import markerImg from '../../assets/images/icons/marker.svg';
import Button from '../form/Button';
import ContextMenu from '../contextMenu/ContextMenu';
import Chart from '../../Chart';

class MapsInfo extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
  }

  initLocation = memoizeOne((location) => {
    const [lat, lng] = location.split(',');
    this.setState({ location: { lat, lng } });
  })

  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      location: {},
    };
  }

  componentDidMount() {
    ContextMenu.event.on('node.location-edit', this.editLocation);
    ContextMenu.event.on('node.location-delete', this.deleteLocation);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.location-edit', this.editLocation);
    ContextMenu.event.removeListener('node.location-delete', this.deleteLocation);
  }

  handleLocationChange = (props, map, ev) => {
    const { edit } = this.state;
    if (!edit) return;
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    this.setState({ location });
  }

  editLocation = () => {
    this.setState({ edit: true });
  }

  deleteLocation = () => {
    const { node } = this.props;
    const nodes = Chart.getNodes().map((d) => {
      if (d.index === node.index) {
        d.location = undefined;
      }
      return d;
    });
    Chart.render({ nodes });
    this.setState({ edit: false, location: {} });
    this.props.history.replace('#delete');
  }

  saveLocation = () => {
    const { location } = this.state;
    const { node } = this.props;
    const nodes = Chart.getNodes().map((d) => {
      if (d.index === node.index) {
        d.location = [location.lat, location.lng].join(',');
      }
      return d;
    });
    Chart.render({ nodes });
    this.setState({ edit: false });
  }

  render() {
    const { edit, location } = this.state;
    const { node, google } = this.props;
    this.initLocation(node.location);
    if (_.isEmpty(location)) {
      return null;
    }
    return (
      <div data-field-name="_location" className="contentWrapper previewWrapper mapWrapper">
        <div className="content">
          <Map
            google={google}
            zoom={9}
            streetViewControl={false}
            fullscreenControl={false}
            onClick={this.handleLocationChange}
            initialCenter={location}
          >
            <Marker
              title={node.name}
              name={node.name}
              position={location}
              draggable={edit}
              onDragend={this.handleLocationChange}
              icon={{
                url: markerImg,
                anchor: new google.maps.Point(25, 35),
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          </Map>
          {edit ? (
            <Button className="selectLocation" onClick={this.saveLocation}>Save</Button>
          ) : null}
        </div>
      </div>
    );
  }
}

export default withGoogleMap(withRouter(MapsInfo));
