import {
  generateCodeVerifier,
  generateCodeChallengeFromVerifier,
} from './index';

describe('Generating code verifier and challenge', () => {
  it('should generate a valid code verifier', () => {
    const codeVerifier = generateCodeVerifier();

    //Code verifier should have a length between 43 and 128 characters
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier.length).toBeLessThanOrEqual(128);
  });

  it('should generate a valid code challenge from on a code verifier', () => {
    const codeVerifier =
      'gJ5HQVMPHuHYqPyYsJciAHll4ZZ4XqOgWKpi6I9mDZ8v9n9q1RdsPiagLdoOFnJcZLDAXBgdV7LICtgotQibiMGkgz5kc2Hud5A5fcxRUtffycBFDY7Q7ecA1zwtLWUT';
    const codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

    expect(codeChallenge).toStrictEqual(
      'XUpkYBbuU55zpezRyX8LPziycl0eSGljWDuSYNZW7uU'
    );
  });
});
