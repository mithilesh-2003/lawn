const { ServerError } = require("../error")
const { readFile, writeFile } = require("../file")
const { generateNextId } = require("../utils")

exports.createCategory = async (req, res, data) => {
  if (!req.body.name || req.body.name.length < 3 || req.body.name.length > 20) {
    throw new ServerError(400, "invalid category name")
  }
  const dbData = await readFile()
  const allCategories = dbData["categories"]

  // check duplicate category
  for (let i = 0; allCategories.length > i; i++) {
    if (allCategories[i].name.toLowerCase() === req.body.name.toLowerCase()) {
      throw new ServerError(400, "category already exists")
    }
  }

  let cid = undefined
  // check category id (cid) validity
  if (req.body.cid) {
    let isMatched = 0
    for (let i = 0; allCategories.length > i; i++) {
      if (allCategories[i].id === req.body.cid) {
        isMatched++
      }
    }
    if (isMatched === 1) {
      cid = req.body.cid
    } else {
      throw new ServerError(404, "category is not found")
    }
  }

  const newId = generateNextId(allCategories)

  if (cid) {
    allCategories.push({ id: newId, name: req.body.name, cid })
  } else {
    allCategories.push({ id: newId, name: req.body.name })
  }

  await writeFile(dbData)

  res.end(JSON.stringify({ categoryId: newId }))
}

exports.getCategories = async (req, res, data) => {
  const dbData = await readFile()

  if (!dbData.categories.length) {
    throw new ServerError(404, "categories not found")
  }
  res.end(JSON.stringify({ categories: dbData.categories }))
}

exports.updateCategory = async (req, res, data) => {
  const intId = parseInt(req.params.id)
  if (isNaN(intId)) {
    throw new ServerError(400, "invalid category id supplied")
  }

  if (!req.body.name) {
    throw new ServerError(400, "name not supplied")
  }

  const dbdata = await readFile()

  // check duplicate category name
  let i = 0
  for (i = 0; dbdata.categories.length > i; i++) {
    if (dbdata.categories[i].name.toLowerCase() === req.body.name.toLowerCase()) {
      throw new ServerError(400, "category already exists")
    }
  }

  let isUpdated = false
  for (i = 0; i < dbdata.categories.length; i++) {
    if (dbdata.categories[i].id === intId) {
      dbdata.categories[i].name = req.body.name
      isUpdated = true
      break
    }
  }

  if (!isUpdated) {
    throw new ServerError(404, "category id not found")
  }

  await writeFile(dbdata)

  res.end(JSON.stringify({ ...dbdata.categories[i] }))

  // exports.deleteCategories = async (req, res, data) => {
  //   const dbData = await readFile()
  
  //   if (!dbData.categories.length) {
  //     throw new ServerError(404, "categories not found")
  //   }
  
  //   res.end(JSON.stringify({ categories: dbData.categories }))
  // }
}