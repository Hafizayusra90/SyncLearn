// Server-side validation utilities for real email, name, and password policy
const dns = require('dns');

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
  'myemail', 'someone', 'asdfgh', 'asdfghjk', 'qwertyuiop', 'zxcvbnm', 'xyz',
  'demo', 'trash', 'junk', 'spam', 'student', 'instructor', 'teacher', 'check',
  'trial', 'hello', 'world', 'helloworld', 'aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff'
]);

const DUMMY_PREFIX_REGEX = /^(test|dummy|fake|asdf|sample|qwerty|temp|demo|faker|testing|trash|junk|user|student|instructor|teacher|admin|guest|random|anon|anonymous|someone|nobody|abc|xyz|example|trial|check)[0-9_.-]*$/i;
const DUMMY_CONTAINS_REGEX = /(fake|dummy|test|temp|sample|junk|trash|testing|faker|tester|nobody|noone|fakeemail|dummyemail|testemail|throwaway|disposable|notreal|fakemail)/i;
const INVALID_TLDS = new Set(['test', 'example', 'invalid', 'localhost', 'fake', 'dummy', 'sample', 'local']);

/**
 * Validates whether an email format and content is real and not a known dummy pattern
 */
const validateRealEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: "Email is required." };
  }
  const clean = email.trim().toLowerCase();

  // Basic structure check
  if (!clean.includes('@')) {
    return { isValid: false, message: "Email address doesn't exist. Missing '@' symbol." };
  }

  // Strictly block consecutive dots anywhere in the email (e.g. hafiza..1@gmail.com)
  if (clean.includes('..')) {
    return { isValid: false, message: "Email address doesn't exist. Consecutive dots (..) are not allowed." };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: "Email address doesn't exist. Invalid email structure." };
  }

  const [localPart, domain] = parts;

  // Username start / end checks
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot start or end with a dot." };
  }
  if (localPart.startsWith('-') || localPart.endsWith('-') || localPart.startsWith('_') || localPart.endsWith('_')) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot start or end with a symbol." };
  }
  if (/__|\-\-|\._|_\.|\.-|-\./.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Consecutive or mixed symbols are not allowed." };
  }

  // Domain structure checks
  if (!domain || !domain.includes('.')) {
    return { isValid: false, message: "Email address doesn't exist. Domain is invalid." };
  }
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) {
    return { isValid: false, message: "Email address doesn't exist. Domain cannot start or end with a symbol." };
  }

  // Disposable or fake domains blacklist
  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) {
    return { isValid: false, message: "Email address doesn't exist. Disposable or fake email domains are not allowed." };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld) || INVALID_TLDS.has(tld)) {
    return { isValid: false, message: "Email address doesn't exist. Invalid domain extension." };
  }

  // Provider-specific strict RFC validations
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Gmail usernames must be 6 to 30 characters
    if (localPart.length < 6 || localPart.length > 30) {
      return { isValid: false, message: "Email address doesn't exist. Gmail usernames must be between 6 and 30 characters." };
    }
    // Gmail only allows letters, numbers, and periods (NO underscores, hyphens, plus)
    if (/[^a-zA-Z0-9.]/.test(localPart)) {
      return { isValid: false, message: "Email address doesn't exist. Gmail only allows letters, numbers, and periods." };
    }
  }

  if (domain === 'yahoo.com' || domain === 'ymail.com') {
    if (localPart.length < 4 || localPart.length > 32) {
      return { isValid: false, message: "Email address doesn't exist. Yahoo usernames must be between 4 and 32 characters." };
    }
    if (!/^[a-zA-Z]/.test(localPart)) {
      return { isValid: false, message: "Email address doesn't exist. Yahoo usernames must start with a letter." };
    }
    if (/[^a-zA-Z0-9._]/.test(localPart)) {
      return { isValid: false, message: "Email address doesn't exist. Yahoo only allows letters, numbers, underscores, and periods." };
    }
  }

  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
    if (localPart.length < 3 || localPart.length > 64) {
      return { isValid: false, message: "Email address doesn't exist. Microsoft usernames must be between 3 and 64 characters." };
    }
  }

  // General minimum username length
  if (localPart.length < 3) {
    return { isValid: false, message: "Email address doesn't exist. Username is too short." };
  }

  // Reject dummy prefixes and blacklisted usernames
  const normalizedUser = localPart.replace(/[._-]/g, '');
  if (DUMMY_CONTAINS_REGEX.test(localPart) || DUMMY_USERNAMES.has(localPart) || DUMMY_USERNAMES.has(normalizedUser) || DUMMY_PREFIX_REGEX.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy emails are not allowed, please enter your real active email address." };
  }

  // Reject repeating single characters (e.g. aaaaa@, 11111@)
  if (/(.)\1{2,}/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Repeating characters are not allowed." };
  }

  // Reject username that is solely numeric digits
  if (/^\d+$/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot be only numbers." };
  }

  // Reject usernames starting with 3+ digits
  if (/^\d{3,}/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot start with numbers." };
  }

  // Reject keyboard mash patterns
  if (/^(asdf|qwer|zxcv|hjkl|poiuy|lkjh|mnbv)/i.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email address." };
  }

  // Reject dummy domain root (e.g. asdf123.com, testtest.com)
  const domainName = domainParts[0];
  if (DUMMY_USERNAMES.has(domainName) || DUMMY_PREFIX_REGEX.test(domainName)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy domain names are not allowed." };
  }

  return { isValid: true, message: "" };
};

const isValidRealEmail = (email) => {
  return validateRealEmail(email).isValid;
};

/**
 * Checks if the domain really has mail or DNS records, rejecting non-existent domains
 */
const checkEmailDomainExists = async (email) => {
  const syncCheck = validateRealEmail(email);
  if (!syncCheck.isValid) {
    return syncCheck;
  }

  const clean = email.trim().toLowerCase();
  const domain = clean.split('@')[1];

  try {
    const mxRecords = await Promise.race([
      dns.promises.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2500))
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, message: `Email address doesn't exist. Domain '@${domain}' does not have mail records.` };
    }
    return { isValid: true, message: "" };
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'EREFUSED') {
      try {
        const aRecords = await dns.promises.resolve4(domain);
        if (!aRecords || aRecords.length === 0) {
          return { isValid: false, message: `Email address doesn't exist. Domain '@${domain}' does not exist.` };
        }
        return { isValid: true, message: "" };
      } catch (aErr) {
        return { isValid: false, message: `Email address doesn't exist. Domain '@${domain}' does not exist.` };
      }
    }
    // In case of DNS timeout or network isolation, return valid from syncCheck
    return { isValid: true, message: "" };
  }
};

const isValidRealName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  if (clean.length < 2) return false;
  const regex = /^[a-zA-Z\s.'-]+$/;
  return regex.test(clean);
};

const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      missing: ['Password is required'],
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
    message: isValid
      ? 'Password meets all security policy requirements.'
      : `Password policy requirement missing: ${missing.join(', ')}.`
  };
};

module.exports = {
  validateRealEmail,
  isValidRealEmail,
  checkEmailDomainExists,
  isValidRealName,
  validatePasswordPolicy
};
