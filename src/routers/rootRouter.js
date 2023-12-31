import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../constrollers/userController";
import { home, search } from "../constrollers/videoController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;
