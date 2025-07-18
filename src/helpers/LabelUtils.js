import _ from 'lodash';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';
import Utils from './Utils';
import store from '../store';
import CustomFields from './CustomFields';
import { setNodeCustomField } from '../store/actions/graphs';

class LabelUtils {
  static copy(graphId, name, customFields) {
    const labels = Chart.getLabels();
    const nodes = Chart.getNotesWithLabels().filter((n) => n.labels.includes(name));
    const links = Chart.getLinks().filter((l) => nodes.some((n) => l.source === n.name) && nodes.some((n) => l.target === n.name));
    const label = labels.find((l) => l.name === name);

    const data = {
      graphId,
      label,
      nodes,
      links,
      customFields,
    };
    sessionStorage.setItem('label.copy', JSON.stringify(data));

    return data;
  }

  static past(x, y) {
    let data;
    try {
      data = JSON.parse(sessionStorage.getItem('label.copy'));
    } catch (e) {
      //
    }
    if (!data) {
      return;
    }
    const { x: posX, y: posY } = ChartUtils.calcScaledPosition(x, y);
    const nodes = Chart.getNodes();
    const minX = Math.min(...data.label.d.map((l) => l[0]));
    const minY = Math.min(...data.label.d.map((l) => l[1]));
    data.label.d = data.label.d.map((i) => {
      i[0] = i[0] - minX + posX;
      i[1] = i[1] - minY + posY;
      return i;
    });

    data.nodes.forEach((d) => {
      const originalName = d.name;
      if (nodes.some((n) => n.name === d.name)) {
        const i = _.chain(nodes)
          .filter((n) => new RegExp(`^${Utils.escRegExp(d.name)}(_\\d+|)$`).test(n.name))
          .map((n) => {
            const [, num] = n.name.match(/_(\d+)$/) || [0, 0];
            return +num;
          })
          .max()
          .value() + 1;
        d.name = `${d.name}_${i}`;
        data.links = data.links.map((l) => {
          if (l.source === originalName) {
            l.source = d.name;
            l.sx = l.sx - minX + posX;
            l.sy = l.sy - minY + posY;
          }
          if (l.target === originalName) {
            l.target = d.name;
            l.tx = l.tx - minX + posX;
            l.ty = l.ty - minY + posY;
          }
          return l;
        });
      }
      d.fx = d.fx - minX + posX;
      d.fy = d.fy - minY + posY;
      const customField = CustomFields.get(data.customFields, d.type, originalName);

      store.dispatch(setNodeCustomField(d.type, d.name, customField));
      nodes.push(d);
    });

    const links = [...Chart.getLinks(), ...data.links];
    const labels = Chart.getLabels();

    if (labels.some((l) => l.name === data.label.name)) {
      const i = _.chain(labels)
        .filter((n) => new RegExp(`^${Utils.escRegExp(data.label.name)}(_\\d+|)$`).test(n.name))
        .map((n) => {
          const [, num] = n.name.match(/_(\d+)$/) || [0, 0];
          return +num;
        })
        .max()
        .value() + 1;
      data.label.name = `${data.label.name}_${i}`;
    }
    if (labels.some((l) => l.color === data.label.color)) {
      delete data.label.color;
      data.label.color = ChartUtils.labelColors(data.label);
    }

    labels.push(data.label);

    Chart.render({ links, nodes, labels });
  }
}

export default LabelUtils;
