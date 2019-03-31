const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutation = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
          user: {
            // create relationship between Item and User
            connect: {
              id: ctx.request.userId
            }
          }
        },
      },
      info
    );

    return item;
  },

  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);

    const ownsItem = item.user.id === ctx.request.user.id;
    const hasPermissions = ctx.request.user.permissions.some(perm => ['ADMIN', 'ITEMDELETE'].includes(perm));

    if (!ownsItem && !hasPermissions) {
      throw new Error('You have no permission to do that');
    }

    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info);

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user with email ${email}`);
    }

    const valid = bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  async requestReset(parent, args, ctx, info) {
    const user = ctx.db.query.user({ where: { email: args.email }});
    if (!user) {
      throw new Error(`No such user with email ${args.email}`);
    }

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex'); // generate password reset token
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    const mailResp = await transport.sendMail({
      from: "mariaperedriy@gmail.com",
      to: res.email,
      subject: 'Password reset',
      html: makeANiceEmail(`Your password reset link is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Reset link</a>`)
    });

    return { message: 'Thanks!' };
  },

  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords don\'t match!');
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now - 3600000,

      }
    });

    if (!user) {
      throw new Error('This token is invalid or expired');
    }

    const password = await bcrypt.hash(args.password, 10);

    const updatedUser = await ctx.db.mutation.updateUser({
      where: {email: user.email},
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in');
    }

    const currentUser = await ctx.db.query.user({ where: {id: ctx.request.userId} }, info);
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    return ctx.db.mutation.updateUser({
      where: {
        id: args.userId,
      },
      data: {
        permissions: {
          set: args.permissions
        },
      },
    }, info);
  },

  async addToCart(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that');
    }

    const { userId } = ctx.request;

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      }
    });

    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      }, info)
    }

    return ctx.db.mutation.createCartItem({
      data: {
        quantity: 1,
        item: {
          connect: {
            id: args.id
          }
        },
        user: {
          connect: {
            id: userId
          }
        },
      },
    }, info)
  },

  async removeFromCart(parent, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem({
      where: { id: args.id },
    }, `{ id, user { id } }`);

    if (!cartItem) {
      throw new Error('There is no such item in cart');
    }

    const ownsItem = cartItem.user.id === ctx.request.userId;

    if (!ownsItem) {
      throw new Error('You are not able to do this');
    }

    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info)

  }
};

module.exports = Mutation;
