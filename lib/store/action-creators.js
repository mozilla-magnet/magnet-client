
exports.updateItem = (id, update) => {
  return {
    type: 'UPDATE_ITEM',
    id,
    update
  };
}

exports.setItemMetadata = (id, metadata) => {
  return {
    type: 'SET_ITEM_METADATA',
    metadata,
    id
  };
}

exports.setOpenItem = (id) => {
  return {
    type: 'SET_OPEN_ITEM',
    id,
  };
}

exports.removeItem = (id) => {
  return {
    type: 'REMOVE_ITEM',
    id,
  };
}

exports.clearItems = () => {
  return {
    type: 'CLEAR_ITEMS',
  };
}

exports.setIndicateScanning = (value) => {
  return {
    type: 'SET_INDICATE_SCANNING',
    value,
  };
}

exports.setUserFlag = (key, value) => {
  return {
    type: 'SET_USER_FLAG',
    key,
    value,
  };
}
