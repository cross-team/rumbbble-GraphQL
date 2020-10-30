import { useCallback } from "react";
import { useQuery } from "@apollo/client";

import PostListItem from "components/PostListItem";
import VisibilityDetect from "components/VisibilityDetect";

import { GET_POSTS } from "actions/postActions";

function PostList() {
  const { loading, error, data } = useQuery(GET_POSTS);

  const loadMorePosts = useCallback(() => {
    console.log("loading...");
  }, []);

  if (loading) return null;
  if (error) throw Error(error.message);

  const renderPosts = data.posts.map((post) => (
    <PostListItem key={post.id} {...post} />
  ));

  return (
    <main>
      {renderPosts}
      <VisibilityDetect callback={loadMorePosts} />
    </main>
  );
}

export default PostList;
