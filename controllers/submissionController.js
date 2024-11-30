import { executeCode } from "../constants/executeApi.js";
import ChallengeProgress from "../models/challengeProgressModel.js";
import Question from "../models/questionModel.js";
import Submission from "../models/submissionModel.js";
import TestCase from "../models/testCaseModel.js";

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private
// Submit a solution
// Execute code against private test cases
export const submitSolution = async (req, res) => {
  try {
    const { challenge, question, code, language } = req.body;
    const user = req.user._id;

    // Validate required fields
    if (!challenge || !question || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the user has already passed all test cases for this question
    const existingSubmission = await Submission.findOne({
      user,
      challenge,
      question,
      status: "pass",
    });

    // Fetch the question data
    const questionData = await Question.findById({ _id: question });

    // Fetch the test cases for the question
    const testCases = await TestCase.find({ question });
    if (!testCases.length) {
      return res.status(404).json({
        success: false,
        message: "No test cases found for this question",
      });
    }

    let testCaseResults = [];
    let allPassed = true;

    // Execute code against the  test cases
    if (testCases && testCases.length > 0) {
      allPassed = await executeCode({
        code,
        language,
        testCases, // Pass the  test cases for execution
      });
    }

    // Determine status based on test case results
    const status = allPassed ? "pass" : "fail";

    // Create a new submission record in the database
    const submission = await Submission.create({
      user,
      challenge,
      question,
      code,
      language,
      status,
      score: existingSubmission
        ? "Already earned"
        : allPassed
        ? questionData.maxScore
        : 0,
    });

    // If all test cases pass, update the user's progress (if not already passed)
    if (allPassed && !existingSubmission) {
      const progress = await ChallengeProgress.findOneAndUpdate(
        { user, challenge },
        {
          $addToSet: { solvedQuestions: question },
          $set: { lastUpdated: new Date() },
          $inc: { score: questionData.maxScore }, // Increment score by the question's max score
        },
        { upsert: true, new: true }
      );
    }

    // Prepare response
    const response = {
      success: true,
      message: allPassed
        ? "Solution submitted successfully. All test cases passed."
        : "Solution submitted. Some test cases failed.",
      status,
      submission,
      testCaseResults, // Include detailed results for each test case
    };

    // Send response
    res.status(allPassed ? 201 : 400).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error submitting solution",
      error: error.message,
    });
  }
};

// @desc    Get submissions for a specific challenge and question by a user
// @route   GET /api/submissions/challenge/:challengeId/question/:questionId/user/:userId
// @access  Private
export const getChallengeQuestionSubmissionsByUser = async (req, res) => {
  try {
    const { challengeId, questionId } = req.params;
    const userId = req.user._id;

    // Fetch submissions matching the challenge, question, and user
    const submissions = await Submission.find({
      challenge: challengeId,
      question: questionId,
      user: userId,
    })
      .populate("challenge", "title")
      .populate("question", "title")
      .populate("user", "username")
      .sort({ submittedAt: -1 }); // Sorting by latest submission

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message:
          "No submissions yet for this challenge or question. Stay tuned!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching submissions for user, challenge, and question",
      error: error.message,
    });
  }
};

// @desc    Get submissions by user
// @route   GET /api/submissions/user/:userId
// @access  Private
export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const submissions = await Submission.find({ user: userId })
      .populate("challenge", "title")
      .populate("question", "title")
      .populate("user", "username");

    res.status(200).json({
      success: true,
      message: "User submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user submissions",
      error: error.message,
    });
  }
};

// @desc    Delete a submission
// @route   DELETE /api/submissions/:id
// @access  Private (Admin only)
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    await submission.remove();
    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting submission",
      error: error.message,
    });
  }
};
