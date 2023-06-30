export type ModelHooks1<$Model extends Model = Model> = {
  [key in `${'before' | 'after'}:${
    | 'find'
    | 'insert'
    | 'update'
    | 'delete'
  }`]?: ModelHookFunction<$Model>;
};

export type ModelHooks2<$Model extends Model = Model> = {
  [key in `${'before' | 'after'}:${
    | 'find' //
    | 'insert'
    | 'update'
    | 'delete'
  }`]?: ModelHookFunction<$Model>;
};

export type SelectModelKeys<T> = Exclude<
  objection.NonFunctionPropertyNames<T>,
  | 'QueryBuilderType'
  | 'foreignKeyId'
  | `$${string}`
>
