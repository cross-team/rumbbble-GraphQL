const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
} = require("graphql");

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    location: { type: GraphQLString },
    avatarURL: { type: GraphQLString },
    bio: { type: GraphQLString },
    githubID: { type: GraphQLInt },
    githubUsername: { type: GraphQLString },
    posts: {
      type: PostType,
      resolve(parentValue, args, request) {
        return Post.find({ author: parentValue.id });
      },
    },
    comments: {
      type: CommentType,
      resolve(parentValue, args, request) {
        return Comment.find({ author: parentValue.id });
      },
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    repoURL: { type: GraphQLString },
    websiteURL: { type: GraphQLString },
    coverPhotoURL: { type: GraphQLString },
    author: {
      type: UserType,
      resolve(parentValue, args, request) {
        return User.findById(parentValue.author);
      },
    },
    comments: {
      type: CommentType,
      resolve(parentValue, args, request) {
        return Comment.find({ post: parentValue.id });
      },
    },
    numLikes: {
      type: GraphQLInt,
      resolve(parentValue, args, request) {
        return Like.find({ post: parentValue.id }).countDocuments();
      },
    },
  }),
});

const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    post: {
      type: PostType,
      resolve(parentValue, args, request) {
        return Post.findById(parentValue.post);
      },
    },
    author: {
      type: UserType,
      resolve(parentValue, args, request) {
        return User.findById(parentValue.author);
      },
    },
  }),
});

const LikeType = new GraphQLObjectType({
  name: "Like",
  fields: () => ({
    post: {
      type: PostType,
      resolve(parentValue, args, request) {
        return Post.findById(parentValue.post);
      },
    },
    author: {
      type: UserType,
      resolve(parentValue, args, request) {
        return User.findById(parentValue.author);
      },
    },
  }),
});

const query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    user: {
      type: UserType,
      resolve(parentValue, args, request) {
        return request.user;
      },
    },
    posts: {
      type: GraphQLList(PostType),
      resolve(parentValue, args, request) {
        return Post.find().limit(20).sort({ _id: -1 }).exec();
      },
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, args, request) {
        return Post.findById(args.id);
      },
    },
    comment: {
      type: CommentType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, args, request) {
        return Comment.findById(args.id);
      },
    },
    like: {
      type: LikeType,
      args: { id: { type: GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, args, request) {
        return Like.findById(args.id);
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createPost: {
      type: PostType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        repoURL: { type: GraphQLNonNull(GraphQLString) },
        websiteURL: { type: GraphQLNonNull(GraphQLString) },
        coverPhotoURL: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args, request) {
        return Post.create({ ...args, author: request.user.id });
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        repoURL: { type: GraphQLString },
        websiteURL: { type: GraphQLString },
        coverPhotoURL: { type: GraphQLString },
      },
      resolve(parentValue, args, request) {
        const { id, ...restargs } = args;
        return Post.findByIdAndUpdate(id, { ...restargs }, { new: true });
      },
    },
    deletePost: {
      type: PostType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parentValue, args, request) {
        const { id } = args;
        Comment.find({ post: id }).remove();
        Like.find({ post: id }).remove();
        return Post.findByIdAndDelete(id);
      },
    },
    createComment: {
      type: CommentType,
      args: {
        content: { type: GraphQLNonNull(GraphQLString) },
        post: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parentValue, args, request) {
        return Comment.create({ ...args, author: request.user.id });
      },
    },
    updateComment: {
      type: CommentType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        content: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args, request) {
        const { id, ...restargs } = args;
        return Comment.findByIdAndUpdate(id, { ...restargs }, { new: true });
      },
    },
    deleteComment: {
      type: CommentType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parentValue, args, request) {
        return Comment.findByIdAndDelete(args.id);
      },
    },
    createLike: {
      type: LikeType,
      args: {
        post: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parentValue, args, request) {
        return Like.create({ ...args, author: request.user.id });
      },
    },
    deleteLike: {
      type: LikeType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parentValue, args, request) {
        return Like.findByIdAndDelete(args.id);
      },
    },
  }),
});

module.exports = new GraphQLSchema({ query, mutation });
