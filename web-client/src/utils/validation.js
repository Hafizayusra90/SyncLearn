// Real-world validation utilities for Email, Name, and Password Policy

const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  'test.com', 'example.com', 'fake.com', 'dummy.com', 'sample.com',
  'tempmail.com', 'mailinator.com', 'none.com', 'asdf.com', 'xyz.com',
  'random.com', '123.com', 'abc.com', 'mail.test', 'demo.com',
  'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 'dispostable.com',
  'getairmail.com', 'yopmail.com', '10minutemail.com', 'dropmail.me',
  'mohmal.com', 'burnermail.io', 'fakeinbox.com', 'emailfake.com',
  'crazymailing.com', 'inboxkitten.com', 'mytemp.email', 'temp-mail.org',
  'throwawaymail.com', 'maildrop.cc', 'fakemailgenerator.com', 'nada.ltd',
  'getnada.com', 'inboxalias.com', 'mytempemail.com', 'generator.email',
  'tempmailo.com', 'emailondeck.com', 'temp-mail.io', 'zillamail.com',
  'trashmail.net', 'fakemail.net', 'fake-box.com', 'disposablemail.com'
]);

const DUMMY_USERNAMES = new Set([
  'test', 'dummy', 'fake', 'asdf', 'qwerty', '123', '1234', '12345', '123456',
  'abc', 'abcd', 'sample', 'none', 'nobody', 'noone', 'null', 'temp',
  'anonymous', 'anon', 'random', 'foo', 'bar', 'foobar', 'admin', 'user',
  'guest', 'testing', 'faker', 'tester', 'fakeemail', 'dummyemail', 'testemail',
  'myemail', 'someone', 'asdfgh', 'asdfghjk', 'qwertyuiop', 'zxcvbnm', 'xyz'
]);

const DUMMY_PREFIX_REGEX = /^(test|dummy|fake|asdf|sample|qwerty|temp|demo|faker|testing|trash)[0-9_.-]*$/i;
const INVALID_TLDS = new Set(['test', 'example', 'invalid', 'localhost', 'fake', 'dummy', 'sample', 'local']);

/**
 * Validates that an email is structurally valid, active-format, and does not belong to fake/dummy patterns.
 * Returns { isValid: boolean, message: string }
 */
export const validateRealEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: "Email is required." };
  }
  const clean = email.trim().toLowerCase();

  // RFC 5322 standard email structure
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) {
    return { isValid: false, message: "Invalid email format. Please enter a real email." };
  }

  const [localPart, domain] = clean.split('@');
  if (!localPart || localPart.length < 2) {
    return { isValid: false, message: "Email username is too short." };
  }
  if (!domain || !domain.includes('.')) {
    return { isValid: false, message: "Email domain doesn't exist." };
  }

  // Reject known disposable or fake domains
  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy or temporary domains are not allowed." };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld) || INVALID_TLDS.has(tld)) {
    return { isValid: false, message: "Email domain doesn't exist or has an invalid extension." };
  }

  // Reject dummy prefixes / usernames
  if (DUMMY_USERNAMES.has(localPart) || DUMMY_PREFIX_REGEX.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy emails are not allowed, please enter your real active email address." };
  }

  // Reject repeating single characters (e.g. aaaaa@, 11111@)
  if (/^(.)\1{3,}$/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email address." };
  }

  // Reject username that is solely numeric digits
  if (/^\d+$/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot be only numbers." };
  }

  // Reject keyboard mash patterns
  if (/^(asdfgh|qwertyui|zxcvbn)/i.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email address." };
  }

  // Reject dummy domain root (e.g. asdf123.com, testtest.com)
  const domainName = domainParts[0];
  if (DUMMY_USERNAMES.has(domainName) || DUMMY_PREFIX_REGEX.test(domainName)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email address." };
  }

  return { isValid: true, message: "" };
};

/**
 * Boolean wrapper for isValidRealEmail
 */
export const isValidRealEmail = (email) => {
  return validateRealEmail(email).isValid;
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
