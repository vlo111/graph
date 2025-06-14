import _ from 'lodash';

class CustomFields {
  static LIMIT = 10;

  static setValue(customFields = {}, type, name, values) {
    let i = 0;
    let success = true;
    _.forEach(values, (value, key) => {
      if (!customFields[type] || !customFields[type][key]) {
        customFields = this.setKey(customFields, type, key, '');
      }
      if (customFields[type] && customFields[type][key]) {
        customFields[type][key].values[name] = value;
        if (customFields[type][key].order === undefined) {
          customFields[type][key].order = i;
        }
      } else {
        success = false;
      }
      i += 1;
    });
    return {
      success,
      customFields: _.cloneDeep(customFields),
    };
  }

  static setKey(customFields = {}, type, key, subtitle = '') {
    if (Object.keys(customFields[type] || {}).length >= this.LIMIT) {
      console.warn('CustomFields limit');
      return customFields;
    }
    if (!_.get(customFields, [type, key])) {
      _.set(customFields, [type, key], {
        order: Object.values(customFields[type] || {}).length,
        values: {},
        subtitle,
      });
    }
    return { ...customFields };
  }

  static canAddKey(customFields, type) {
    return Object.keys(customFields[type] || {}).length < this.LIMIT;
  }

  static keyExists(customFields, type) {
    return !!customFields[type];
  }

  static removeKey(customFields = {}, type, key) {
    if (customFields[type]) {
      delete customFields[type][key];
    }
    return { ...customFields };
  }

  static nodeRename(customFields = {}, type, oldName, name) {
    const customFieldType = _.get(customFields, type, {});
    _.forEach(customFieldType, (d, key) => {
      if (_.get(customFields, [type, key, oldName])) {
        _.set(customFields, [type, key, name], d);
        _.remove(customFields, [type, key, oldName]);
      }
    });
    return customFields;
  }

  static get(customFields, type, name) {
    const customFieldType = _.get(customFields, type, {});
    const data = {};
    _.forEach(customFieldType, (d, key) => {
      data[key] = _.get(d, ['values', name], undefined);
    });

    return data;
  }

  static getKeys(customFields, type) {
    if (!customFields[type]) {
      return [];
    }
    const customFieldType = _.chain(customFields[type])
      .map((val, key) => ({
        key,
        order: val.order,
      }))
      .orderBy('order')
      .map((d) => d.key)
      .value();
    return customFieldType;
  }
}

export default CustomFields;
