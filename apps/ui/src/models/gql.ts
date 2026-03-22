/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\nmutation UpdateCookie($updates: CookieDocument!) {\n\tupdateCookie(updates: $updates) {\n\t\t\tsuccess\n\t\t\tdata\n\t}\n}\n": typeof types.UpdateCookieDocument,
    "\n\tmutation CreateDashyItem($sectionId: String!, $item: JSON!) {\n  createDashyItem(sectionId: $sectionId, item: $item)\n\t\t}\n": typeof types.CreateDashyItemDocument,
    "\n\tmutation DeleteDashyItem($sectionId: String!, $itemIndex: Int!) {\n\t\t\tdeleteDashyItem(sectionId: $sectionId, itemIndex: $itemIndex)\n\t}\n": typeof types.DeleteDashyItemDocument,
    "\n\tmutation UpdateDashyItem($sectionId: String!, $itemIndex: Int!, $item: JSON!) {\n  updateDashyItem(sectionId: $sectionId, itemIndex: $itemIndex, item: $item)\n\t\t}\n": typeof types.UpdateDashyItemDocument,
    "\nmutation DeleteData($dataType: String!, $id: String!) {\n  deleteData(dataType: $dataType, id: $id)\n}\n": typeof types.DeleteDataDocument,
    "\nmutation CreateData($dataType: String!, $item: JSON!) {\n  createData(dataType: $dataType, item: $item)\n}\n": typeof types.CreateDataDocument,
    "\nmutation UpdateData($dataType: String!, $id: String!, $updates: JSON!) {\n  updateData(dataType: $dataType, id: $id, updates: $updates)\n}\n": typeof types.UpdateDataDocument,
    "\nmutation AnalyzeReceipt($imageBase64: String!) {\n  analyzeReceipt(imageBase64: $imageBase64) {\n    success\n    data\n    error\n  }\n}\n": typeof types.AnalyzeReceiptDocument,
    "\nquery Contact($name: String!) {\n  contact(name: $name)\n}\n": typeof types.ContactDocument,
    "\nquery Contacts {\n  contacts {\n    name\n    vcfQueryHint\n  }\n}\n": typeof types.ContactsDocument,
    "\nquery Cookie {\n  cookie\n}\n": typeof types.CookieDocument,
    "\nquery Dashy {\n  dashy\n}\n": typeof types.DashyDocument,
    "\nquery Data($dataType: String!, $id: String!) {\n  data(dataType: $dataType, id: $id)\n}\n": typeof types.DataDocument,
    "\n  query Datas(\n    $dataType: String!\n    $pagination: DataListPaginationInput\n    $search: String\n    $sort: DataListSortInput\n  ) {\n    datas(dataType: $dataType, pagination: $pagination, search: $search, sort: $sort) {\n      items\n      total\n      page\n      limit\n      totalPages\n      unavailableReason\n    }\n  }\n": typeof types.DatasDocument,
    "\nquery Portfolio {\n  portfolio\n}\n": typeof types.PortfolioDocument,
    "\nquery PortfolioFile($path: String!) {\n  portfolioFile(path: $path) {\n    mimeType\n    base64\n  }\n}\n": typeof types.PortfolioFileDocument,
    "\nquery RandomPie {\n  randomPie\n}\n": typeof types.RandomPieDocument,
};
const documents: Documents = {
    "\nmutation UpdateCookie($updates: CookieDocument!) {\n\tupdateCookie(updates: $updates) {\n\t\t\tsuccess\n\t\t\tdata\n\t}\n}\n": types.UpdateCookieDocument,
    "\n\tmutation CreateDashyItem($sectionId: String!, $item: JSON!) {\n  createDashyItem(sectionId: $sectionId, item: $item)\n\t\t}\n": types.CreateDashyItemDocument,
    "\n\tmutation DeleteDashyItem($sectionId: String!, $itemIndex: Int!) {\n\t\t\tdeleteDashyItem(sectionId: $sectionId, itemIndex: $itemIndex)\n\t}\n": types.DeleteDashyItemDocument,
    "\n\tmutation UpdateDashyItem($sectionId: String!, $itemIndex: Int!, $item: JSON!) {\n  updateDashyItem(sectionId: $sectionId, itemIndex: $itemIndex, item: $item)\n\t\t}\n": types.UpdateDashyItemDocument,
    "\nmutation DeleteData($dataType: String!, $id: String!) {\n  deleteData(dataType: $dataType, id: $id)\n}\n": types.DeleteDataDocument,
    "\nmutation CreateData($dataType: String!, $item: JSON!) {\n  createData(dataType: $dataType, item: $item)\n}\n": types.CreateDataDocument,
    "\nmutation UpdateData($dataType: String!, $id: String!, $updates: JSON!) {\n  updateData(dataType: $dataType, id: $id, updates: $updates)\n}\n": types.UpdateDataDocument,
    "\nmutation AnalyzeReceipt($imageBase64: String!) {\n  analyzeReceipt(imageBase64: $imageBase64) {\n    success\n    data\n    error\n  }\n}\n": types.AnalyzeReceiptDocument,
    "\nquery Contact($name: String!) {\n  contact(name: $name)\n}\n": types.ContactDocument,
    "\nquery Contacts {\n  contacts {\n    name\n    vcfQueryHint\n  }\n}\n": types.ContactsDocument,
    "\nquery Cookie {\n  cookie\n}\n": types.CookieDocument,
    "\nquery Dashy {\n  dashy\n}\n": types.DashyDocument,
    "\nquery Data($dataType: String!, $id: String!) {\n  data(dataType: $dataType, id: $id)\n}\n": types.DataDocument,
    "\n  query Datas(\n    $dataType: String!\n    $pagination: DataListPaginationInput\n    $search: String\n    $sort: DataListSortInput\n  ) {\n    datas(dataType: $dataType, pagination: $pagination, search: $search, sort: $sort) {\n      items\n      total\n      page\n      limit\n      totalPages\n      unavailableReason\n    }\n  }\n": types.DatasDocument,
    "\nquery Portfolio {\n  portfolio\n}\n": types.PortfolioDocument,
    "\nquery PortfolioFile($path: String!) {\n  portfolioFile(path: $path) {\n    mimeType\n    base64\n  }\n}\n": types.PortfolioFileDocument,
    "\nquery RandomPie {\n  randomPie\n}\n": types.RandomPieDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation UpdateCookie($updates: CookieDocument!) {\n\tupdateCookie(updates: $updates) {\n\t\t\tsuccess\n\t\t\tdata\n\t}\n}\n"): (typeof documents)["\nmutation UpdateCookie($updates: CookieDocument!) {\n\tupdateCookie(updates: $updates) {\n\t\t\tsuccess\n\t\t\tdata\n\t}\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation CreateDashyItem($sectionId: String!, $item: JSON!) {\n  createDashyItem(sectionId: $sectionId, item: $item)\n\t\t}\n"): (typeof documents)["\n\tmutation CreateDashyItem($sectionId: String!, $item: JSON!) {\n  createDashyItem(sectionId: $sectionId, item: $item)\n\t\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation DeleteDashyItem($sectionId: String!, $itemIndex: Int!) {\n\t\t\tdeleteDashyItem(sectionId: $sectionId, itemIndex: $itemIndex)\n\t}\n"): (typeof documents)["\n\tmutation DeleteDashyItem($sectionId: String!, $itemIndex: Int!) {\n\t\t\tdeleteDashyItem(sectionId: $sectionId, itemIndex: $itemIndex)\n\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\tmutation UpdateDashyItem($sectionId: String!, $itemIndex: Int!, $item: JSON!) {\n  updateDashyItem(sectionId: $sectionId, itemIndex: $itemIndex, item: $item)\n\t\t}\n"): (typeof documents)["\n\tmutation UpdateDashyItem($sectionId: String!, $itemIndex: Int!, $item: JSON!) {\n  updateDashyItem(sectionId: $sectionId, itemIndex: $itemIndex, item: $item)\n\t\t}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation DeleteData($dataType: String!, $id: String!) {\n  deleteData(dataType: $dataType, id: $id)\n}\n"): (typeof documents)["\nmutation DeleteData($dataType: String!, $id: String!) {\n  deleteData(dataType: $dataType, id: $id)\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation CreateData($dataType: String!, $item: JSON!) {\n  createData(dataType: $dataType, item: $item)\n}\n"): (typeof documents)["\nmutation CreateData($dataType: String!, $item: JSON!) {\n  createData(dataType: $dataType, item: $item)\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation UpdateData($dataType: String!, $id: String!, $updates: JSON!) {\n  updateData(dataType: $dataType, id: $id, updates: $updates)\n}\n"): (typeof documents)["\nmutation UpdateData($dataType: String!, $id: String!, $updates: JSON!) {\n  updateData(dataType: $dataType, id: $id, updates: $updates)\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation AnalyzeReceipt($imageBase64: String!) {\n  analyzeReceipt(imageBase64: $imageBase64) {\n    success\n    data\n    error\n  }\n}\n"): (typeof documents)["\nmutation AnalyzeReceipt($imageBase64: String!) {\n  analyzeReceipt(imageBase64: $imageBase64) {\n    success\n    data\n    error\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Contact($name: String!) {\n  contact(name: $name)\n}\n"): (typeof documents)["\nquery Contact($name: String!) {\n  contact(name: $name)\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Contacts {\n  contacts {\n    name\n    vcfQueryHint\n  }\n}\n"): (typeof documents)["\nquery Contacts {\n  contacts {\n    name\n    vcfQueryHint\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Cookie {\n  cookie\n}\n"): (typeof documents)["\nquery Cookie {\n  cookie\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Dashy {\n  dashy\n}\n"): (typeof documents)["\nquery Dashy {\n  dashy\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Data($dataType: String!, $id: String!) {\n  data(dataType: $dataType, id: $id)\n}\n"): (typeof documents)["\nquery Data($dataType: String!, $id: String!) {\n  data(dataType: $dataType, id: $id)\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Datas(\n    $dataType: String!\n    $pagination: DataListPaginationInput\n    $search: String\n    $sort: DataListSortInput\n  ) {\n    datas(dataType: $dataType, pagination: $pagination, search: $search, sort: $sort) {\n      items\n      total\n      page\n      limit\n      totalPages\n      unavailableReason\n    }\n  }\n"): (typeof documents)["\n  query Datas(\n    $dataType: String!\n    $pagination: DataListPaginationInput\n    $search: String\n    $sort: DataListSortInput\n  ) {\n    datas(dataType: $dataType, pagination: $pagination, search: $search, sort: $sort) {\n      items\n      total\n      page\n      limit\n      totalPages\n      unavailableReason\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery Portfolio {\n  portfolio\n}\n"): (typeof documents)["\nquery Portfolio {\n  portfolio\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery PortfolioFile($path: String!) {\n  portfolioFile(path: $path) {\n    mimeType\n    base64\n  }\n}\n"): (typeof documents)["\nquery PortfolioFile($path: String!) {\n  portfolioFile(path: $path) {\n    mimeType\n    base64\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery RandomPie {\n  randomPie\n}\n"): (typeof documents)["\nquery RandomPie {\n  randomPie\n}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;