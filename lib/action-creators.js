
exports.updateItem = (item) => {
  return {
    type: 'UPDATE_ITEM',
    item
  };
}

exports.removeItem = (id) => {
  return {
    type: 'REMOVE_ITEM',
    id
  };
}

exports.clearItems = () => {
  return {
    type: 'CLEAR_ITEMS',
  };
}

exports.openItem = ({originalUrl}) => {
  return {
    type: 'OPEN_ITEM',
    originalUrl
  };
}

exports.closeItem = () => {
  return {
    type: 'CLOSE_ITEM'
  };
}

exports.openMenu = () => {
  return {
    type: 'SET_SCENE',
    data: {
      type: 'menu'
    }
  };
}

exports.indicateScanning = (value) => {
  return {
    type: 'INDICATE_SCANNING',
    value
  };
}
