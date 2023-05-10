exports.run = async (fnArray, req, res) => {
  if (!Array.isArray(fnArray)) {
    throw new Error('fn arr is not array');
  }
  let data = {};
  for (let i = 0; i < fnArray.length; i++) {
    data.next = false
    data = await fnArray[i](req, res, data);
    if (data && data?.next) {
      continue;
    }
    break;
  }
  return data;
};
