import { gql } from "@/models";

export const UPDATE_COOKIE = gql(`
mutation UpdateCookie($updates: CookieDocument!) {
	updateCookie(updates: $updates) {
			success
			data
	}
}
`);

export const POST_DASHY = gql(`
	mutation CreateDashyItem($sectionId: String!, $item: JSON!) {
  createDashyItem(sectionId: $sectionId, item: $item)
		}
`);

export const DELETE_DASHY = gql(`
	mutation DeleteDashyItem($sectionId: String!, $itemIndex: Int!) {
			deleteDashyItem(sectionId: $sectionId, itemIndex: $itemIndex)
	}
`);

export const UPDATE_DASHY = gql(`
	mutation UpdateDashyItem($sectionId: String!, $itemIndex: Int!, $item: JSON!) {
  updateDashyItem(sectionId: $sectionId, itemIndex: $itemIndex, item: $item)
		}
`);

export const DELETE_DATA = gql(`
mutation DeleteData($dataType: String!, $id: String!) {
  deleteData(dataType: $dataType, id: $id)
}
`);

export const POST_DATA = gql(`
mutation CreateData($dataType: String!, $item: JSON!) {
  createData(dataType: $dataType, item: $item)
}
`);

export const UPDATE_DATA = gql(`
mutation UpdateData($dataType: String!, $id: String!, $updates: JSON!) {
  updateData(dataType: $dataType, id: $id, updates: $updates)
}
`);

export const ANALYZE_RECEIPT = gql(`
mutation AnalyzeReceipt($imageBase64: String!) {
  analyzeReceipt(imageBase64: $imageBase64) {
    success
    data
    error
  }
}
`);

export const GET_CONTACT = gql(`
query Contact($name: String!) {
  contact(name: $name)
}
`);

export const GET_CONTACTS_LIST = gql(`
query Contacts {
  contacts {
    name
    vcfQueryHint
  }
}
`);

export const GET_COOKIE = gql(`
query Cookie {
  cookie
}
`);

export const GET_DASHY = gql(`
query Dashy {
  dashy
}
`);

export const GET_DATA = gql(`
query Data($dataType: String!, $id: String!) {
  data(dataType: $dataType, id: $id)
}
`);

export const GET_DATAS = gql(`
  query Datas(
    $dataType: String!
    $pagination: DataListPaginationInput
    $search: String
    $sort: DataListSortInput
  ) {
    datas(dataType: $dataType, pagination: $pagination, search: $search, sort: $sort) {
      items
      total
      page
      limit
      totalPages
      unavailableReason
    }
  }
`);

export const GET_PORTFOLIO = gql(`
query Portfolio {
  portfolio
}
`);

export const GET_PORTFOLIO_FILE = gql(`
query PortfolioFile($path: String!) {
  portfolioFile(path: $path) {
    mimeType
    base64
  }
}
`);

export const GET_RANDOM_PIE = gql(`
query RandomPie {
  randomPie
}
`);
