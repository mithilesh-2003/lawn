exports.bodyPraser = (req, res, data) => {
  let body = '';
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('body parser timeout'));
    }, 2000);
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function (data) {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
      } finally {
        resolve({ next: true });
      }
    });
  });
};
