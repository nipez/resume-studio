export class AIQuotaExceededError extends Error {
  readonly code = "quota_exceeded" as const;

  constructor(
    message = "You've reached your monthly AI limit. It resets on the 1st of each month."
  ) {
    super(message);
    this.name = "AIQuotaExceededError";
  }
}

export class AIFeatureNotAvailableError extends Error {
  readonly code = "plan_required" as const;

  constructor(
    message = "This AI feature is not included in your plan."
  ) {
    super(message);
    this.name = "AIFeatureNotAvailableError";
  }
}
