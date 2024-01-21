const User = require("../models/user.js");
const { hashPassword, comparePassword } = require("../helpers/auth.js");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  res.json("test is working");
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName) {
      return res.json({ error: "Ad ve soyad girin" });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Sifreyi dogru girin ve 6 karakterden uzun girin",
      });
    }
    if (!email) {
      return res.json({ error: "Email adresi girin" });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "Bu email adresi kullaniliyor" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "Bu email adresi kayitli degil" });
    }
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        {
          email: user.email,
          id: user._id,
          fullName: user.fullName,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(user);
        }
      );
    }
    if (!match) {
      res.json({ error: "Sifre yanlis" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
};
