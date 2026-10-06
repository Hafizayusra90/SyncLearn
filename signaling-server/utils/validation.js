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
  'myemail', 'someone', 'asdfgh', 'asdfghjk', 'qwertyuiop', 'zxcvbnm', 'xyz'
]);

const DUMMY_PREFIX_REGEX = /^(test|dummy|fake|asdf|sample|qwerty|temp|demo|faker|testing|trash)[0-9_.-]*$/i;
const INVALID_TLDS = new Set(['test', 'example', 'invalid', 'localhost', 'fake', 'dummy', 'sample', 'local']);

/**
 * Validates whether an email format and content is real and not a known dummy pattern
 */
const validateRealEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: "Email is required." };
  }
  const clean = email.trim().toLowerCase();

  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a valid email format." };
  }

  const [localPart, domain] = clean.split('@');
  if (!localPart || localPart.length < 2) {
    return { isValid: false, message: "Email address doesn't exist. Username is too short." };
  }
  if (!domain || !domain.includes('.')) {
    return { isValid: false, message: "Email address doesn't exist. Domain is invalid." };
  }

  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy or disposable emails are not allowed." };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld) || INVALID_TLDS.has(tld)) {
    return { isValid: false, message: "Email address doesn't exist. Invalid domain extension." };
  }

  if (DUMMY_USERNAMES.has(localPart) || DUMMY_PREFIX_REGEX.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Dummy emails are not allowed, please enter your real active email address." };
  }

  if (/^(.)\1{3,}$/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email." };
  }

  if (/^\d+$/.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Username cannot be only numbers." };
  }

  if (/^(asdfgh|qwertyui|zxcvbn)/i.test(localPart)) {
    return { isValid: false, message: "Email address doesn't exist. Please enter a real email address." };
  }

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
