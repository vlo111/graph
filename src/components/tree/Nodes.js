import React, { Component } from 'react';
import { Group } from '@vx/group';
import NodeGroup from 'react-move/NodeGroup';
import Node from './Node';
import { findCollapsedParent, getTopLeft } from './utils';

class NodesMove extends Component {
  constructor(props) {
    super(props);
  }

    compareRects= () => {
      // checks if positions are optimized for sizes, if not, rerenders
      const newRenderRects = this.props.nodes.map((i) => ({
        x: i.data.renderWidth,
        y: i.data.renderHeight,
      }));
      if (!this.renderRects) return;
      if (this.renderRects === newRenderRects) return;

      for (let i = 0; i < this.renderRects.length; i++) {
        if (
          this.renderRects[i].x !== newRenderRects[i].x
				|| this.renderRects[i].y !== newRenderRects[i].y
        ) {
          this.prioritizedData = [...this.props.nodes];
          this.forceUpdate();
          return;
        }
      }
      this.prioritizedData = undefined;
    }

    componentDidMount() {
      this.compareRects();
    }

    componentDidUpdate(prevProps) {
      const oldData = prevProps.nodes;
      if (!oldData) return;
      this.compareRects();
    }

    render() {
      const {
        nodes, layout, orientation, onNodeClick, operations, nodeChildren,
      } = this.props;
      this.renderRects = nodes.map((i) => ({
        x: i.data.renderWidth,
        y: i.data.renderHeight,
      }));
      return (
        <NodeGroup
          data={this.prioritizedData || nodes}
          keyAccessor={(d) => d.data.id}
          start={(node) => {
            const parentTopLeft = getTopLeft(
              node.parent || { x: 0, y: 0 },
              layout,
              orientation,
            );
            return {
              top: parentTopLeft.top,
              left: parentTopLeft.left,
              opacity: 0,
            };
          }}
          enter={(node) => {
            const topLeft = getTopLeft(node, layout, orientation);
            return {
              top: [topLeft.top],
              left: [topLeft.left],
              opacity: [1],
            };
          }}
          update={(node) => {
            const topLeft = getTopLeft(node, layout, orientation);
            return {
              top: [topLeft.top],
              left: [topLeft.left],
              opacity: [1],
            };
          }}
          leave={(node) => {
            if (!node.parent)alert('alert bug node parent is null');
            const collapsedParent = findCollapsedParent(node.parent);
            const collapsedParentPrevPos = {
              ...collapsedParent, // assume not null because root (only parentless node, will never leave)
              x: collapsedParent.data.x0 || collapsedParent.x,
              y: collapsedParent.data.y0 || collapsedParent.y,
            };
            const topLeft = getTopLeft(
              collapsedParentPrevPos,
              layout,
              orientation,
            );
            return {
              top: [topLeft.top],
              left: [topLeft.left],
              opacity: [0],
            };
          }}
        >
          {(nodes) => (
            <Group id={`vxTree_${nodes[0].data.data.id}_nodes_group`}>
              {nodes.sort((x, y) => Number(x.data.data.selected || 0)
                  - Number(y.data.data.selected || 0)).map(({ key, data: node, state }) => {
                const width = 40;
                const height = 20;
                return (
                  <Group
                    top={state.top}
                    left={state.left}
                    key={key}
                    opacity={state.opacity}
                    id={`${node.data.id}_node_group`}
                  >
                    <Node
                      operations={operations}
                      node={node}
                      key={key}
                      children={nodeChildren}
                      {...(this.props)}
                    />
                  </Group>
                );
              })}
            </Group>
          )}
        </NodeGroup>
      );
    }
}

export default NodesMove;
