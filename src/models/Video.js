import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 180 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now }, //now()라고 적지 않는건 now()라고 쓰면 바로 실행시키나 now라고 쓰면 mongoose가 video object가 생성될때만 실행시켜준다
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

videoSchema.static("formatHashtags", function (hashtags) {
  //formatHashtags라는 function을 만들어서 미들웨어로 끼워넣음
  return hashtags
    .split(",")
    .map(word => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
