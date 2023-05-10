const { readFile, writeFile } = require("../file")
const { ServerError } = require("../error");
const { hashPassword, verifyPassword, generateToken } = require("../utils")

exports.userSignup = async (req, res, data) => {
  if (!req.body.email) {
    throw new ServerError(400, 'email not supplied')
  }
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))) {
    throw new ServerError(400, 'invalid email')
  }
  if (!req.body.password) {
    throw new ServerError(400, 'password not supplied')
  }
  if (req.body.password.length < 6) {
    throw new ServerError(400, 'password is less than 6 character')
  }
  if (!req.body.name) {
    throw new ServerError(400, 'name not supplied')
  }
  if (req.body.name.length < 2) {
    throw new ServerError(400, 'name is less than 2 character')
  }
  const dbData = await readFile()
  if (dbData.users[req.body.email]) {
    throw new ServerError(403, 'already registred, use another email to signup')
  }
  const hashedPassword = await hashPassword(req.body.password)
  dbData.users[req.body.email] = {
    name: req.body.name,
    password: hashedPassword
  }
  await writeFile(dbData)
  res.end(JSON.stringify({ message: "signup successful" }))
}

exports.userLogin = async (req, res, data) => {
  if (!req.body.email) {
    throw new ServerError(400, 'email not supplied')
  }
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))) {
    throw new ServerError(400, 'invalid email')
  }
  if (!req.body.password) {
    throw new ServerError(400, 'password not supplied')
  }
  if (req.body.password.length < 6) {
    throw new ServerError(400, 'password is less than 6 character')
  }

  // find user
  const dbData = await readFile()
  const userData = dbData.users[req.body.email]
  if (!userData) {
    throw new ServerError(404, 'email not found, signup first')
  }

  // verify password
  if (!await verifyPassword(req.body.password, userData.password)) {
    throw new ServerError(404, 'password is wrong')
  }

  // generate JWT token
  const token = generateToken({
    email: req.body.email,
    iat: Date.now()
  })

  res.end(JSON.stringify({ message: "login successful", token }))
}

exports.userProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error("something went wrong")
  }

  // find user
  const dbData = await readFile()
  const userData = dbData.users[req.tokenData.email]
  if (!userData) {
    throw new ServerError(404, 'user not found')
  }
  delete userData.password
  res.end(JSON.stringify(userData))
}

exports.userUpdateProfile = async (req, res, data) => {
  if (!req.tokenData.email) {
    throw new Error("something went wrong")
  }

  // find user
  const dbData = await readFile()
  const userData = dbData.users[req.tokenData.email]
  if (!userData) {
    throw new ServerError(404, 'user not found')
  }

  userData.name = req.body.name
  userData.phone = req.body.phone
  userData.alternatePhone = req.body.alternatePhone
  userData.address = req.body.address

  await writeFile(dbData)

  delete userData.password
  res.end(JSON.stringify(userData))
}