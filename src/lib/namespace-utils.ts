/**
 * Client-side identifier suggestion algorithm for namespace creation.
 *
 * Runs entirely in the browser — no API call needed, zero latency for the user.
 *
 * Algorithm:
 * 1. Strip spaces and special characters from the name
 * 2. Extract the first letter plus significant consonants (skip vowels after position 1)
 * 3. Uppercase everything, take the first 5 characters
 * 4. If fewer than 5 characters remain, pad with digits (1, 2, ...)
 * 5. If the suggested identifier is taken, increment the last digit and try again
 */

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

/**
 * Suggest a 5-character identifier from a namespace name.
 * Returns an uppercase alphanumeric string of exactly 5 characters.
 */
export function suggestIdentifier(name: string): string {
  // Strip non-alphanumeric characters and uppercase
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (cleaned.length === 0) {
    // Fallback: random 5-char alphanumeric code
    return generateRandomIdentifier();
  }

  // Extract first letter + significant consonants
  const chars: string[] = [];

  for (let i = 0; i < cleaned.length && chars.length < 5; i++) {
    const ch = cleaned[i];
    if (i === 0) {
      // Always include the first character
      chars.push(ch);
    } else if (!VOWELS.has(ch)) {
      // Include consonants and digits after position 0
      chars.push(ch);
    }
  }

  // If we still don't have 5 chars, also take vowels
  if (chars.length < 5) {
    for (let i = 1; i < cleaned.length && chars.length < 5; i++) {
      const ch = cleaned[i];
      if (VOWELS.has(ch) && !chars.includes(ch + String(i))) {
        // Only add vowels we haven't already captured
        if (!chars.includes(ch) || chars.length < 3) {
          chars.push(ch);
        }
      }
    }
  }

  // Deduplicate and rebuild from the cleaned string if needed
  if (chars.length < 5) {
    // Just take first N characters from cleaned string, then pad
    const base = cleaned.slice(0, Math.min(cleaned.length, 5));
    return padIdentifier(base);
  }

  return chars.slice(0, 5).join("");
}

/**
 * Pad an identifier to exactly 5 characters using trailing digits.
 * e.g. "ABC" -> "ABC01"
 */
function padIdentifier(base: string): string {
  let result = base.slice(0, 5);
  let digit = 0;
  while (result.length < 5) {
    result += String(digit);
    digit = (digit + 1) % 10;
  }
  return result;
}

/**
 * Generate a random 5-character identifier (A-Z, 0-9).
 * Used as a fallback when the name contains only special characters.
 */
function generateRandomIdentifier(): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

/**
 * Given a taken identifier, produce the next alternative suggestion
 * by incrementing the last character (digit or letter).
 */
export function nextIdentifierAlternative(identifier: string): string {
  if (identifier.length !== 5) return generateRandomIdentifier();

  const chars = identifier.split("");
  // Try incrementing the last character
  const lastChar = chars[4];

  if (/[0-9]/.test(lastChar)) {
    // Increment digit, wrap around to A if at 9
    if (lastChar === "9") {
      chars[4] = "A";
    } else {
      chars[4] = String(Number(lastChar) + 1);
    }
  } else if (/[A-Y]/.test(lastChar)) {
    // Increment letter
    chars[4] = String.fromCharCode(lastChar.charCodeAt(0) + 1);
  } else {
    // Z -> 0
    chars[4] = "0";
  }

  return chars.join("");
}

/**
 * Validate an identifier format: exactly 5 uppercase letters or digits.
 */
export function isValidIdentifierFormat(value: string): boolean {
  return /^[A-Z0-9]{5}$/.test(value);
}
