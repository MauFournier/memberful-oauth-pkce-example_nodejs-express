import {
  generateCodeVerifier,
  generateCodeVerifierAndChallenge,
} from './index';

describe('Generating code verifier and challenge', () => {
  it('Generates a valid code verifier', () => {
    const { codeVerifier: code_verifier } = generateCodeVerifierAndChallenge();

    expect(code_verifier).toHaveLength(128);
    expect(code_verifier).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('Generates a valid code challenge that matches the code verifier', () => {
    const { code_verifier, code_challenge } = generateCodeVerifier();
  });
});
