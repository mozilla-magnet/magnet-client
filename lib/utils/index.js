
export function isNetworkError(err) {
  return err.name === 'NetworkError'
    || err.message === 'Network request failed'
    || err.code.indexOf('NoConnectionError') > -1;
}
