const express = require("express");
const app = express();
const Path = require("path");
const multer = require("multer");
const userModel = require("./models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, Path.join(__dirname, "public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/read", async (req, res) => {
  try {
    let users = await userModel.find();
    res.render("read", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect("/read");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.get("/edit/:userid", async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.userid });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("edit", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user for edit");
  }
});

app.post("/update/:userid", async (req, res) => {
  try {
    const { name, email, image } = req.body;
    const user = await userModel.findOneAndUpdate(
      { _id: req.params.userid },
      { name, email, image },
      { new: true }
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.redirect("/read");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

app.post("/create", upload.single("imageFile"), async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;
    let imagePath = imageUrl;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    await userModel.create({ name, email, image: imagePath });
    res.redirect("/read");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
