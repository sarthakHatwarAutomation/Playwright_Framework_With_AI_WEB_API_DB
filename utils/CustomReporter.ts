import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class CustomReporter implements Reporter {
  private completedTests = 0;
  private failedTests = 0;

  onTestEnd(_test: TestCase, result: TestResult): void {
    this.completedTests += 1;
    if (result.status !== "passed" && result.status !== "skipped") {
      this.failedTests += 1;
    }
  }

  onEnd(result: FullResult): void {
    console.log(
      `Custom report: ${this.completedTests} tests completed, ${this.failedTests} failed. Run status: ${result.status}.`,
    );
  }
}
