import * as E from 'fp-ts/es6/Either';

export interface SignInLinkData {
  email: string;
}

export type SignInCompletionData = E.Either<string, SignInLinkData>;