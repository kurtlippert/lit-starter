import { pipe } from 'fp-ts/function';
import axios from 'axios';
import { toString } from 'ramda';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

type Err = {
  message: string;
  stackTrace: string;
};

const eitherGet = <A, B>(
  url: string,
  errorHandle: (error: Err) => B,
  okHandle: (ok: A) => B,
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

//   console.log(result);
//   /**
//    * {
//    *   _tag: 'Left',
//    *   left: Error: Error: Request failed with status code 500
//    *       at /tmp/either-demo/taskeither.ts:19:19
//    *       at /tmp/either-demo/node_modules/fp-ts/lib/TaskEither.js:94:85
//    *       at processTicksAndRejections (internal/process/task_queues.js:97:5)
//    * }
//    */
// };

export { eitherGet };
