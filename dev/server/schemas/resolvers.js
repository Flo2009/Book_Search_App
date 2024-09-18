const { AuthenticationError } = require('apollo-server-express');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SECRET_KEY = 'mysecretsshhhhh';


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user){
        throw new AuthenticationError("Please Log In!");
      }
      const user = await User.findById(context.user.id).populate('savedBooks');
      return user;
    },
    
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user){
        throw new AuthenticationError("Please Enter your Email!");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid){
        throw new AuthenticationError('Incorrect Password!');
      }
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '2h'});
      return {
        token,
        user,
      };
    },
    //username, email, password 
    addUser: async (parent, { username, email, password }) => {
      console.log(username);
      console.log(email);
      console.log(password);
      // console.log(args);
      const hashedPassword = await bcrypt.hash(password, 5)
      console.log(hashedPassword);
      const user = await User.create(
        
        { username, email, password: hashedPassword } ,
        // { email } ,
        // { password: hashedPassword } ,
        // { new: true }
      );
      
      console.log(user);
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '2h'});
     
      return {
        token,
        user,
      };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (!context.user){
        throw new AuthenticationError('You need to log in!');
      }
      const updatedUser = await User.findAndUpdate(
        context.user_id,
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      ).populate('savedBooks');

      return updatedUser;

    },
    removeBook: async (parent, { bookId }, context) => {
      if (!context.user){
        throw new AuthenticationError('You need to log in!')
      };
      const updatedUser = await User.findbyIdAndUodate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');
      
      return updatedUser;
    },
  },
};

module.exports = resolvers;
