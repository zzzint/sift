import {
  ArrayPaths,
  Get,
  Json,
  ObjectPaths,
  OmitDeep,
  Paths,
  ArrayValues,
  IsArray,
  IsObject,
} from 'src/util/types';

export type Api<Expected extends Json> = YieldStrategyBuilder<Expected>;
export type ApiBuilder<Available, Selected> = {
  build(): AsyncGenerator<Selected>;
  take<P extends Paths<Available>>(
    path: P
  ): ApiBuilder<
    OmitDeep<Available, P>,
    Selected & { [K in P]: Get<Available, P> }
  >;
};

type YieldStrategyBuilder<Expected extends Json> = {
  yieldEachValue<
    Path extends IsArray<Expected> extends true ? '*' : ArrayPaths<Expected>
  >(
    path: Path
  ): ApiBuilder<
    Path extends '*' ? ArrayValues<Expected> : ArrayValues<Get<Expected, Path>>,
    Path extends '*'
      ? Pick<ArrayValues<Expected>, never>
      : Pick<ArrayValues<Get<Expected, Path>>, never>
  >;

  yieldEachEntry<
    Path extends IsObject<Expected> extends true
      ? '*' | ObjectPaths<Expected>
      : ObjectPaths<Expected>
  >(
    path: Path
  ): ApiBuilder<
    Path extends '*' ? Expected : Get<Expected, Path>,
    Path extends '*' ? Pick<Expected, never> : Pick<Get<Expected, Path>, never>
  >;
};
