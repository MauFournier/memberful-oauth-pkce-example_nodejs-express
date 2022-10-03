import {
  generateCodeVerifier,
  generateCodeChallengeFromVerifier,
} from './index';

//Mock the express module so it won't be called during tests
jest.mock('express', () =>
  jest.fn(() => ({
    get: jest.fn(),
    listen: jest.fn(),
  }))
);

describe('Generating code verifier and challenge', () => {
  it('should generate a valid code verifier', () => {
    const codeVerifier = generateCodeVerifier();

    //Code verifier should have a length between 43 and 128 characters/r/KN1n204Qi0
    expect(typeof codeVerifier).toBe('string');

    //Code verifier should have a length between 43 and 128 characters
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier.length).toBeLessThanOrEqual(128);

    // We've confirmed that code verifiers with any of these characters will work
    // ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=,.[]{}()|/!?<>@#$%^&*+~
    expect(codeVerifier).toMatch(
      new RegExp('^[A-Za-z0-9-_=,.\\[\\]{}()|/!?<>@#$%^&*+~]+$')
    );
  });

  it('should generate a valid code challenge from on a code verifier', () => {
    // This test includes a code verifier that we've confirmed to be valid,
    // and a matching code challenge that we've confirmed to be valid
    // for that code verifier.

    // If you decide to implement your own code verifier/callenge generation,
    // (perhaps using a different library or programming language), you should
    // test your code against this test case to ensure that your code is
    // generating valid code challenges.
    const codeVerifier =
      'gJ5HQVMPHuHYqPyYsJciAHll4ZZ4XqOgWKpi6I9mDZ8v9n9q1RdsPiagLdoOFnJcZLDAXBgdV7LICtgotQibiMGkgz5kc2Hud5A5fcxRUtffycBFDY7Q7ecA1zwtLWUT';
    const codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

    expect(codeChallenge).toStrictEqual(
      'XUpkYBbuU55zpezRyX8LPziycl0eSGljWDuSYNZW7uU'
    );
  });
});
