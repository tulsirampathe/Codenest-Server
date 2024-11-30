
import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constant.js";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston", // Base URL for the execution API
});

export const executeCode = async ({ code, language, testCases }) => {
  let allPassed = true; // Localized variable to track test case success

  // Loop through all the test cases and execute the code for each one
  for (let testCase of testCases) {
    const input = testCase.input; // Test case input
    const expectedOutput = testCase.output; // Expected output for the test case

    try {
      const response = await API.post("/execute", {
        language: language,
        version: LANGUAGE_VERSIONS[language], // Use the correct language version
        files: [
          {
            content: code, // Send the code for execution
          },
        ],
        stdin: input, // Provide input to the code
      });

      const { run } = response.data;
      const { output, stderr, code: execCode } = run;

      // If there's an error or the output doesn't match the expected output, fail the test case
      if (
        stderr?.trim() ||
        execCode !== 0 ||
        output?.trim() !== expectedOutput.trim()
      ) {
        allPassed = false;
        break; // Stop further execution if any test case fails
      }
    } catch (error) {
      console.error("Execution failed:", error);
      allPassed = false;
      break; // Stop further execution if an error occurs during the request
    }
  }
  
  return allPassed; // Return the status indicating if all test cases passed

};
