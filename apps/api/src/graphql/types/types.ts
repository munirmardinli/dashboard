import type { JsonValue } from '../scalars/jsonScalar.js';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Semantisch JSON-Inhalt von docs/cookie.json (Merge über updateCookie). Laufzeit identisch zu JSON. */
  CookieDocument: { input: JsonValue; output: JsonValue; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  JSON: { input: JsonValue; output: JsonValue; }
  Upload: { input: unknown; output: unknown; }
};

export type ContactListEntry = {
  __typename?: 'ContactListEntry';
  name: Scalars['String']['output'];
  vcfQueryHint: Scalars['String']['output'];
};

export type CookieMergePayload = {
  __typename?: 'CookieMergePayload';
  data: Scalars['CookieDocument']['output'];
  success: Scalars['Boolean']['output'];
};

export type DataItemConnection = {
  __typename?: 'DataItemConnection';
  items: Array<Scalars['JSON']['output']>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  unavailableReason?: Maybe<Scalars['String']['output']>;
};

/** Pagination für tabellarische Listen: 1-basierte Seite und Einträge pro Seite. */
export type DataListPaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

/** Einfeld-Sortierung für Listen (z. B. datas). */
export type DataListSortInput = {
  field?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<SortEnum>;
};

export type FilterInput = {
  items?: InputMaybe<Array<InputMaybe<FilterItem>>>;
  logicOperator?: InputMaybe<LogicOperator>;
};

export type FilterItem = {
  field?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  operator?: InputMaybe<FilterOperator>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type FilterOperator =
  | 'after'
  | 'before'
  | 'contains'
  | 'endsWith'
  | 'equals'
  | 'is'
  | 'not'
  | 'startsWith';

export type LogicOperator =
  | 'and'
  | 'or';

export type Mutation = {
  __typename?: 'Mutation';
  analyzeReceipt: ReceiptAnalyzePayload;
  createDashyItem: Scalars['JSON']['output'];
  createData: Scalars['JSON']['output'];
  deleteDashyItem: Scalars['Boolean']['output'];
  deleteData: Scalars['Boolean']['output'];
  /** Teil-Update; Server merged shallow mit bestehender cookie.json. */
  updateCookie: CookieMergePayload;
  updateDashyItem: Scalars['JSON']['output'];
  updateData?: Maybe<Scalars['JSON']['output']>;
};


export type MutationAnalyzeReceiptArgs = {
  imageBase64: Scalars['String']['input'];
};


export type MutationCreateDashyItemArgs = {
  item: Scalars['JSON']['input'];
  sectionId: Scalars['String']['input'];
};


export type MutationCreateDataArgs = {
  dataType: Scalars['String']['input'];
  item: Scalars['JSON']['input'];
};


export type MutationDeleteDashyItemArgs = {
  itemIndex: Scalars['Int']['input'];
  sectionId: Scalars['String']['input'];
};


export type MutationDeleteDataArgs = {
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationUpdateCookieArgs = {
  updates: Scalars['CookieDocument']['input'];
};


export type MutationUpdateDashyItemArgs = {
  item: Scalars['JSON']['input'];
  itemIndex: Scalars['Int']['input'];
  sectionId: Scalars['String']['input'];
};


export type MutationUpdateDataArgs = {
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
  updates: Scalars['JSON']['input'];
};

export type PortfolioFile = {
  __typename?: 'PortfolioFile';
  base64: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  contact: Scalars['String']['output'];
  contacts: Array<ContactListEntry>;
  /** Persistiertes Cookie (GitHub: docs/cookie.json). */
  cookie: Scalars['CookieDocument']['output'];
  dashy: Scalars['JSON']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  datas: DataItemConnection;
  portfolio: Scalars['JSON']['output'];
  portfolioFile: PortfolioFile;
  randomPie: Scalars['JSON']['output'];
};


export type QueryContactArgs = {
  name: Scalars['String']['input'];
};


export type QueryDataArgs = {
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type QueryDatasArgs = {
  dataType: Scalars['String']['input'];
  pagination?: InputMaybe<DataListPaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<DataListSortInput>;
};


export type QueryPortfolioFileArgs = {
  path: Scalars['String']['input'];
};

export type ReceiptAnalyzePayload = {
  __typename?: 'ReceiptAnalyzePayload';
  data?: Maybe<Scalars['JSON']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SortEnum =
  | 'asc'
  | 'desc';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ContactListEntry: ResolverTypeWrapper<ContactListEntry>;
  CookieDocument: ResolverTypeWrapper<Scalars['CookieDocument']['output']>;
  CookieMergePayload: ResolverTypeWrapper<CookieMergePayload>;
  DataItemConnection: ResolverTypeWrapper<DataItemConnection>;
  DataListPaginationInput: DataListPaginationInput;
  DataListSortInput: DataListSortInput;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  FilterInput: FilterInput;
  FilterItem: FilterItem;
  FilterOperator: FilterOperator;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LogicOperator: LogicOperator;
  Mutation: ResolverTypeWrapper<{}>;
  PortfolioFile: ResolverTypeWrapper<PortfolioFile>;
  Query: ResolverTypeWrapper<{}>;
  ReceiptAnalyzePayload: ResolverTypeWrapper<ReceiptAnalyzePayload>;
  SortEnum: SortEnum;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  ContactListEntry: ContactListEntry;
  CookieDocument: Scalars['CookieDocument']['output'];
  CookieMergePayload: CookieMergePayload;
  DataItemConnection: DataItemConnection;
  DataListPaginationInput: DataListPaginationInput;
  DataListSortInput: DataListSortInput;
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  FilterInput: FilterInput;
  FilterItem: FilterItem;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  PortfolioFile: PortfolioFile;
  Query: {};
  ReceiptAnalyzePayload: ReceiptAnalyzePayload;
  String: Scalars['String']['output'];
  Upload: Scalars['Upload']['output'];
};

export type ContactListEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ContactListEntry'] = ResolversParentTypes['ContactListEntry']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vcfQueryHint?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CookieDocumentScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['CookieDocument'], any> {
  name: 'CookieDocument';
}

export type CookieMergePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['CookieMergePayload'] = ResolversParentTypes['CookieMergePayload']> = {
  data?: Resolver<ResolversTypes['CookieDocument'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataItemConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataItemConnection'] = ResolversParentTypes['DataItemConnection']> = {
  items?: Resolver<Array<ResolversTypes['JSON']>, ParentType, ContextType>;
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unavailableReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  analyzeReceipt?: Resolver<ResolversTypes['ReceiptAnalyzePayload'], ParentType, ContextType, RequireFields<MutationAnalyzeReceiptArgs, 'imageBase64'>>;
  createDashyItem?: Resolver<ResolversTypes['JSON'], ParentType, ContextType, RequireFields<MutationCreateDashyItemArgs, 'item' | 'sectionId'>>;
  createData?: Resolver<ResolversTypes['JSON'], ParentType, ContextType, RequireFields<MutationCreateDataArgs, 'dataType' | 'item'>>;
  deleteDashyItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteDashyItemArgs, 'itemIndex' | 'sectionId'>>;
  deleteData?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteDataArgs, 'dataType' | 'id'>>;
  updateCookie?: Resolver<ResolversTypes['CookieMergePayload'], ParentType, ContextType, RequireFields<MutationUpdateCookieArgs, 'updates'>>;
  updateDashyItem?: Resolver<ResolversTypes['JSON'], ParentType, ContextType, RequireFields<MutationUpdateDashyItemArgs, 'item' | 'itemIndex' | 'sectionId'>>;
  updateData?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType, RequireFields<MutationUpdateDataArgs, 'dataType' | 'id' | 'updates'>>;
};

export type PortfolioFileResolvers<ContextType = any, ParentType extends ResolversParentTypes['PortfolioFile'] = ResolversParentTypes['PortfolioFile']> = {
  base64?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  contact?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryContactArgs, 'name'>>;
  contacts?: Resolver<Array<ResolversTypes['ContactListEntry']>, ParentType, ContextType>;
  cookie?: Resolver<ResolversTypes['CookieDocument'], ParentType, ContextType>;
  dashy?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType, RequireFields<QueryDataArgs, 'dataType' | 'id'>>;
  datas?: Resolver<ResolversTypes['DataItemConnection'], ParentType, ContextType, RequireFields<QueryDatasArgs, 'dataType'>>;
  portfolio?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  portfolioFile?: Resolver<ResolversTypes['PortfolioFile'], ParentType, ContextType, RequireFields<QueryPortfolioFileArgs, 'path'>>;
  randomPie?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
};

export type ReceiptAnalyzePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReceiptAnalyzePayload'] = ResolversParentTypes['ReceiptAnalyzePayload']> = {
  data?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = any> = {
  ContactListEntry?: ContactListEntryResolvers<ContextType>;
  CookieDocument?: GraphQLScalarType;
  CookieMergePayload?: CookieMergePayloadResolvers<ContextType>;
  DataItemConnection?: DataItemConnectionResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  PortfolioFile?: PortfolioFileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReceiptAnalyzePayload?: ReceiptAnalyzePayloadResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};

