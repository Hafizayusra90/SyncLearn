// Server-side validation utilities for real email, name, and password policy

const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  'test.com', 'example.com', 'fake.com', 'dummy.com', 'sample.com',
  'tempmail.com', 'mailinator.com', 'none.com', 'asdf.com', 'xyz.com',
  'random.com', '123.com', 'abc.com', 'mail.test', 'demo.com'
]);

const isValidRealEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) return false;

  const [localPart, domain] = clean.split('@');
  if (!localPart || localPart.length < 2) return false;
  if (!domain || !domain.includes('.')) return false;

  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) return false;

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

  if (/^(.)\1{4,}$/.test(localPart)) return false;

  return true;
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
  isValidRealEmail,
  isValidRealName,
  validatePasswordPolicy
};
