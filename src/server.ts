import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import axios from 'axios';
import { toString } from 'ramda';

const eitherGet = (url: string) =>
  pipe(
    TE.tryCatch(
      () => axios.get(url),
      (reason) => ({
        message: toString(reason),
        stackTrace: new Error().stack,
      }),
    ),
    TE.map((resp) => resp.data),
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
