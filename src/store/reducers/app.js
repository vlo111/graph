import _ from 'lodash';
import {
  LOADING,
  NEW_NODE_MODAL, PREVIOUS_ACTIVE_BUTTON, RESET_FILTER,
  SET_ACTIVE_BUTTON, SET_FILTER, SET_GRID_INDEXES,
  TOGGLE_GRID, SET_LEGEND_BUTTON, SET_GRAPH_MODE,
} from '../actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import { DEFAULT_FILTERS } from '../../data/filter';
import Chart from '../../Chart';

const initialState = {
  activeButton: 'create',
  _activeButtonPrev: 'create',
  nodeDescription: '',
  addNodeParams: {},
  isLoading: false,
  filters: ChartUtils.getFilters(),
  selectedGrid: {
    nodes: [],
    links: [],
  },
  legendButton: 'close',
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_BUTTON: {
      if (state.activeButton === action.payload.button) {
        return state;
      }
      return {
        ...state,
        _activeButtonPrev: state.activeButton,
        activeButton: action.payload.button,
      };
    }
    case PREVIOUS_ACTIVE_BUTTON: {
      return {
        ...state,
        activeButton: state._activeButtonPrev || 'create',
      };
    }
    case NEW_NODE_MODAL: {
      return {
        ...state,
        addNodeParams: action.payload.params,
      };
    }
    case TOGGLE_GRID: {
      const { index, grid } = action.payload;
      const { selectedGrid } = state;
      selectedGrid[grid] = [...selectedGrid[grid]];
      const i = selectedGrid[grid].indexOf(index);
      if (i > -1) {
        selectedGrid[grid].splice(i, 1);
      } else {
        selectedGrid[grid].push(index);
      }
      Chart.node.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedNode(selectedGrid, d) })));
      Chart.link.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedLink(selectedGrid, d) })));

      return {
        ...state,
        selectedGrid,
      };
    }
    case SET_GRID_INDEXES: {
      const { indexes, grid } = action.payload;
      const selectedGrid = { ...state.selectedGrid };
      selectedGrid[grid] = indexes;
      Chart.node.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedNode(selectedGrid, d) })));
      Chart.link.attr('class', ChartUtils.setClass((d) => ({ unChecked: !ChartUtils.isCheckedLink(selectedGrid, d) })));
      return {
        ...state,
        selectedGrid,
      };
    }
    case LOADING: {
      const { isLoading } = action.payload;
      return {
        ...state,
        isLoading,
      };
    }
    case SET_FILTER: {
      const { key, value } = action.payload;
      const filters = { ...state.filters };
      _.set(filters, key, value);
      // ChartUtils.setFilter(key, value);
      return {
        ...state,
        filters,
      };
    }
    case RESET_FILTER: {
      return {
        ...state,
        filters: _.cloneDeep(DEFAULT_FILTERS),
      };
    }
    case SET_LEGEND_BUTTON: {
      if (state.legendButton === action.payload.mode) {
        return state;
      }
      return {
        ...state,
        legendButton: action.payload.mode,
      };
    }
    case SET_GRAPH_MODE: {
      if (state.graphMode === action.payload.mode) {
        return state;
      }
      return {
        ...state,
        graphMode: action.payload.mode,
      };
    }
    default: {
      return state;
    }
  }
}
