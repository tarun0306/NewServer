const Tag = require("../models/tags");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields need to be filled",
      });
    }
    //create entry in DB
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: "TAG HAS BEEN CREATED",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//getAllTags
exports.showAlltags = async (req, res) => {
  try {
    const name = res.body;
    const tags = await Tag.find({}, { name: true, description: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
