import axios from 'axios';
import { pipe } from 'fp-ts/function';
import { toString } from 'ramda';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

type Err = {
  message: string;
  stackTrace: string;
};

const eitherGet = <A>(
  url: string,
  errorHandle: (error: Err) => A,
  okHandle: (ok: A) => A,
) =>
  pipe(
    TE.tryCatch(
      () => axios.get(url),
      (reason) => ({
        message: toString(reason),
        stackTrace: new Error().stack,
      }),
    ),
    TE.map((resp) => resp.data),
    TE.fold(
      (error) => T.of(errorHandle(error)),
      (ok) => T.of(okHandle(ok)),
    ),
  )();

export { eitherGet };
