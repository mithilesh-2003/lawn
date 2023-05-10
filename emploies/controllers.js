const { ServerError } = require("../error")
const { readFile, writeFile } = require("../file")
const { hashPassword, verifyPassword, generateToken } = require("../utils")

exports.employeeLogin = async (req, res, data) => {
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
  const employeeData = dbData.emploies[req.body.email]
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin')
  }

  // verify password
  if (! await verifyPassword(req.body.password, employeeData.password)) {
    throw new ServerError(404, 'password is wrong')
  }

  // generate JWT token
  const token = generateToken({
    email: req.body.email,
    role: employeeData.role,
    iat: Date.now()
  })

  res.end(JSON.stringify({ message: "login successful", token }))
}

exports.employeeSignup = async (req, res, data) => {
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
  if (dbData.emploies[req.body.email]) {
    throw new ServerError(403, 'already registred, use another email to signup')
  }
  const hashedPassword = await hashPassword(req.body.password)
  dbData.emploies[req.body.email] = {
    name: req.body.name,
    password: hashedPassword,
    role: "m2"
  }
  await writeFile(dbData)
  res.end(JSON.stringify({ message: "signup successful" }))
}

exports.myProfile = async (req, res, data) => {
  // find user
  const dbData = await readFile()
  const employeeData = dbData.emploies[req.tokenData.email]
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin')
  }

  delete employeeData.password

  res.end(JSON.stringify(employeeData))
}

exports.updateMyProfile = async (req, res, data) => {
  // validation
  if (req.body.address && (req.body.address.length < 4 || req.body.address.length > 200)) {
    throw new ServerError(400, 'supplied adress has invalid length')
  }
  if (req.body.name && (req.body.name.length < 2 || req.body.name.length > 50)) {
    throw new ServerError(400, 'supplied name has invalid length')
  }
  if (req.body.phone && (typeof req.body.phone === 'string' || req.body.phone < 5000000000 || req.body.phone > 9999999999)) {
    throw new ServerError(400, 'supplied phone is invalid')
  }
  if (req.body.altPhone && (typeof req.body.altPhone === 'string' || req.body.altPhone < 5000000000 || req.body.altPhone > 9999999999)) {
    throw new ServerError(400, 'supplied alternate phone is invalid')
  }

  // find user
  const dbData = await readFile()
  const employeeData = dbData.emploies[req.tokenData.email]
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin')
  }

  // delete req.body.role
  // delete req.body.password
  // delete req.body.email
  // employeeData = { ...employeeData, ...req.body }
  // dbData.emploies[req.tokenData.email] = employeeData

  employeeData.address = req.body.address ? req.body.address : employeeData.address
  employeeData.name = req.body.name ? req.body.name : employeeData.name
  employeeData.phone = req.body.phone ? req.body.phone : employeeData.phone
  employeeData.altPhone = req.body.altPhone ? req.body.altPhone : employeeData.altPhone

  await writeFile(dbData)

  delete employeeData.password
  res.end(JSON.stringify(employeeData))
}

exports.employeeProfile = async (req, res, data) => {
  const dbData = await readFile()
  const employeeData = dbData.emploies[req.body.email]
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin')
  }

  delete employeeData.password

  res.end(JSON.stringify(employeeData))
}

exports.updateEmployeeProfile = async (req, res, data) => {
  // validation
  if (req.body.address && (req.body.address.length < 4 || req.body.address.length > 200)) {
    throw new ServerError(400, 'supplied adress has invalid length')
  }
  if (req.body.name && (req.body.name.length < 2 || req.body.name.length > 50)) {
    throw new ServerError(400, 'supplied name has invalid length')
  }
  if (req.body.phone && (typeof req.body.phone === 'string' || req.body.phone < 5000000000 || req.body.phone > 9999999999)) {
    throw new ServerError(400, 'supplied phone is invalid')
  }
  if (req.body.altPhone && (typeof req.body.altPhone === 'string' || req.body.altPhone < 5000000000 || req.body.altPhone > 9999999999)) {
    throw new ServerError(400, 'supplied alternate phone is invalid')
  }

  // find user
  const dbData = await readFile()
  const employeeData = dbData.emploies[req.body.email]
  if (!employeeData) {
    throw new ServerError(404, 'email not found, contact your admin')
  }

  // delete req.body.role
  // delete req.body.password
  // delete req.body.email
  // employeeData = { ...employeeData, ...req.body }
  // dbData.emploies[req.tokenData.email] = employeeData

  employeeData.address = req.body.address ? req.body.address : employeeData.address
  employeeData.name = req.body.name ? req.body.name : employeeData.name
  employeeData.phone = req.body.phone ? req.body.phone : employeeData.phone
  employeeData.altPhone = req.body.altPhone ? req.body.altPhone : employeeData.altPhone

  await writeFile(dbData)

  delete employeeData.password
  res.end(JSON.stringify(employeeData))
}