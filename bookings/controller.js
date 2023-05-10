const { ServerError } = require("../error")
const { readFile, writeFile } = require("../file")
const { generateNextId } = require("../utils")

exports.createBooking = async (req, res, data) => {
  const email = req.tokenData.email

  // TODO: add regx for date checking
  if (!/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(req.body.date)) {
    throw new ServerError(400, "invalid booking date supplied")
  }

  const dbData = await readFile();

  // checking for available date
  for (let i = 0; i < dbData.bookings.length; i++) {
    if (dbData.bookings[i].date === req.body.date) {
      throw new ServerError(404, "booking date is not available")
    }
  }

  const bookedItems = []
  for (let i = 0; i < dbData.assets.length; i++) {
    if (req.body.items.includes(dbData.assets[i].id)) {
      bookedItems.push(dbData.assets[i])
    }
  }

  const nextId = generateNextId(dbData.bookings)

  const booking = {
    id: nextId,
    email,
    date: req.body.date,
    bookedItems
  }
  dbData.bookings.push(booking)

  await writeFile(dbData)

  res.end(JSON.stringify(booking))
}