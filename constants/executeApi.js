import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constant.js";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston", // Base URL for the execution API
});

export const executeCode = async ({ code, language, testCases }) => {
  const results = []; // To store results for each test case
  let passedTestCases = 0; // Counter for passed test cases
  let errorDetails = null;

  for (let testCase of testCases) {
    const input = testCase.input;
    const expectedOutput = testCase.output;

    try {
      const response = await API.post("/execute", {
        language: language,
        version: LANGUAGE_VERSIONS[language],
        files: [{ content: code }],
        stdin: input,
      });

      const { run } = response.data;
      const { output, stderr, code: execCode } = run;

      if (
        stderr?.trim() ||
        execCode !== 0 ||
        output?.trim() !== expectedOutput.trim()
      ) {
        results.push({
          input,
          expectedOutput,
          actualOutput: output?.trim(),
          errorMessage: stderr?.trim() || "Output mismatch",
          status: "fail",
        });
        errorDetails = stderr?.trim();
        break; // Stop further execution if a test case fails
      }

      // Test case passed
      passedTestCases++;
      results.push({
        input,
        expectedOutput,
        actualOutput: output?.trim(),
        errorMessage: null,
        status: "pass",
      });
    } catch (error) {
      console.log("Execution error:", error);
      results.push({
        input,
        expectedOutput,
        actualOutput: null,
        errorMessage: "Execution failed ",
        status: "fail",
      });
      break; // Stop further execution on API request failure
    }
  }

  return {
    totalTestCases: testCases.length,
    passedTestCases,
    errorDetails,
    results,
  };
};
