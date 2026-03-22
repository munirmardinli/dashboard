/* eslint-disable */
import type { JsonValue } from '../../../api/src/graphql/scalars/jsonScalar.js';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type UpdateCookieMutationVariables = Exact<{
  updates: Scalars['CookieDocument']['input'];
}>;


export type UpdateCookieMutation = { __typename?: 'Mutation', updateCookie: { __typename?: 'CookieMergePayload', success: boolean, data: JsonValue } };

export type CreateDashyItemMutationVariables = Exact<{
  sectionId: Scalars['String']['input'];
  item: Scalars['JSON']['input'];
}>;


export type CreateDashyItemMutation = { __typename?: 'Mutation', createDashyItem: JsonValue };

export type DeleteDashyItemMutationVariables = Exact<{
  sectionId: Scalars['String']['input'];
  itemIndex: Scalars['Int']['input'];
}>;


export type DeleteDashyItemMutation = { __typename?: 'Mutation', deleteDashyItem: boolean };

export type UpdateDashyItemMutationVariables = Exact<{
  sectionId: Scalars['String']['input'];
  itemIndex: Scalars['Int']['input'];
  item: Scalars['JSON']['input'];
}>;


export type UpdateDashyItemMutation = { __typename?: 'Mutation', updateDashyItem: JsonValue };

export type DeleteDataMutationVariables = Exact<{
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
}>;


export type DeleteDataMutation = { __typename?: 'Mutation', deleteData: boolean };

export type CreateDataMutationVariables = Exact<{
  dataType: Scalars['String']['input'];
  item: Scalars['JSON']['input'];
}>;


export type CreateDataMutation = { __typename?: 'Mutation', createData: JsonValue };

export type UpdateDataMutationVariables = Exact<{
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
  updates: Scalars['JSON']['input'];
}>;


export type UpdateDataMutation = { __typename?: 'Mutation', updateData?: JsonValue | null };

export type AnalyzeReceiptMutationVariables = Exact<{
  imageBase64: Scalars['String']['input'];
}>;


export type AnalyzeReceiptMutation = { __typename?: 'Mutation', analyzeReceipt: { __typename?: 'ReceiptAnalyzePayload', success: boolean, data?: JsonValue | null, error?: string | null } };

export type ContactQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type ContactQuery = { __typename?: 'Query', contact: string };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'Query', contacts: Array<{ __typename?: 'ContactListEntry', name: string, vcfQueryHint: string }> };

export type CookieQueryVariables = Exact<{ [key: string]: never; }>;


export type CookieQuery = { __typename?: 'Query', cookie: JsonValue };

export type DashyQueryVariables = Exact<{ [key: string]: never; }>;


export type DashyQuery = { __typename?: 'Query', dashy: JsonValue };

export type DataQueryVariables = Exact<{
  dataType: Scalars['String']['input'];
  id: Scalars['String']['input'];
}>;


export type DataQuery = { __typename?: 'Query', data?: JsonValue | null };

export type DatasQueryVariables = Exact<{
  dataType: Scalars['String']['input'];
  pagination?: InputMaybe<DataListPaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<DataListSortInput>;
}>;


export type DatasQuery = { __typename?: 'Query', datas: { __typename?: 'DataItemConnection', items: Array<JsonValue>, total: number, page: number, limit: number, totalPages: number, unavailableReason?: string | null } };

export type PortfolioQueryVariables = Exact<{ [key: string]: never; }>;


export type PortfolioQuery = { __typename?: 'Query', portfolio: JsonValue };

export type PortfolioFileQueryVariables = Exact<{
  path: Scalars['String']['input'];
}>;


export type PortfolioFileQuery = { __typename?: 'Query', portfolioFile: { __typename?: 'PortfolioFile', mimeType: string, base64: string } };

export type RandomPieQueryVariables = Exact<{ [key: string]: never; }>;


export type RandomPieQuery = { __typename?: 'Query', randomPie: JsonValue };


export const UpdateCookieDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCookie"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updates"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CookieDocument"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCookie"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"updates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]} as unknown as DocumentNode<UpdateCookieMutation, UpdateCookieMutationVariables>;
export const CreateDashyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDashyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"item"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDashyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"item"},"value":{"kind":"Variable","name":{"kind":"Name","value":"item"}}}]}]}}]} as unknown as DocumentNode<CreateDashyItemMutation, CreateDashyItemMutationVariables>;
export const DeleteDashyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDashyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDashyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemIndex"}}}]}]}}]} as unknown as DocumentNode<DeleteDashyItemMutation, DeleteDashyItemMutationVariables>;
export const UpdateDashyItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDashyItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"item"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDashyItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemIndex"}}},{"kind":"Argument","name":{"kind":"Name","value":"item"},"value":{"kind":"Variable","name":{"kind":"Name","value":"item"}}}]}]}}]} as unknown as DocumentNode<UpdateDashyItemMutation, UpdateDashyItemMutationVariables>;
export const DeleteDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteDataMutation, DeleteDataMutationVariables>;
export const CreateDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"item"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}}},{"kind":"Argument","name":{"kind":"Name","value":"item"},"value":{"kind":"Variable","name":{"kind":"Name","value":"item"}}}]}]}}]} as unknown as DocumentNode<CreateDataMutation, CreateDataMutationVariables>;
export const UpdateDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updates"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"updates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updates"}}}]}]}}]} as unknown as DocumentNode<UpdateDataMutation, UpdateDataMutationVariables>;
export const AnalyzeReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AnalyzeReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageBase64"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"analyzeReceipt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"imageBase64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageBase64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<AnalyzeReceiptMutation, AnalyzeReceiptMutationVariables>;
export const ContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Contact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}]}}]} as unknown as DocumentNode<ContactQuery, ContactQueryVariables>;
export const ContactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"vcfQueryHint"}}]}}]}}]} as unknown as DocumentNode<ContactsQuery, ContactsQueryVariables>;
export const CookieDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cookie"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cookie"}}]}}]} as unknown as DocumentNode<CookieQuery, CookieQueryVariables>;
export const DashyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dashy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashy"}}]}}]} as unknown as DocumentNode<DashyQuery, DashyQueryVariables>;
export const DataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Data"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DataQuery, DataQueryVariables>;
export const DatasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Datas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DataListPaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DataListSortInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"datas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dataType"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"unavailableReason"}}]}}]}}]} as unknown as DocumentNode<DatasQuery, DatasQueryVariables>;
export const PortfolioDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Portfolio"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"portfolio"}}]}}]} as unknown as DocumentNode<PortfolioQuery, PortfolioQueryVariables>;
export const PortfolioFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PortfolioFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"portfolioFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"base64"}}]}}]}}]} as unknown as DocumentNode<PortfolioFileQuery, PortfolioFileQueryVariables>;
export const RandomPieDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RandomPie"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"randomPie"}}]}}]} as unknown as DocumentNode<RandomPieQuery, RandomPieQueryVariables>;