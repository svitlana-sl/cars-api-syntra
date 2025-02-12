import { Request, Response } from "express";
import { User } from "../models/userModel";

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    if (user._id !== id) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const userDetails = await User.findById(id)
      .select("-password")
      .populate("favorites");
    res.status(200).json({ status: "success", data: userDetails });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// Add favorite

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;
    const user = req.user;
    if (!user) {
      res.status(403).json({ message: "Unauthorized!" });
      return;
    }

    if (id !== user._id) {
      res.status(403).json({ message: "Unauthorized!" });
      return;
    }
    // $push doesn't check for duplicates but addToSet
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $addToSet: { favorites: vehicleId },
      },
      { new: true } // This option returns the updated document
    ).populate("favorites");
    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// Remove favorite

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;
    const user = req.user;
    if (!user) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    if (id !== user._id) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $pull: { favorites: vehicleId },
      },
      { new: true }
    )
      .select("-password")
      .populate("favorites");
    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
