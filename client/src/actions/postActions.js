import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query {
    posts {
      id
      title
      coverPhotoURL
      numLikes
      author {
        id
        name
        avatarURL
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost(
    $title: String!
    $description: String!
    $repoURL: String!
    $websiteURL: String!
    $coverPhotoURL: String!
  ) {
    createPost(
      title: $title
      description: $description
      repoURL: $repoURL
      websiteURL: $websiteURL
      coverPhotoURL: $coverPhotoURL
    ) {
      id
    }
  }
`;
