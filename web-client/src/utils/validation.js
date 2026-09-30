// Real-world validation utilities for Email, Name, and Password Policy

const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  'test.com', 'example.com', 'fake.com', 'dummy.com', 'sample.com',
  'tempmail.com', 'mailinator.com', 'none.com', 'asdf.com', 'xyz.com',
  'random.com', '123.com', 'abc.com', 'mail.test', 'demo.com'
]);

/**
 * Validates that an email is structurally valid, active-format, and not dummy/disposable.
 */
export const isValidRealEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  
  // RFC 5322 standard email structure
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) return false;

  const [localPart, domain] = clean.split('@');
  if (!localPart || localPart.length < 2) return false;
  if (!domain || !domain.includes('.')) return false;

  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) return false;

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  // TLD must be at least 2 letters
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

  // Reject dummy patterns like aaaaaa@ or 11111@
  if (/^(.)\1{4,}$/.test(localPart)) return false;

  return true;
};

/**
 * Validates that a name consists of real letters, minimum 2 characters.
 */
export const isValidRealName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  if (clean.length < 2) return false;
  // Allow letters, spaces, hyphens, and periods (e.g. "Prof. Kashish", "Ali Raza")
  const regex = /^[a-zA-Z\s.'-]+$/;
  return regex.test(clean);
};

/**
 * Password Policy Enforcement:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 numeric digit (0-9)
 * - At least 1 special character (!@#$%^&*...)
 */
export const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      missing: ['Password is required'],
      checks: { length: false, upper: false, lower: false, number: false, special: false },
      message: 'Password is required and must meet the security policy.'
    };
  }

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]`~]/.test(password)
  };

  const missing = [];
  if (!checks.length) missing.push('At least 8 characters');
  if (!checks.upper) missing.push('At least 1 uppercase letter (A-Z)');
  if (!checks.lower) missing.push('At least 1 lowercase letter (a-z)');
  if (!checks.number) missing.push('At least 1 number (0-9)');
  if (!checks.special) missing.push('At least 1 special character (e.g. @, #, $, !, %, &)');

  const isValid = missing.length === 0;

  return {
    isValid,
    missing,
    checks,
    message: isValid
      ? 'Password meets all security policy requirements.'
      : `Password policy requirement missing: ${missing.join(', ')}.`
  };
};
