/**
 * Strict and intelligent name verification for AICE membership matching.
 * Compares an entered name against the member's registered full name in the database.
 */
export function verifyMemberName(
  inputName: string | undefined | null,
  dbFullName: string | undefined | null,
): { matches: boolean; error?: string } {
  if (!inputName || typeof inputName !== "string" || !inputName.trim()) {
    return { matches: false, error: "Please enter your registered name." };
  }
  if (!dbFullName || typeof dbFullName !== "string" || !dbFullName.trim()) {
    return {
      matches: false,
      error: "Registered member name not found in records. Please contact support.",
    };
  }

  // Normalize: lower-case, replace dots/hyphens/underscores with spaces, remove non-alphanumeric, collapse whitespace
  const normInput = inputName
    .toLowerCase()
    .replace(/[._\-]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const normDb = dbFullName
    .toLowerCase()
    .replace(/[._\-]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Reject anything less than 3 characters (e.g. single letters "I", "S", "A" are always rejected)
  if (normInput.length < 3) {
    return {
      matches: false,
      error: "Please enter your full registered name (at least 3 characters). Single letters like 'I' are not accepted.",
    };
  }
  if (normDb.length < 3) {
    return {
      matches: false,
      error: "Registered member name is invalid.",
    };
  }

  // 1. Exact match after normalization
  if (normInput === normDb) {
    return { matches: true };
  }

  const inputWords = normInput.split(" ").filter(Boolean);
  const dbWords = normDb.split(" ").filter(Boolean);

  // Significant words (length >= 3)
  const inputMajor = inputWords.filter((w) => w.length >= 3);
  const dbMajor = dbWords.filter((w) => w.length >= 3);

  // Must have at least one significant word (length >= 3) in input
  if (inputMajor.length === 0) {
    return {
      matches: false,
      error: "Please enter your full name, not only initials.",
    };
  }

  // The member's primary first name or any major name from DB must match
  const primaryDbName = dbMajor[0];
  const hasMajorMatch =
    (primaryDbName && inputMajor.includes(primaryDbName)) ||
    inputMajor.some((iw) => dbMajor.includes(iw));

  if (!hasMajorMatch) {
    return {
      matches: false,
      error:
        "The name you entered does not match the name associated with this Membership ID.",
    };
  }

  // Strict validation: Every word in the input MUST match a word in the registered member name!
  // No foreign / unknown words allowed (prevents "Random Fake Name" or "Ganga Sharma" matching "Ganga S")
  for (const iw of inputWords) {
    const isDirectMatch = dbWords.includes(iw);
    const isDbInitialMatch = dbWords.some((dw) => dw.length <= 2 && dw === iw);

    if (!isDirectMatch && !isDbInitialMatch) {
      return {
        matches: false,
        error:
          "The name you entered does not match the name associated with this Membership ID.",
      };
    }
  }

  return { matches: true };
}
