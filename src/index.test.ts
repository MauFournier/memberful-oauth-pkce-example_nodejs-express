import {
  generateCodeVerifier,
  generateCodeChallengeFromVerifier,
  generateCodeVerifierAndChallenge,
} from './index';

describe('Generating code verifier and challenge', () => {
  it('should generate a valid code verifier', () => {
    const codeVerifier = generateCodeVerifier();

    //Code verifier should have a length between 43 and 128 characters
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier.length).toBeLessThanOrEqual(128);

    //Code verifier should be made up of alphanumeric characters
    expect(codeVerifier).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should generate a valid code challenge from on a code verifier', () => {
    const codeVerifier = generateCodeVerifier(); // TODO add real verifier
    const codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

    expect(codeChallenge).toStrictEqual('1');
  });
});
