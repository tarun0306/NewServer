const mongoose = require("mongoose");
const subSectioneSchema = new mongoose.Schema({
  titles: {
    type: String,
  },

  timeDuration: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
});

module.exports = mongoose.model("SubSectioneSchema", subSectioneSchema);
