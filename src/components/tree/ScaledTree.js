import * as React from 'react';
import { withStyles, createStyles } from '@material-ui/core/styles';
import Measure from 'react-measure';
import Tree from './Tree';

const styles = createStyles({
  rootDiv: {
    backgroundPosition: 'center',
    flex: '1 1',
    overflow: 'hidden',
    height: '100vh',
    maxHeight: '100vh',
    position: 'relative',
  },
});

const ScaledTree = (props) => {
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  return (
    <Measure
      bounds
      onResize={(rect) => {
        if (rect.bounds) {
          setWidth(rect.bounds.width);
          setHeight(rect.bounds.height);
        }
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={props.classes.rootDiv}>
          <Tree {...props} width={width - 20} height={height - 20} />
        </div>
      )}
    </Measure>
  );
};

export default withStyles(styles)(ScaledTree);
