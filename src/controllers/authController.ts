import { Request, Response } from "express";
import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../config/env";
import validator from "validator";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      res.status(403).json({ message: "User already exists" });
      return;
    }
    const isStrongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
    if (!isStrongPassword) {
      res.status(403).json({ message: "Password is not strong enough" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    if (!JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not defined" });
      return;
    }

    const token = jwt.sign(
      {
        _id: newUser._id,
        email: newUser.email,
      },
      JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });
    const userObj = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    };
    if (req.headers.origin === "http://localhost:3000") {
      res.redirect("/");
      return;
    }
    res.status(201).json({ status: "success", data: userObj });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        message: "User does not exist, Please register!",
      });
      return;
    }
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not defined" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
    res.status(200).json({ status: "success", data: userObj });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      maxAge: 1,
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
