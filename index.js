const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const { User } = require("./models");
const app = express();

app.use(bodyParser.json());

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

// Get user details by user_id
app.get("/details/:user_id", authenticateToken, async (req, res) => {
  const userId = req.params.user_id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user details
app.put("/update", authenticateToken, async (req, res) => {
  const updatedUser = req.body;
  try {
    const user = await User.findByPk(updatedUser.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update user details
    await user.update(updatedUser);
    return res.json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get user image by user_id
app.get("/image/:user_id", authenticateToken, async (req, res) => {
  const userId = req.params.user_id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userImage = user.user_image; // Assuming user_image is a URL or file path
    return res.json({ user_image: userImage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Insert a new user
app.post("/insert", authenticateToken, async (req, res) => {
  const newUser = req.body.user_details;
  try {
    const existingUser = await User.findOne({
      where: { user_email: newUser.user_email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }
    // Create a new user
    await User.create(newUser);
    return res.json({ message: "User inserted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a user by user_id
app.delete("/delete/:user_id", authenticateToken, async (req, res) => {
  const userId = req.params.user_id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Delete the user
    await user.destroy();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ... (rest of the code)

app.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});

module.exports = app;
