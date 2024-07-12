import { Get, Json, OmitDeep, Paths } from 'src/util/types';

export type Api<
  Expected extends Json,
  Available = Expected,
  Current = Pick<Expected, never>
> = Expected extends (infer U extends Json)[]
  ? ApiConstructor<U, U, Pick<U, never>>
  : ApiConstructor<Expected, Available, Current>;

export interface ApiConstructor<Expected extends Json, Available, Current> {
  build(): AsyncGenerator<Current>;

  take<P extends Paths<Available>>(
    path: P
  ): ApiConstructor<
    Expected,
    OmitDeep<Available, P>,
    Current & { [K in P]: Get<Available, P> }
  >;
}
