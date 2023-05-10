exports.cors = (req, res, data) => {
  res.setHeader('Content-Type', 'application/json',);

  res.setHeader('Access-Control-Allow-Origin', '*',);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Mode,access-control-allow-origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    return res.end()
  }

  return { next: true }
};
