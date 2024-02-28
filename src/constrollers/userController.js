import User from "../models/User";
import fetch from "node-fetch";
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
      errorMessage: "중복된 아이디입니다.",
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
  const user = await User.findOne({ username: username, socialOnly: false });
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
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      email => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avataUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", {
    pageTitle: "회원정보 수정",
    user: req.session.user,
  });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email, username, location },
  } = req;

  const emailAndUsernameExists = await User.exists({
    _id: { $ne: _id },
    $or: [{ email }, { username }],
  });
  if (emailAndUsernameExists) {
    return res.status(400).render("edit-profile", {
      pageTitle: "회원정보 수정",
      errorMessage: "이미 존재하는 아이디/이메일 입니다. 다른걸 사용해주세요.",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "비밀번호 변경" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, passwordConfirm },
  } = req;

  const user = await User.findById(_id);
  const checkPassword = await bcrypt.compare(oldPassword, user.password);

  if (!checkPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }

  if (newPassword !== passwordConfirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }

  user.password = newPassword;
  await user.save();
  // send notification
  return res.redirect("/users/logout");
};

export const see = (req, res) => res.send("See User");
