const { ServerError } = require('./error');
const { run } = require('./runner');

// TODO: query matcher not implemented
exports.urlMatcher = (matchUrl, method, ...controllers) => {
  return async (req, res, data) => {
    if (matchUrl === '*' || method === '*') {
      throw new ServerError(404, 'route not found')
    }

    if (req.method !== method) {
      return { ...data, next: true };
    }
    const reqUrl = req.url.split('/');
    const url = matchUrl.split('/');
    if (reqUrl.length !== url.length) {
      return { ...data, next: true };
    }
    let isMatched = true;
    const params = {};
    for (let i = 0; i < url.length; i++) {
      const x = url[i];
      const y = reqUrl[i];
      if (!x.includes(':')) {
        if (x !== y) {
          isMatched = false;
          break;
        }
      } else {
        const z = x.split(':')[1];
        params[z] = y;
      }
    }
    if (!isMatched) {
      return { ...data, next: true, };
    }
    req.params = params;
    return await run(controllers, req, res);
  };
};
