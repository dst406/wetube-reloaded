import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  console.log(req.body);
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  const usernameExists = await User.exists({ username: username });
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: pageTitle,
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  if (usernameExists) {
    return res.status(400).render("join", {
      pageTitle: pageTitle,
      errorMessage: "중복된 닉네임입니다.",
    });
  }
  const emailExists = await User.exists({ email });
  if (emailExists) {
    return res.render("join", {
      pageTitle: pageTitle,
      errorMessage: "중복된 이메일입니다.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username: username });
  //const exists = await User.exists({ username: username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: pageTitle,
      errorMessage: "해당 아이디가 존재하지 않습니다.",
    });
  }
  const checkPassword = await bcrypt.compare(password, user.password); //입력받은 패스워드랑 db상에 해시처리된 패스워드 비교
  if (!checkPassword) {
    return res.status(400).render("login", {
      pageTitle: pageTitle,
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
  }
  return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const deleteUser = (req, res) => res.send("Delete User");
export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See User");
