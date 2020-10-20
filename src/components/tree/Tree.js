import * as React from 'react';
import { Group } from '@vx/group';
import { Tree } from '@vx/hierarchy';
import { LinearGradient } from '@vx/gradient';
import { hierarchy } from 'd3-hierarchy';
import shortId from 'shortid';
import Links from './Links';
import Nodes from './Nodes';
import { getPath } from './utils';

const selectedRoute = (node) => {
  const route = [];
  node.ancestors().forEach((i) => route.push(i.data.id));
  return route;
};

const TreeView = (props) => {
  const {
    data,
    width,
    height,
    margin = {
      top: 24,
      left: 24,
      right: 24,
      bottom: 24,
    },
    onCanvasClick,
    onCanvasDoubleClick,
    onCanvasHover,
    onCanvasMouseEnter,
    onCanvasMouseLeave,
    nodeChildren,
    onChange,
  } = props;
  debugger;
  const [layout, setlayout] = React.useState('cartesian');
  const [orientation, setOrientation] = React.useState('horizontal');
  const [linkType, setLinkType] = React.useState('diagonal');
  const [stepPercent, setStepPercent] = React.useState(0.5);
  const [r, forceUpdate] = React.useState(false); // i know...

  const [effectiveWidth, effectiveHeight] = React.useMemo(() => {
    const fHeight = height - 28;
    const fWidth = width;
    return [fWidth, fHeight];
  }, [width, height]);

  const [innerWidth, innerHeight] = React.useMemo(() => {
    const iWidth = effectiveWidth - margin.left - margin.right;
    const iHeight = effectiveHeight - margin.top - margin.bottom;
    return [iWidth, iHeight];
  }, [effectiveWidth, effectiveHeight, margin]);

  const { origin, sizeWidth, sizeHeight } = React.useMemo(() => {
    let origin;
    let sizeWidth;
    let sizeHeight;
    if (layout === 'polar') {
      origin = {
        x: (innerWidth / 2) + 24, // not completely sure why i have to do this but works
        y: (innerHeight / 2) + 24,
      };
      sizeWidth = 2 * Math.PI;
      sizeHeight = Math.min(innerWidth, innerHeight) / 2;
    } else if (orientation === 'vertical') {
      origin = { x: margin.top, y: margin.right };
      sizeWidth = 900;
      sizeHeight = 700;
    } else {
      origin = { x: margin.left, y: margin.top };
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
    return {
      origin,
      sizeWidth,
      sizeHeight,
    };
  }, [layout, innerWidth, innerHeight, orientation]);
    // const [root, routeSelected] = React.useMemo(() => {
    //     const newRoot = hierarchy(data, d => (d.isExpanded ? d.children : null));
    //     let rs:(string|number)[] = [];
    //     const selectedNode = newRoot.descendants().find(i=>i.data.selected) as TreeNode;
    //     if(selectedNode)rs=selectedRoute(selectedNode);
    // 	return [newRoot, rs];
    // }, [JSON.stringify(data)]);

  const root = hierarchy(data, (d) => (d.isExpanded ? d.children : null));
  let routeSelected = [];
  const rs = [];
  const selectedNode = root.descendants().find((i) => !!i.data.selected);
  if (selectedNode)routeSelected = selectedRoute(selectedNode);
  // JSON.stringify(data) //shit son
  const forceRefresh = () => {
    forceUpdate((prev) => !prev);
  };
  const operations = React.useMemo(() => ({
    addNode:
                props.addNode
                || function (node) {
                  node.data.children = [
                    ...(node.data.children || []),
                    {
                      name: `${node.data.name}.${(node.data.children
                                && node.data.children.length)
                            || 0}`,
                      id: shortId.generate(),
                    },
                  ];
                  node.data.isExpanded = true;
                  if (onChange) {
                    onChange(getPath(node, 'expanded'), true, node.data);
                    const src = getPath(node, 'children');
                    onChange(src, node.data.children, node.data);
                  }
                  forceRefresh();
                  return node;
                },
    removeNode:
                props.removeNode
                || function (node) {
                  const parentNode = node.parent;
                  if (!parentNode || !parentNode.data.children) throw `Expected defined parent with defined children but got ${parentNode}`;
                  parentNode.data.children = parentNode.data.children.filter((i) => i.id !== node.data.id);
                  parentNode.children = parentNode.children.filter((i) => i.data.id !== node.data.id);
                  // node.parent=null; //was causing exceptions, check utils.findCollapsedParent
                  if (onChange) {
                    const src = getPath(parentNode, 'children');
                    onChange(src, parentNode.data.children, parentNode.data);
                  }
                  return parentNode;
                },
    expandNode:
                props.expandNode
                || function (node) {
                  if (!node.data.isExpanded) {
                    node.data.x0 = node.x;
                    node.data.y0 = node.y;
                  }
                  node.data.isExpanded = !node.data.isExpanded;
                  if (onChange) {
                    const src = getPath(node, 'isExpanded');
                    onChange(src, node.data.isExpanded, node.data);
                  }
                  forceRefresh();
                  return node;
                },
    collapseAll:
                props.collapseAll
                || function (selector) {
                  if (!root.children || root.children.length === 0) return root;
                  const descendants = root.descendants();
                  descendants.forEach((i) => {
                    const node = i;
                    node.data.isExpanded = selector === undefined ? false : !selector(node);
                    // tried with the pretty way, more readable like this
                  });
                  if (onChange) {
                    if (selector === undefined || selector(root))onChange('isExpanded', false, root.data);
                    const src = 'children';
                    onChange(src, [...(root.data.children || [])], root.data);
                  }
                  return root;
                },
    expandAll:
                props.expandAll
                || function (selector) {
                  if (!data.children || data.children.length === 0) {
                    onChange && onChange('isExpanded', true, root.data);
                    return root;
                  }
                  const mockRoot = hierarchy(data);
                  mockRoot.descendants().forEach((i) => {
                    (i).data.isExpanded = selector === undefined ? true : selector(i);
                  });
                  if (onChange) {
                    if (selector === undefined || selector(mockRoot))onChange('isExpanded', true, root.data);
                    const src = 'children';
                    onChange(src, [...(mockRoot.data.children || [])], mockRoot.data);
                  }
                  return mockRoot;
                },
  }), [{ ...props }]);
  props.onOpsReady && props.onOpsReady(operations);
  return (
    <div>
      <div>
        <label>layout:</label>
        <select
          onChange={(e) => setlayout(e.target.value)}
          value={layout}
        >
          <option value="cartesian">cartesian</option>
          <option value="polar">polar</option>
        </select>

        <label>orientation:</label>
        <select
          onChange={(e) => setOrientation(e.target.value)}
          value={orientation}
          disabled={layout === 'polar'}
        >
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
        </select>

        <label>link:</label>
        <select
          onChange={(e) => setLinkType(e.target.value)}
          value={linkType}
        >
          <option value="diagonal">diagonal</option>
          <option value="step">step</option>
          <option value="curve">curve</option>
          <option value="line">line</option>
          <option value="elbow">elbow</option>
        </select>

        <label>step:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          onChange={(e) => setStepPercent(Number(e.target.value))}
          value={stepPercent}
          disabled={linkType !== 'step' || layout === 'polar'}
        />
      </div>

      <svg
        width={effectiveWidth}
        height={effectiveHeight}
      >
        <LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
        <rect
          id="vxTree_canvas"
          width={effectiveWidth}
          height={effectiveHeight}
          rx={14}
          fill="#272b4d"
          onClick={(e) => onCanvasClick && onCanvasClick(e, operations)}
          onDoubleClick={(e) => onCanvasDoubleClick && onCanvasDoubleClick(e, operations)}
          onMouseMove={(e) => onCanvasHover && onCanvasHover(e, operations)}
          onMouseEnter={(e) => onCanvasMouseEnter && onCanvasMouseEnter(e, operations)}
          onMouseLeave={(e) => onCanvasMouseLeave && onCanvasMouseLeave(e, operations)}
        />
        <Tree
          top={origin.y}
          left={origin.x}
          root={root}
          size={[sizeWidth, sizeHeight]}
          separation={(a, b) => (a.parent == b.parent ? 1 : 0.5) / a.depth}
        >
          {(data) => (
            <Group top={origin.y} left={origin.x}>
              <Links
                links={data.links()}
                linkType={linkType}
                layout={layout}
                orientation={orientation}
                stepPercent={stepPercent}
                selectedRoute={routeSelected}
              />

              <Nodes
                nodes={data.descendants()}
                layout={layout}
                orientation={orientation}
                operations={operations}
                nodeChildren={nodeChildren}
                onNodeChange={(src, value, node) => onChange && onChange(getPath(node, src), value, node.data)}
                {...props}
              />
            </Group>
          )}
        </Tree>
      </svg>
    </div>
  );
};

export default TreeView;
