const { scrypt, randomBytes, createHmac } = require('crypto');

const ServerSecretKey = 'osiduvgbksdfcvkhjsfgyisdfvhakfuvhjdfbSDASGvcdTWCsjkdvbagbJWEHRBAJKRGBAEJHBGAUKGBAKUJFGBAEKBAEKGRBAERDFKVAHAGKFJBHDG'
const tokenExpiry = 3600000

exports.generateNextId = (data) => {
  if (!Array.isArray(data) || !data.length) {
    return 1;
  }
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    if (max < data[i].id) {
      max = data[i].id;
    }
  }
  return max + 1;
};

const passowrdHashLength = 90
const hashIter = 1024

exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    randomBytes(30, (err, buf) => {
      if (err) throw reject(err);
      const salt = buf.toString('base64')
      scrypt(password, salt, passowrdHashLength, { N: hashIter }, (err, derivedKey) => {
        if (err) throw reject(err);
        resolve(`${salt}.${derivedKey.toString('base64')}`)
      });
    });
  })
}

exports.verifyPassword = (password, hashPassword) => {
  return new Promise((resolve, reject) => {
    const [salt, hash] = hashPassword.split('.')
    scrypt(password, salt, passowrdHashLength, { N: hashIter }, (err, derivedKey) => {
      if (err) throw reject(err);
      resolve(derivedKey.toString('base64') === hash)
    });
  })
}

exports.generateToken = (data) => {
  const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');
  const sign = createHmac('sha512', ServerSecretKey).update(base64Data).digest("base64");
  return `${base64Data}.${sign}`
}

exports.verifyToken = (token) => {
  // getting data and sign from old token
  const [dataBase64, sign] = token.split(".")
  // generate new sign from data
  const newSign = createHmac('sha512', ServerSecretKey).update(dataBase64).digest("base64");
  // match old and new sign
  if (newSign !== sign) {
    throw new Error("token malformed")
  }
  // check token exipry
  // 1. convert base64 to utf8 string
  const strData = Buffer.from(dataBase64, 'base64').toString()
  // 2. convert string to object
  const data = JSON.parse(strData)
  // 3. get iat value 
  // 3. iat+expiry > current time ->  success
  if (data.iat + tokenExpiry < Date.now()) {
    throw new Error("token expired")
  }

  return data
}