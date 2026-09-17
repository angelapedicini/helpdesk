import { graphql } from "@/graphql-generated";

export const GET_CATEGORIES = graphql(`
  query Categories($department: Department) {
    categories(department: $department) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);

export const GET_CATEGORY_BY_ID = graphql(`
  query CategoryById($id: Int!) {
    categoryById(id: $id) {
      id
      name
      department
      specificField
      disabled
    }
  }
`);

export const GET_CATEGORY_ACCESSES = graphql(`
  query CategoryAccesses($categoryId: Int) {
    categoryAccesses(categoryId: $categoryId) {
      id
      categoryId
      disabled
      requesterDepartment
      requesterMinRole
    }
  }
`);