const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnail
    const thumbnail = req.file.thumbnailImage;

    //Validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "Need all the details to be filled",
      });
    }

    //check for instructor
    const userId = req.user.id;
    const instructorDeatils = await User.findById(userId);
    console.log(instructorDeatils);

    if (!instructorDeatils) {
      return res.status(400).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    //check if Tag
    const tagDetails = Tag.findById(tag);
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag details not found",
      });
    }

    //Upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    //create an enty for the new course

    const newCourse = await course.create({
      courseName,
      courseDescription,
      instructor: instructorDeatils._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });
    //add new course to the user schema
    await User.findByIdAndUpdate(
      { _id: instructorDeatils._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    //update tag schema
    await Tag.findByIdAndUpdate(
      {
        tag,
      },
      {
        $push: {
          tag: tagDetails._id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      message: "Created ",
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .populate("Instructor")
      .exec();
    return res.status(200).json({
      success: True,
      message: "All the coursee",
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course data",
    });
  }
};
