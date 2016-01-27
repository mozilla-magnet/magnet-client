
/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[metadata]') : function() {};


var endpoint = 'http://10.246.27.23:3030'; // endpoint of metadata service



module.exports = function(url) {
  return request({ objects: [{ url: url }]});
};

function request(body) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var data = JSON.stringify(body);

    xhr.open('POST', endpoint + '/api/v1/metadata', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onerror = reject;
    xhr.onload = function() {
      debug('response');
      resolve(JSON.parse(xhr.responseText)[0]);
    };

    xhr.send(data);
    debug('request sent', body);
  });
}
