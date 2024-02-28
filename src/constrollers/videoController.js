import { render } from "pug";
import Video from "../models/Video";

/* 
Video.find({}).then((error, videos) => {
  if(error) {
    return res.render("server-error")
  }
  return res.render("home", {pageTitle: "Home", videos});
});
console.log("finished")
*/

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "asc" });
  console.log(videos);
  return res.render("home", { pageTitle: "Wetube", videos });
};

export const watch = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", {
    pageTitle: video.title,
    video: video,
  });
};

export const getEdit = async (req, res) => {
  const id = req.params.id;
  const video = await Video.findById(id); //findById를 쓰면 오브젝트 전체를 찾아오고
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", {
    pageTitle: `Edit ${video.title}`,
    video: video,
  });
};

export const postEdit = async (req, res) => {
  const id = req.params.id;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id }); //exists를 쓰면 오브젝트 전체를 찾아오지 않아도 된다.
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title: title,
    description: description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title: title,
      description: description,
      //hashtags: hashtags.split(",").map(word => `#${word}`), //입력값을,로 구분하고 단어들 앞에 #을 붙여주는 로직
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const id = req.params.id;
  await Video.findByIdAndDelete(id);
  //delete video
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), //표현식으로 대소문자 구분없이 keyword를 포함하는걸 찾음
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos: videos });
};
