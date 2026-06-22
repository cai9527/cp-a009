export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  strengthScore: number;
  checks: {
    length: boolean;
    hasLowerCase: boolean;
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    varietyCount: boolean;
  };
}

export const PASSWORD_MIN_LENGTH = 8;
export const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password);
  
  const length = password.length >= PASSWORD_MIN_LENGTH;
  
  const varietyTypes = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const varietyCount = varietyTypes >= 2;

  if (!password) {
    errors.push('请输入密码');
  } else {
    if (!length) {
      errors.push(`密码长度至少${PASSWORD_MIN_LENGTH}位`);
    }
    if (!varietyCount) {
      errors.push('密码需包含大小写字母、数字、特殊符号中的至少两种');
    }
  }

  let strengthScore = 0;
  if (length) strengthScore += 1;
  if (hasLowerCase) strengthScore += 1;
  if (hasUpperCase) strengthScore += 1;
  if (hasNumber) strengthScore += 1;
  if (hasSpecialChar) strengthScore += 1;
  if (password.length >= 12) strengthScore += 1;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 5) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthScore,
    checks: {
      length,
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      varietyCount
    }
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return '请再次输入密码';
  }
  if (password !== confirmPassword) {
    return '两次输入的密码不一致';
  }
  return null;
};
